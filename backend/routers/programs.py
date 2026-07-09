# ============================================================
# KXGRID — Router: PROGRAMS
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

@router.post("/programs")
async def create_program(data: ProgramCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    program_id = f"prog_{uuid.uuid4().hex[:12]}"
    program_doc = {
        "program_id": program_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "active",
        "total_enrolled": 0,
        "registration_open": data.registration_open,
        "next_batch_date": data.next_batch_date
    }
    await db.programs.insert_one(program_doc)
    return {k: v for k, v in program_doc.items() if k != "_id"}

@router.get("/programs")
async def list_programs():
    programs = await db.programs.find({}, {"_id": 0}).to_list(100)
    return programs

@router.get("/programs/{program_id}")
async def get_program(program_id: str):
    program = await db.programs.find_one({"program_id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

@router.put("/programs/{program_id}")
async def update_program(program_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Update program details including registration status"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Remove protected fields
    data.pop("program_id", None)
    data.pop("created_at", None)
    
    result = await db.programs.update_one(
        {"program_id": program_id},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    
    return {"message": "Program updated"}

class RegistrationToggle(BaseModel):
    registration_open: bool
    next_batch_date: Optional[str] = None

@router.put("/programs/{program_id}/registration")
async def toggle_registration(program_id: str, data: RegistrationToggle, user: dict = Depends(get_current_user)):
    """Toggle program registration open/closed"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    update_data = {"registration_open": data.registration_open}
    if data.next_batch_date:
        update_data["next_batch_date"] = data.next_batch_date
    
    result = await db.programs.update_one(
        {"program_id": program_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    
    status = "opened" if data.registration_open else "closed"
    return {"message": f"Registration {status}", "next_batch_date": data.next_batch_date}

@router.delete("/programs/{program_id}")
async def delete_program(program_id: str, user: dict = Depends(get_current_user)):
    """Delete a program (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.programs.delete_one({"program_id": program_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    
    return {"message": "Program deleted"}

@router.post("/programs/{program_id}/units")
async def create_unit(program_id: str, data: UnitCreate, user: dict = Depends(get_current_user)):
    """Create a new unit for a program (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Verify program exists
    program = await db.programs.find_one({"program_id": program_id}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    # Verify brand exists
    brand = await db.brands.find_one({"brand_id": data.brand_id}, {"_id": 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    unit_id = f"unit_{uuid.uuid4().hex[:12]}"
    unit_doc = {
        "unit_id": unit_id,
        "program_id": program_id,
        **data.model_dump(),
        "brand_name": brand.get("name"),
        "brand_color": brand.get("color"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.program_units.insert_one(unit_doc)
    
    # Update program's brand_ids to include this brand if not already
    await db.programs.update_one(
        {"program_id": program_id},
        {"$addToSet": {"brand_ids": data.brand_id}}
    )
    
    return {k: v for k, v in unit_doc.items() if k != "_id"}

@router.get("/programs/{program_id}/units")
async def get_program_units(program_id: str):
    """Get all units for a program"""
    units = await db.program_units.find(
        {"program_id": program_id},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return units

@router.get("/units/{unit_id}")
async def get_unit(unit_id: str):
    """Get a specific unit"""
    unit = await db.program_units.find_one({"unit_id": unit_id}, {"_id": 0})
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return unit

@router.put("/units/{unit_id}")
async def update_unit(unit_id: str, data: UnitUpdate, user: dict = Depends(get_current_user)):
    """Update a unit (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    
    # If brand_id is being updated, get brand info
    if "brand_id" in update_data:
        brand = await db.brands.find_one({"brand_id": update_data["brand_id"]}, {"_id": 0})
        if brand:
            update_data["brand_name"] = brand.get("name")
            update_data["brand_color"] = brand.get("color")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user["user_id"]
    
    result = await db.program_units.update_one(
        {"unit_id": unit_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    return {"message": "Unit updated"}

@router.delete("/units/{unit_id}")
async def delete_unit(unit_id: str, user: dict = Depends(get_current_user)):
    """Delete a unit (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.program_units.delete_one({"unit_id": unit_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Unit not found")
    
    return {"message": "Unit deleted"}

@router.post("/units/reorder")
async def reorder_units(data: dict, user: dict = Depends(get_current_user)):
    """Reorder units within a program (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    unit_orders = data.get("unit_orders", [])
    for item in unit_orders:
        await db.program_units.update_one(
            {"unit_id": item["unit_id"]},
            {"$set": {"order": item["order"]}}
        )
    
    return {"message": "Units reordered"}

@router.post("/batches")
async def create_batch(data: BatchCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    batch_id = f"batch_{uuid.uuid4().hex[:12]}"
    batch_doc = {
        "batch_id": batch_id,
        **data.model_dump(),
        "students": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "active"
    }
    await db.batches.insert_one(batch_doc)
    return {k: v for k, v in batch_doc.items() if k != "_id"}

@router.get("/batches")
async def list_batches(user: dict = Depends(get_current_user)):
    query = {}
    if user.get("role") == "trainer":
        query["trainer_id"] = user["user_id"]
    batches = await db.batches.find(query, {"_id": 0}).to_list(100)
    return batches

@router.post("/batches/{batch_id}/enroll/{student_id}")
async def enroll_student(batch_id: str, student_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "trainer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.batches.update_one(
        {"batch_id": batch_id},
        {"$addToSet": {"students": student_id}}
    )
    await db.students.update_one(
        {"student_id": student_id},
        {"$set": {"batch_id": batch_id}}
    )
    return {"message": "Student enrolled"}
