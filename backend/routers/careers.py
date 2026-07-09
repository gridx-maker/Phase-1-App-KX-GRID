# ============================================================
# KXGRID — Router: CAREERS
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

@router.get("/careers")
async def get_careers():
    """Get all active career opportunities (public)"""
    careers = await db.careers.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with brand info
    for career in careers:
        if career.get("brand_id"):
            brand = await db.brands.find_one({"brand_id": career["brand_id"]}, {"_id": 0, "name": 1, "color": 1})
            if brand:
                career["brand_name"] = brand.get("name")
                career["brand_color"] = brand.get("color", "#00f0ff")
    
    return careers

@router.get("/admin/careers")
async def get_all_careers(user: dict = Depends(get_current_user)):
    """Get all careers including inactive (admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    careers = await db.careers.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return careers

@router.post("/admin/careers")
async def create_career(data: CareerCreate, user: dict = Depends(get_current_user)):
    """Create a new career opportunity"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    career_id = f"career_{uuid.uuid4().hex[:12]}"
    career_doc = {
        "career_id": career_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.careers.insert_one(career_doc)
    return {k: v for k, v in career_doc.items() if k != "_id"}

@router.put("/admin/careers/{career_id}")
async def update_career(career_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Update a career opportunity"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data.pop("career_id", None)
    data.pop("created_at", None)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.careers.update_one({"career_id": career_id}, {"$set": data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Career not found")
    
    return {"message": "Career updated"}

@router.delete("/admin/careers/{career_id}")
async def delete_career(career_id: str, user: dict = Depends(get_current_user)):
    """Delete a career opportunity"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.careers.delete_one({"career_id": career_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Career not found")
    
    return {"message": "Career deleted"}
