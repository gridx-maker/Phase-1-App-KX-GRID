# ============================================================
# KXGRID — Router: ATTENDANCE
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import logging
import os
import base64
import io
import csv
import random
import string
import qrcode
from openpyxl import Workbook
import resend

# Core configurations
from core.database import db
from core.config import twilio_client, SENDER_EMAIL, resend as resend_client
from core.security import get_current_user, hash_password, verify_password, create_token, otp_store

# Shared models
from models import *

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/attendance/mark")
async def mark_attendance(data: AttendanceRecord, user: dict = Depends(get_current_user)):
    # Verify NFC card belongs to student
    student = await db.students.find_one({"nfc_card_id": data.nfc_card_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Invalid NFC card")
    
    attendance_id = f"att_{uuid.uuid4().hex[:12]}"
    timestamp = data.timestamp or datetime.now(timezone.utc).isoformat()
    
    attendance_doc = {
        "attendance_id": attendance_id,
        "student_id": student["student_id"],
        "batch_id": data.batch_id,
        "nfc_card_id": data.nfc_card_id,
        "timestamp": timestamp,
        "gps_location": data.gps_location,
        "session_type": data.session_type,
        "marked_by": user["user_id"],
        "offline_sync": data.offline_sync,
        "synced_at": datetime.now(timezone.utc).isoformat() if data.offline_sync else None
    }
    
    await db.attendance.insert_one(attendance_doc)
    await db.students.update_one(
        {"student_id": student["student_id"]},
        {"$inc": {"total_attendance": 1}}
    )
    
    return {k: v for k, v in attendance_doc.items() if k != "_id"}

@router.post("/attendance/sync")
async def sync_offline_attendance(records: List[AttendanceRecord], user: dict = Depends(get_current_user)):
    synced = []
    for record in records:
        record.offline_sync = True
        result = await mark_attendance(record, user)
        synced.append(result)
    return {"synced": len(synced), "records": synced}

@router.get("/attendance/student/{student_id}")
async def get_student_attendance(student_id: str, user: dict = Depends(get_current_user)):
    records = await db.attendance.find({"student_id": student_id}, {"_id": 0}).to_list(500)
    return records

@router.get("/attendance/batch/{batch_id}")
async def get_batch_attendance(batch_id: str, user: dict = Depends(get_current_user)):
    records = await db.attendance.find({"batch_id": batch_id}, {"_id": 0}).to_list(1000)
    return records

@router.post("/crew/attendance-session/start")
async def start_attendance_session(data: AttendanceSessionCreate, user: dict = Depends(get_current_user)):
    """Crew starts a new attendance session for a specific unit"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    # Verify unit exists
    unit = await db.program_units.find_one({"unit_id": data.unit_id}, {"_id": 0})
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Get brand info
    brand = await db.brands.find_one({"brand_id": unit.get("brand_id")}, {"_id": 0})
    
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    session_doc = {
        "session_id": session_id,
        "unit_id": data.unit_id,
        "unit_name": unit.get("name"),
        "program_id": unit.get("program_id"),
        "brand_id": unit.get("brand_id"),
        "brand_name": brand.get("name") if brand else "Unknown",
        "session_name": data.session_name or f"Session - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}",
        "notes": data.notes,
        "crew_id": user["user_id"],
        "crew_name": user.get("name"),
        "status": "active",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": None,
        "attendance_count": 0,
        "attendees": []
    }
    
    await db.attendance_sessions.insert_one(session_doc)
    return {k: v for k, v in session_doc.items() if k != "_id"}

@router.post("/crew/attendance-session/{session_id}/nfc-tap")
async def record_nfc_attendance(session_id: str, data: NFCAttendanceRequest, user: dict = Depends(get_current_user)):
    """Record attendance when student taps NFC card"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    # Verify session exists and is active
    session = await db.attendance_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get("status") != "active":
        raise HTTPException(status_code=400, detail="Session is not active")
    
    nfc_id = data.nfc_card_id.upper().strip()
    
    # Find student by NFC ID
    student = await db.students.find_one({"nfc_card_id": nfc_id, "status": "active"}, {"_id": 0})
    
    if not student:
        # Also check nfc_users collection
        nfc_user = await db.nfc_users.find_one({"nfc_id": nfc_id, "is_active": True}, {"_id": 0})
        if nfc_user:
            # Find or create student profile
            user_record = await db.users.find_one({"nfc_card_id": nfc_id}, {"_id": 0})
            if user_record:
                student = await db.students.find_one({"user_id": user_record["user_id"]}, {"_id": 0})
        
        if not student:
            raise HTTPException(status_code=404, detail=f"No student found with NFC ID: {nfc_id}")
    
    # Check if already marked attendance in this session
    existing = await db.session_attendance.find_one({
        "session_id": session_id,
        "student_id": student["student_id"]
    })
    if existing:
        return {
            "status": "already_marked",
            "message": f"{student.get('full_name', 'Student')} already marked attendance",
            "student": {
                "student_id": student["student_id"],
                "full_name": student.get("full_name"),
                "nfc_card_id": nfc_id
            },
            "marked_at": existing.get("marked_at")
        }
    
    # Record attendance
    attendance_id = f"satt_{uuid.uuid4().hex[:12]}"
    attendance_doc = {
        "attendance_id": attendance_id,
        "session_id": session_id,
        "unit_id": session.get("unit_id"),
        "program_id": session.get("program_id"),
        "student_id": student["student_id"],
        "student_name": student.get("full_name"),
        "nfc_card_id": nfc_id,
        "marked_by": user["user_id"],
        "marked_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.session_attendance.insert_one(attendance_doc)
    
    # Update session attendance count
    await db.attendance_sessions.update_one(
        {"session_id": session_id},
        {
            "$inc": {"attendance_count": 1},
            "$push": {"attendees": student["student_id"]}
        }
    )
    
    # Update student's total attendance
    await db.students.update_one(
        {"student_id": student["student_id"]},
        {"$inc": {"total_attendance": 1}}
    )
    
    return {
        "status": "success",
        "message": f"Attendance marked for {student.get('full_name', 'Student')}",
        "student": {
            "student_id": student["student_id"],
            "full_name": student.get("full_name"),
            "nfc_card_id": nfc_id,
            "photo_url": student.get("photo_url")
        },
        "attendance_id": attendance_id,
        "marked_at": attendance_doc["marked_at"]
    }

@router.put("/crew/attendance-session/{session_id}/end")
async def end_attendance_session(session_id: str, user: dict = Depends(get_current_user)):
    """End an active attendance session"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    result = await db.attendance_sessions.update_one(
        {"session_id": session_id, "status": "active"},
        {
            "$set": {
                "status": "completed",
                "ended_at": datetime.now(timezone.utc).isoformat(),
                "ended_by": user["user_id"]
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Active session not found")
    
    # Get final session data
    session = await db.attendance_sessions.find_one({"session_id": session_id}, {"_id": 0})
    return session

@router.get("/crew/attendance-sessions")
async def get_crew_sessions(user: dict = Depends(get_current_user)):
    """Get all attendance sessions for the logged-in crew member"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    query = {} if user.get("role") == "admin" else {"crew_id": user["user_id"]}
    sessions = await db.attendance_sessions.find(query, {"_id": 0}).sort("started_at", -1).to_list(100)
    return sessions

@router.get("/crew/attendance-session/{session_id}")
async def get_session_details(session_id: str, user: dict = Depends(get_current_user)):
    """Get details of a specific attendance session including all attendees"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    session = await db.attendance_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all attendance records for this session
    attendance_records = await db.session_attendance.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("marked_at", -1).to_list(500)
    
    session["attendance_records"] = attendance_records
    return session

@router.get("/crew/active-session")
async def get_active_session(user: dict = Depends(get_current_user)):
    """Get the current active session for the crew member"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    session = await db.attendance_sessions.find_one(
        {"crew_id": user["user_id"], "status": "active"},
        {"_id": 0}
    )
    return session

@router.post("/crew/assessment/nfc-submit")
async def submit_nfc_assessment(data: NFCAssessmentCreate, user: dict = Depends(get_current_user)):
    """Submit assessment with NFC confirmation from crew"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    # Verify crew NFC card
    crew_nfc = data.crew_nfc_confirmation.upper().strip()
    
    # Check if NFC belongs to the crew member
    nfc_record = await db.nfc_cards.find_one({"nfc_card_id": crew_nfc, "user_id": user["user_id"], "status": "active"})
    crew_user = await db.users.find_one({"user_id": user["user_id"], "nfc_card_id": crew_nfc})
    nfc_user_record = await db.nfc_users.find_one({"nfc_id": crew_nfc, "is_active": True})
    
    # Allow if NFC matches current user OR if user is admin
    if not (nfc_record or crew_user or (nfc_user_record and user.get("role") == "admin")):
        # For flexibility, also check if NFC belongs to any trainer
        any_crew_nfc = await db.nfc_users.find_one({"nfc_id": crew_nfc, "role": {"$in": ["trainer", "admin"]}, "is_active": True})
        if not any_crew_nfc:
            raise HTTPException(status_code=400, detail="Invalid crew NFC confirmation. Please tap your crew NFC card.")
    
    # Verify student exists
    student = await db.students.find_one({"student_id": data.student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Verify session exists
    session = await db.attendance_sessions.find_one({"session_id": data.session_id}, {"_id": 0})
    
    # Get categories for calculating average
    categories = await db.assessment_categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    category_map = {c["category_id"]: c for c in categories}
    
    # Calculate average rating
    total_rating = 0
    rating_count = 0
    rating_details = []
    
    for cat_id, rating in data.ratings.items():
        category = category_map.get(cat_id)
        if category:
            total_rating += rating
            rating_count += 1
            rating_details.append({
                "category_id": cat_id,
                "category_name": category.get("name"),
                "rating": rating,
                "scale_max": category.get("scale_max", 5)
            })
    
    avg_rating = round(total_rating / rating_count, 2) if rating_count > 0 else 0
    
    # Create assessment record
    assessment_id = f"nfcass_{uuid.uuid4().hex[:12]}"
    assessment_doc = {
        "assessment_id": assessment_id,
        "student_id": data.student_id,
        "student_name": student.get("full_name"),
        "session_id": data.session_id,
        "unit_id": data.unit_id,
        "ratings": data.ratings,
        "rating_details": rating_details,
        "average_rating": avg_rating,
        "notes": data.notes,
        "crew_id": user["user_id"],
        "crew_name": user.get("name"),
        "crew_nfc_confirmation": crew_nfc,
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.nfc_assessments.insert_one(assessment_doc)
    
    # Update student's average rating
    all_assessments = await db.nfc_assessments.find({"student_id": data.student_id}, {"_id": 0}).to_list(500)
    if all_assessments:
        overall_avg = sum(a.get("average_rating", 0) for a in all_assessments) / len(all_assessments)
        await db.students.update_one(
            {"student_id": data.student_id},
            {"$set": {"average_rating": round(overall_avg, 2)}}
        )
    
    return {
        "status": "success",
        "message": f"Assessment submitted for {student.get('full_name')}",
        "assessment_id": assessment_id,
        "average_rating": avg_rating,
        "confirmed_by": user.get("name"),
        "confirmed_at": assessment_doc["confirmed_at"]
    }

@router.get("/crew/assessments/session/{session_id}")
async def get_session_assessments(session_id: str, user: dict = Depends(get_current_user)):
    """Get all assessments for a specific session"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    assessments = await db.nfc_assessments.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return assessments

@router.get("/crew/units")
async def get_units_for_crew(user: dict = Depends(get_current_user)):
    """Get all units available for the crew member (based on their brand if brand-locked)"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    # Check if crew is brand-locked
    assigned_brand = user.get("assigned_brand_id")
    
    if assigned_brand and user.get("role") != "admin":
        # Get units only for assigned brand
        units = await db.program_units.find(
            {"brand_id": assigned_brand},
            {"_id": 0}
        ).sort("order", 1).to_list(100)
    else:
        # Admin can see all units
        units = await db.program_units.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    
    # Enrich with program and brand info
    enriched_units = []
    for unit in units:
        program = await db.programs.find_one({"program_id": unit.get("program_id")}, {"_id": 0, "name": 1})
        brand = await db.brands.find_one({"brand_id": unit.get("brand_id")}, {"_id": 0, "name": 1, "color": 1})
        
        unit["program_name"] = program.get("name") if program else "Unknown"
        unit["brand_name"] = brand.get("name") if brand else "Unknown"
        unit["brand_color"] = brand.get("color", "#00f0ff") if brand else "#00f0ff"
        enriched_units.append(unit)
    
    return enriched_units

@router.post("/assessments")
async def create_assessment(data: AssessmentCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    assessment_id = f"assess_{uuid.uuid4().hex[:12]}"
    avg_rating = (data.skill_control + data.discipline + data.safety_awareness + data.execution + data.teamwork) / 5
    
    assessment_doc = {
        "assessment_id": assessment_id,
        **data.model_dump(),
        "average_rating": round(avg_rating, 2),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assessments.insert_one(assessment_doc)
    
    # Update student average
    all_assessments = await db.assessments.find({"student_id": data.student_id}, {"_id": 0}).to_list(100)
    if all_assessments:
        overall_avg = sum(a["average_rating"] for a in all_assessments) / len(all_assessments)
        await db.students.update_one(
            {"student_id": data.student_id},
            {"$set": {"average_rating": round(overall_avg, 2)}}
        )
    
    return {k: v for k, v in assessment_doc.items() if k != "_id"}

@router.get("/assessments/student/{student_id}")
async def get_student_assessments(student_id: str, user: dict = Depends(get_current_user)):
    assessments = await db.assessments.find({"student_id": student_id}, {"_id": 0}).to_list(100)
    return assessments

@router.get("/crew/dashboard")
async def get_crew_dashboard(user: dict = Depends(get_current_user)):
    """Get crew dashboard data - filtered by assigned brand if applicable"""
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Crew/Admin only")
    
    brand_id = user.get("assigned_brand_id")
    
    # Get brand info if assigned
    brand = None
    if brand_id:
        brand = await db.brands.find_one({"brand_id": brand_id}, {"_id": 0})
    
    # Get programs - filter by brand if assigned
    if brand_id:
        programs = await db.programs.find({"brand_id": brand_id}, {"_id": 0}).to_list(50)
    else:
        programs = await db.programs.find({}, {"_id": 0}).to_list(50)
    
    # Get students - for now all students, could filter by program enrollment later
    students = await db.students.find({}, {"_id": 0}).to_list(100)
    
    # Get batches
    batches = await db.batches.find({}, {"_id": 0}).to_list(50)
    
    # Get recent assessments
    assessments = await db.assessments.find({}).sort("timestamp", -1).to_list(20)
    # Convert ObjectIds for serialization
    assessments = [{k: str(v) if k == "_id" else v for k, v in a.items()} for a in assessments]
    
    return {
        "brand": brand,
        "is_brand_locked": brand_id is not None,
        "programs": programs,
        "students": students[:50],
        "batches": batches,
        "assessments": assessments,
        "stats": {
            "total_programs": len(programs),
            "total_students": len(students),
            "recent_assessments": len(assessments)
        }
    }
