# ============================================================
# KXGRID — Router: STUDENTS
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

@router.post("/students/register")
async def register_student(data: StudentRegistration, user: dict = Depends(get_current_user)):
    student_id = f"std_{uuid.uuid4().hex[:12]}"
    nfc_card_id = data.nfc_card_id or f"NFC_{uuid.uuid4().hex[:8].upper()}"
    
    student_doc = {
        "student_id": student_id,
        "user_id": data.user_id,
        **data.model_dump(exclude={"user_id", "nfc_card_id"}),
        "nfc_card_id": nfc_card_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "badges": [],
        "total_attendance": 0,
        "average_rating": 0.0
    }
    
    await db.students.insert_one(student_doc)
    await db.users.update_one({"user_id": data.user_id}, {"$set": {"student_id": student_id, "registration_complete": True}})
    
    return {k: v for k, v in student_doc.items() if k != "_id"}

@router.get("/students/profile")
async def get_student_profile(user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not student:
        return {"registered": False}
    return {"registered": True, **student}

@router.put("/students/{student_id}/nfc")
async def assign_nfc_card(student_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Assign or update NFC card for a student (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    nfc_card_id = data.get("nfc_card_id", "").upper()
    if not nfc_card_id:
        raise HTTPException(status_code=400, detail="NFC Card ID required")
    
    # Check if NFC already assigned to another student
    existing = await db.students.find_one({"nfc_card_id": nfc_card_id, "student_id": {"$ne": student_id}})
    if existing:
        raise HTTPException(status_code=400, detail=f"NFC card already assigned to {existing.get('full_name')}")
    
    result = await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"nfc_card_id": nfc_card_id}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"message": f"NFC card {nfc_card_id} assigned", "nfc_card_id": nfc_card_id}

@router.get("/students/nfc/{nfc_id}")
async def get_student_by_nfc(nfc_id: str):
    """Public endpoint for NFC ID card view"""
    student = await db.students.find_one({"nfc_card_id": nfc_id.upper()}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/students/{student_id}")
async def get_student(student_id: str, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/students")
async def list_students(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    return students

@router.get("/student/progress")
async def get_student_progress(user: dict = Depends(get_current_user)):
    """Get current student's unit progress across all programs"""
    student = await db.students.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    student_id = student["student_id"]
    
    # Get all programs
    programs = await db.programs.find({"status": "active"}, {"_id": 0}).to_list(100)
    
    # Get all progress records for this student
    progress_records = await db.student_progress.find(
        {"student_id": student_id},
        {"_id": 0}
    ).to_list(500)
    
    # Create a lookup dict for quick access
    progress_lookup = {p["unit_id"]: p for p in progress_records}
    
    result = []
    for program in programs:
        # Get units for this program
        units = await db.program_units.find(
            {"program_id": program["program_id"]},
            {"_id": 0}
        ).sort("order", 1).to_list(50)
        
        if not units:
            continue
        
        # Enrich units with progress data
        units_with_progress = []
        completed_count = 0
        
        # Batch fetch brands to avoid N+1 queries
        brand_ids = list(set([u.get("brand_id") for u in units if u.get("brand_id")]))
        brands_list = await db.brands.find({"brand_id": {"$in": brand_ids}}, {"_id": 0, "brand_id": 1, "name": 1, "color": 1}).to_list(100) if brand_ids else []
        brands_map = {b["brand_id"]: b for b in brands_list}
        
        for unit in units:
            unit_progress = progress_lookup.get(unit["unit_id"], {
                "status": "not_started",
                "completion_date": None,
                "score": None
            })
            unit["progress"] = unit_progress
            if unit_progress.get("status") == "completed":
                completed_count += 1
            
            brand = brands_map.get(unit.get("brand_id"), {})
            unit["brand_name"] = brand.get("name", "Unknown")
            unit["brand_color"] = brand.get("color", "#00f0ff")
            
            units_with_progress.append(unit)
        
        total_units = len(units)
        progress_percent = round((completed_count / total_units) * 100) if total_units > 0 else 0
        
        result.append({
            "program_id": program["program_id"],
            "program_name": program["name"],
            "program_type": program.get("program_type", "certification"),
            "total_units": total_units,
            "completed_units": completed_count,
            "progress_percent": progress_percent,
            "units": units_with_progress
        })
    
    return result

@router.get("/student/progress/{program_id}")
async def get_student_program_progress(program_id: str, user: dict = Depends(get_current_user)):
    """Get student's progress for a specific program"""
    student = await db.students.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    student_id = student["student_id"]
    
    # Get program
    program = await db.programs.find_one({"program_id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Get units
    units = await db.program_units.find(
        {"program_id": program_id},
        {"_id": 0}
    ).sort("order", 1).to_list(50)
    
    # Get progress records
    progress_records = await db.student_progress.find(
        {"student_id": student_id, "program_id": program_id},
        {"_id": 0}
    ).to_list(50)
    progress_lookup = {p["unit_id"]: p for p in progress_records}
    
    units_with_progress = []
    completed_count = 0
    
    # Batch fetch brands
    brand_ids = list(set([u.get("brand_id") for u in units if u.get("brand_id")]))
    brands_list = await db.brands.find({"brand_id": {"$in": brand_ids}}, {"_id": 0, "brand_id": 1, "name": 1, "color": 1}).to_list(100) if brand_ids else []
    brands_map = {b["brand_id"]: b for b in brands_list}
    
    for unit in units:
        unit_progress = progress_lookup.get(unit["unit_id"], {
            "status": "not_started",
            "completion_date": None,
            "score": None
        })
        unit["progress"] = unit_progress
        if unit_progress.get("status") == "completed":
            completed_count += 1
        
        brand = brands_map.get(unit.get("brand_id"), {})
        unit["brand_name"] = brand.get("name", "Unknown")
        unit["brand_color"] = brand.get("color", "#00f0ff")
        
        units_with_progress.append(unit)
    
    return {
        "program": program,
        "total_units": len(units),
        "completed_units": completed_count,
        "progress_percent": round((completed_count / len(units)) * 100) if units else 0,
        "units": units_with_progress
    }

@router.put("/student/progress/{unit_id}")
async def update_student_unit_progress(
    unit_id: str, 
    data: UnitProgressUpdate, 
    user: dict = Depends(get_current_user)
):
    """Update unit progress (admin/crew can update for students, students can mark in_progress)"""
    # Get the unit to find program_id
    unit = await db.program_units.find_one({"unit_id": unit_id}, {"_id": 0})
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    # Determine whose progress to update
    if user.get("role") in ["admin", "trainer"]:
        # Admin/trainer updating a student's progress - need student_id in query params
        # For now, this endpoint is for self-update; admin uses different endpoint
        student = await db.students.find_one({"user_id": user["user_id"]}, {"_id": 0})
    else:
        student = await db.students.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    student_id = student["student_id"]
    
    # Students can only mark as in_progress, not completed (that requires admin/crew)
    if user.get("role") == "student" and data.status == "completed":
        raise HTTPException(status_code=403, detail="Only trainers/admin can mark units as completed")
    
    progress_data = {
        "student_id": student_id,
        "unit_id": unit_id,
        "program_id": unit["program_id"],
        "status": data.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["user_id"]
    }
    
    if data.completion_date:
        progress_data["completion_date"] = data.completion_date
    if data.score is not None:
        progress_data["score"] = data.score
    if data.notes:
        progress_data["notes"] = data.notes
    
    await db.student_progress.update_one(
        {"student_id": student_id, "unit_id": unit_id},
        {"$set": progress_data},
        upsert=True
    )
    
    return {"message": "Progress updated", "status": data.status}

@router.put("/admin/student/{student_id}/progress/{unit_id}")
async def admin_update_student_progress(
    student_id: str,
    unit_id: str,
    data: UnitProgressUpdate,
    user: dict = Depends(get_current_user)
):
    """Admin/Crew update a student's unit progress"""
    if user.get("role") not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Admin or trainer only")
    
    # Verify student exists
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get the unit
    unit = await db.program_units.find_one({"unit_id": unit_id}, {"_id": 0})
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    progress_data = {
        "student_id": student_id,
        "unit_id": unit_id,
        "program_id": unit["program_id"],
        "status": data.status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["user_id"]
    }
    
    if data.status == "completed" and not data.completion_date:
        progress_data["completion_date"] = datetime.now(timezone.utc).isoformat()
    elif data.completion_date:
        progress_data["completion_date"] = data.completion_date
    
    if data.score is not None:
        progress_data["score"] = data.score
    if data.notes:
        progress_data["notes"] = data.notes
    
    await db.student_progress.update_one(
        {"student_id": student_id, "unit_id": unit_id},
        {"$set": progress_data},
        upsert=True
    )
    
    return {"message": "Progress updated", "status": data.status}

@router.get("/admin/progress/program/{program_id}")
async def get_program_progress_overview(program_id: str, user: dict = Depends(get_current_user)):
    """Get progress overview for all students in a program (admin/crew)"""
    if user.get("role") not in ["admin", "trainer", "brand_head"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get all units for this program
    units = await db.program_units.find(
        {"program_id": program_id},
        {"_id": 0}
    ).sort("order", 1).to_list(50)
    
    if not units:
        return {"program_id": program_id, "units": [], "students": []}
    
    # Get all students
    students = await db.students.find({}, {"_id": 0}).to_list(1000)
    
    # Get all progress records for this program
    progress_records = await db.student_progress.find(
        {"program_id": program_id},
        {"_id": 0}
    ).to_list(5000)
    
    # Group by student
    student_progress = {}
    for record in progress_records:
        sid = record["student_id"]
        if sid not in student_progress:
            student_progress[sid] = {}
        student_progress[sid][record["unit_id"]] = record
    
    # Build result
    result_students = []
    for student in students:
        sid = student["student_id"]
        prog = student_progress.get(sid, {})
        
        completed = sum(1 for u in units if prog.get(u["unit_id"], {}).get("status") == "completed")
        in_progress = sum(1 for u in units if prog.get(u["unit_id"], {}).get("status") == "in_progress")
        
        result_students.append({
            "student_id": sid,
            "student_name": student.get("full_name", "Unknown"),
            "completed_units": completed,
            "in_progress_units": in_progress,
            "total_units": len(units),
            "progress_percent": round((completed / len(units)) * 100) if units else 0,
            "unit_status": {u["unit_id"]: prog.get(u["unit_id"], {"status": "not_started"}) for u in units}
        })
    
    return {
        "program_id": program_id,
        "units": units,
        "students": result_students
    }

@router.get("/analysis/student/{student_id}")
async def get_gap_analysis(student_id: str, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    assessments = await db.assessments.find({"student_id": student_id}, {"_id": 0}).to_list(100)
    
    if not assessments:
        return {
            "student_id": student_id,
            "insights": "No assessments available yet",
            "strong_areas": [],
            "improvement_areas": [],
            "recommendations": []
        }
    
    # Calculate averages per skill
    skills = {
        "skill_control": [],
        "discipline": [],
        "safety_awareness": [],
        "execution": [],
        "teamwork": []
    }
    
    for a in assessments:
        for skill in skills:
            skills[skill].append(a.get(skill, 3))
    
    skill_avgs = {k: sum(v)/len(v) if v else 0 for k, v in skills.items()}
    
    # Determine strong and weak areas
    strong = [k.replace("_", " ").title() for k, v in skill_avgs.items() if v >= 4]
    weak = [k.replace("_", " ").title() for k, v in skill_avgs.items() if v < 3]
    
    # Generate AI insights using Gemini
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"analysis_{student_id}_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert motorsport and automotive education trainer. Provide concise, actionable insights for student improvement."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        prompt = f"""Analyze this motorsport student's performance:
Student: {student.get('full_name', 'Unknown')}
Skill Averages (1-5 scale):
- Skill Control: {skill_avgs['skill_control']:.1f}
- Discipline: {skill_avgs['discipline']:.1f}
- Safety Awareness: {skill_avgs['safety_awareness']:.1f}
- Execution: {skill_avgs['execution']:.1f}
- Teamwork: {skill_avgs['teamwork']:.1f}

Medical conditions: {', '.join(student.get('medical_conditions', [])) or 'None'}

Provide in JSON format:
{{"insights": "2-3 sentence summary", "recommendations": ["3 specific actionable items"], "safety_flags": ["any concerns based on medical/performance"]}}"""
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        import json
        try:
            # Try to parse JSON from response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                ai_response = json.loads(response[json_start:json_end])
            else:
                ai_response = {"insights": response, "recommendations": [], "safety_flags": []}
        except:
            ai_response = {"insights": response, "recommendations": [], "safety_flags": []}
        
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        ai_response = {
            "insights": f"Based on assessments, overall performance is {'good' if student.get('average_rating', 0) >= 3.5 else 'needs improvement'}.",
            "recommendations": ["Focus on weak areas", "Practice consistently", "Follow safety protocols"],
            "safety_flags": []
        }
    
    return {
        "student_id": student_id,
        "student_name": student.get("full_name"),
        "skill_averages": skill_avgs,
        "strong_areas": strong,
        "improvement_areas": weak,
        "ai_insights": ai_response.get("insights", ""),
        "recommendations": ai_response.get("recommendations", []),
        "safety_flags": ai_response.get("safety_flags", []),
        "total_assessments": len(assessments),
        "average_rating": student.get("average_rating", 0)
    }

@router.post("/badges/award")
async def award_badge(student_id: str, badge_type: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["trainer", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    valid_badges = ["batch_leader", "programme_leader", "discipline_champion", "safety_star", "top_performer"]
    if badge_type not in valid_badges:
        raise HTTPException(status_code=400, detail="Invalid badge type")
    
    badge_doc = {
        "badge_type": badge_type,
        "awarded_at": datetime.now(timezone.utc).isoformat(),
        "awarded_by": user["user_id"]
    }
    
    await db.students.update_one(
        {"student_id": student_id},
        {"$push": {"badges": badge_doc}}
    )
    
    return {"message": f"Badge '{badge_type}' awarded", "badge": badge_doc}

@router.post("/upgrades/apply")
async def apply_upgrade(data: UpgradeApplication, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": data.student_id}, {"_id": 0})
    current_program = await db.programs.find_one({"program_id": data.current_program_id}, {"_id": 0})
    target_program = await db.programs.find_one({"program_id": data.target_program_id}, {"_id": 0})
    
    if not all([student, current_program, target_program]):
        raise HTTPException(status_code=404, detail="Invalid data")
    
    # Calculate discount based on current progress
    discount_percent = 15  # Base discount for early upgrade
    
    upgrade_id = f"upg_{uuid.uuid4().hex[:12]}"
    upgrade_doc = {
        "upgrade_id": upgrade_id,
        "student_id": data.student_id,
        "current_program": current_program.get("name"),
        "target_program": target_program.get("name"),
        "discount_percent": discount_percent,
        "status": "pending",
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.upgrades.insert_one(upgrade_doc)
    return {k: v for k, v in upgrade_doc.items() if k != "_id"}

@router.get("/upgrades/available/{student_id}")
async def get_available_upgrades(student_id: str, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get all programs for upgrade paths
    programs = await db.programs.find({}, {"_id": 0}).to_list(100)
    
    upgrade_paths = {
        "certification": ["diploma", "pg_diploma"],
        "diploma": ["pg_diploma"]
    }
    
    available = []
    current_type = "certification"  # Default
    
    for prog in programs:
        if prog.get("program_type") in upgrade_paths.get(current_type, []):
            available.append({
                "program_id": prog["program_id"],
                "name": prog["name"],
                "type": prog["program_type"],
                "discount_available": 15
            })
    
    return available

@router.get("/sessions/missed/{student_id}")
async def get_missed_sessions(student_id: str, user: dict = Depends(get_current_user)):
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get batch schedule and compare with attendance
    batch = await db.batches.find_one({"batch_id": student.get("batch_id")}, {"_id": 0})
    if not batch:
        return {"missed": [], "makeup_available": []}
    
    attendance = await db.attendance.find({"student_id": student_id}, {"_id": 0}).to_list(500)
    attended_dates = set(a["timestamp"][:10] for a in attendance if a.get("timestamp"))
    
    # For demo, return sample missed sessions
    return {
        "missed": [],
        "makeup_available": [],
        "total_missed": 0
    }
