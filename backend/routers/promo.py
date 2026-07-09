# ============================================================
# KXGRID — Router: PROMO
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

@router.get("/promo-banners")
async def get_promo_banners():
    """Get all active promotional banners (public)"""
    banners = await db.promo_banners.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("display_order", 1).to_list(50)
    return banners

@router.get("/admin/promo-banners")
async def get_all_promo_banners(user: dict = Depends(get_current_user)):
    """Get all promotional banners including inactive (admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    banners = await db.promo_banners.find({}, {"_id": 0}).sort("display_order", 1).to_list(50)
    return banners

@router.post("/admin/promo-banners")
async def create_promo_banner(data: PromoBannerCreate, user: dict = Depends(get_current_user)):
    """Create a new promotional banner"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    banner_id = f"banner_{uuid.uuid4().hex[:12]}"
    banner_doc = {
        "banner_id": banner_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.promo_banners.insert_one(banner_doc)
    return {k: v for k, v in banner_doc.items() if k != "_id"}

@router.put("/admin/promo-banners/{banner_id}")
async def update_promo_banner(banner_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Update a promotional banner"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data.pop("banner_id", None)
    data.pop("created_at", None)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.promo_banners.update_one({"banner_id": banner_id}, {"$set": data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner updated"}

@router.delete("/admin/promo-banners/{banner_id}")
async def delete_promo_banner(banner_id: str, user: dict = Depends(get_current_user)):
    """Delete a promotional banner"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.promo_banners.delete_one({"banner_id": banner_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    
    return {"message": "Banner deleted"}

@router.post("/workshop-register")
async def register_for_workshop(data: WorkshopRegistration):
    """Register for a workshop/event (public)"""
    # Check if banner exists and has registration enabled
    banner = await db.promo_banners.find_one({"banner_id": data.banner_id}, {"_id": 0})
    if not banner:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not banner.get("registration_enabled"):
        raise HTTPException(status_code=400, detail="Registration not available for this event")
    
    registration_id = f"reg_{uuid.uuid4().hex[:12]}"
    reg_doc = {
        "registration_id": registration_id,
        "banner_id": data.banner_id,
        "event_title": banner.get("title"),
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "message": data.message,
        "status": "pending",
        "registered_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.workshop_registrations.insert_one(reg_doc)
    return {"message": "Registration successful", "registration_id": registration_id}

@router.get("/admin/workshop-registrations")
async def get_workshop_registrations(user: dict = Depends(get_current_user), banner_id: Optional[str] = None):
    """Get all workshop registrations (admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    query = {}
    if banner_id:
        query["banner_id"] = banner_id
    
    registrations = await db.workshop_registrations.find(query, {"_id": 0}).sort("registered_at", -1).to_list(1000)
    return registrations

@router.get("/admin/workshop-registrations/export")
async def export_workshop_registrations(user: dict = Depends(get_current_user), banner_id: Optional[str] = None):
    """Export workshop registrations as CSV (admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    query = {}
    if banner_id:
        query["banner_id"] = banner_id
    
    registrations = await db.workshop_registrations.find(query, {"_id": 0}).sort("registered_at", -1).to_list(1000)
    
    # Create CSV content
    import csv
    import io
    
    output = io.StringIO()
    if registrations:
        fieldnames = ["registration_id", "event_title", "name", "email", "phone", "message", "status", "registered_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(registrations)
    
    csv_content = output.getvalue()
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=workshop_registrations_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )


