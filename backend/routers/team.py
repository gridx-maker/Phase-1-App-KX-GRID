# ============================================================
# KXGRID — Router: TEAM
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

@router.get("/team")
async def get_team_members():
    """Get all active team members (public)"""
    members = await db.team_members.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    return members

@router.get("/team/category/{category}")
async def get_team_by_category(category: str):
    """Get team members by category (public)"""
    members = await db.team_members.find(
        {"is_active": True, "category": category},
        {"_id": 0}
    ).sort("display_order", 1).to_list(100)
    return members

@router.get("/admin/team")
async def get_all_team_members(user: dict = Depends(get_current_user)):
    """Get all team members including inactive (admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    members = await db.team_members.find({}, {"_id": 0}).sort("display_order", 1).to_list(100)
    return members

@router.post("/admin/team")
async def create_team_member(data: TeamMemberCreate, user: dict = Depends(get_current_user)):
    """Create a new team member"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    member_id = f"team_{uuid.uuid4().hex[:12]}"
    member_doc = {
        "member_id": member_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.team_members.insert_one(member_doc)
    return {k: v for k, v in member_doc.items() if k != "_id"}

@router.put("/admin/team/{member_id}")
async def update_team_member(member_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Update a team member"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data.pop("member_id", None)
    data.pop("created_at", None)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.team_members.update_one({"member_id": member_id}, {"$set": data})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"message": "Team member updated"}

@router.delete("/admin/team/{member_id}")
async def delete_team_member(member_id: str, user: dict = Depends(get_current_user)):
    """Delete a team member"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.team_members.delete_one({"member_id": member_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    return {"message": "Team member deleted"}

@router.post("/admin/team/bulk-import")
async def bulk_import_team_members(payload: dict, user: dict = Depends(get_current_user)):
    """Bulk-create team members from a JSON list. Skips entries whose name already exists.
    Body: {"members": [{name, role, category, bio?, photo_url?, photo_base64?, email?, phone?, display_order?, is_active?}, ...]}
    """
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")

    members = payload.get("members") or []
    if not isinstance(members, list) or not members:
        raise HTTPException(status_code=400, detail="members must be a non-empty list")

    created, skipped = [], []
    for m in members:
        name = (m.get("name") or "").strip()
        if not name:
            skipped.append({"reason": "missing name", "entry": m})
            continue
        existing = await db.team_members.find_one({"name": name}, {"_id": 0, "member_id": 1})
        if existing:
            skipped.append({"reason": "duplicate name", "name": name, "member_id": existing["member_id"]})
            continue
        doc = {
            "member_id": f"team_{uuid.uuid4().hex[:12]}",
            "name": name,
            "role": m.get("role", ""),
            "category": m.get("category", "instructor"),
            "bio": m.get("bio", ""),
            "photo_url": m.get("photo_url", ""),
            "photo_base64": m.get("photo_base64", ""),
            "email": m.get("email"),
            "phone": m.get("phone"),
            "display_order": int(m.get("display_order", 0) or 0),
            "is_active": bool(m.get("is_active", True)),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": user["user_id"],
        }
        await db.team_members.insert_one(doc)
        created.append({"member_id": doc["member_id"], "name": doc["name"]})
    return {"created": created, "skipped": skipped, "created_count": len(created), "skipped_count": len(skipped)}

@router.get("/admin/team/export")
async def export_team_members(user: dict = Depends(get_current_user)):
    """Export all team members as JSON for safekeeping/backup."""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    members = await db.team_members.find({}, {"_id": 0}).sort("display_order", 1).to_list(1000)
    return {"count": len(members), "exported_at": datetime.now(timezone.utc).isoformat(), "members": members}
