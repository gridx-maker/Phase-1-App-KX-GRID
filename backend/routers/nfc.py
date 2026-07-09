# ============================================================
# KXGRID — Router: NFC
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

@router.post("/admin/nfc/issue")
async def issue_nfc(data: NFCIssue, user: dict = Depends(get_current_user)):
    """Issue new NFC card to a user"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Check if NFC already exists
    existing = await db.nfc_cards.find_one({"nfc_card_id": data.nfc_card_id.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="NFC Card ID already in use")
    
    nfc_doc = {
        "nfc_card_id": data.nfc_card_id.upper(),
        "user_id": data.user_id,
        "user_type": data.user_type,
        "status": "active",
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "issued_by": user["user_id"]
    }
    
    await db.nfc_cards.insert_one(nfc_doc)
    
    # If student, update their NFC
    if data.user_type == "student":
        await db.students.update_one(
            {"user_id": data.user_id},
            {"$set": {"nfc_card_id": data.nfc_card_id.upper()}}
        )
    
    # Update user record with mobile if needed
    await db.users.update_one(
        {"user_id": data.user_id},
        {"$set": {"nfc_card_id": data.nfc_card_id.upper()}}
    )
    
    return {"message": "NFC Card issued", "nfc_card_id": data.nfc_card_id.upper()}

@router.post("/admin/nfc/replace")
async def replace_nfc(data: NFCReplace, user: dict = Depends(get_current_user)):
    """Replace old NFC with new one - transfers all data"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    old_nfc = data.old_nfc_id.upper()
    new_nfc = data.new_nfc_id.upper()
    
    # Check if new NFC already exists
    existing = await db.nfc_cards.find_one({"nfc_card_id": new_nfc})
    if existing:
        raise HTTPException(status_code=400, detail="New NFC Card ID already in use")
    
    # Find old NFC record
    old_record = await db.nfc_cards.find_one({"nfc_card_id": old_nfc})
    student_record = await db.students.find_one({"nfc_card_id": old_nfc})
    
    if not old_record and not student_record:
        raise HTTPException(status_code=404, detail="Old NFC Card not found")
    
    user_id = old_record["user_id"] if old_record else student_record["user_id"]
    user_type = old_record["user_type"] if old_record else "student"
    
    # Create new NFC record
    new_nfc_doc = {
        "nfc_card_id": new_nfc,
        "user_id": user_id,
        "user_type": user_type,
        "status": "active",
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "issued_by": user["user_id"],
        "replaced_from": old_nfc
    }
    await db.nfc_cards.insert_one(new_nfc_doc)
    
    # Mark old NFC as pending deletion (10 days)
    deletion_date = datetime.now(timezone.utc) + timedelta(days=10)
    
    if old_record:
        await db.nfc_cards.update_one(
            {"nfc_card_id": old_nfc},
            {"$set": {
                "status": "pending_deletion",
                "replaced_by": new_nfc,
                "deletion_scheduled_at": deletion_date.isoformat(),
                "replaced_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    # Update student record
    if student_record:
        await db.students.update_one(
            {"nfc_card_id": old_nfc},
            {"$set": {"nfc_card_id": new_nfc}}
        )
    
    # Update user record
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"nfc_card_id": new_nfc}}
    )
    
    # Create pending deletion record
    await db.pending_nfc_deletions.insert_one({
        "old_nfc_id": old_nfc,
        "new_nfc_id": new_nfc,
        "user_id": user_id,
        "replaced_at": datetime.now(timezone.utc).isoformat(),
        "deletion_due": deletion_date.isoformat(),
        "status": "pending",
        "verified": False
    })
    
    return {
        "message": "NFC replaced successfully",
        "old_nfc": old_nfc,
        "new_nfc": new_nfc,
        "deletion_scheduled": deletion_date.isoformat()
    }

@router.get("/admin/nfc/all")
async def get_all_nfc_cards(user: dict = Depends(get_current_user)):
    """Get all NFC cards with user info"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Get all NFC cards from nfc_cards collection
    nfc_cards = await db.nfc_cards.find({"status": "active"}, {"_id": 0}).to_list(500)
    
    # Get all students with NFC cards
    students_with_nfc = await db.students.find(
        {"nfc_card_id": {"$exists": True, "$ne": None}},
        {"_id": 0, "user_id": 1, "full_name": 1, "nfc_card_id": 1, "mobile": 1, "email": 1}
    ).to_list(500)
    
    # Get all users for reference
    user_ids = set([n.get("user_id") for n in nfc_cards])
    user_ids.update([s.get("user_id") for s in students_with_nfc])
    
    users = await db.users.find(
        {"user_id": {"$in": list(user_ids)}},
        {"_id": 0, "user_id": 1, "name": 1, "email": 1, "role": 1, "nfc_card_id": 1}
    ).to_list(500)
    users_map = {u["user_id"]: u for u in users}
    
    # Build combined list
    result = []
    seen_nfc = set()
    
    # Add from students (most common)
    for s in students_with_nfc:
        nfc_id = s.get("nfc_card_id")
        if nfc_id and nfc_id not in seen_nfc:
            seen_nfc.add(nfc_id)
            user_info = users_map.get(s.get("user_id"), {})
            result.append({
                "nfc_card_id": nfc_id,
                "user_id": s.get("user_id"),
                "name": s.get("full_name") or user_info.get("name"),
                "email": s.get("email") or user_info.get("email"),
                "mobile": s.get("mobile"),
                "user_type": "student",
                "status": "active"
            })
    
    # Add from nfc_cards collection (crew/admin)
    for n in nfc_cards:
        nfc_id = n.get("nfc_card_id")
        if nfc_id and nfc_id not in seen_nfc:
            seen_nfc.add(nfc_id)
            user_info = users_map.get(n.get("user_id"), {})
            result.append({
                "nfc_card_id": nfc_id,
                "user_id": n.get("user_id"),
                "name": user_info.get("name"),
                "email": user_info.get("email"),
                "user_type": n.get("user_type", "unknown"),
                "status": n.get("status", "active"),
                "issued_at": n.get("issued_at")
            })
    
    return result

@router.delete("/admin/nfc/{nfc_card_id}")
async def revoke_nfc_card(nfc_card_id: str, user: dict = Depends(get_current_user)):
    """Revoke/deactivate an NFC card"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    nfc_id = nfc_card_id.upper()
    
    # Update nfc_cards collection
    await db.nfc_cards.update_one(
        {"nfc_card_id": nfc_id},
        {"$set": {"status": "revoked", "revoked_at": datetime.now(timezone.utc).isoformat(), "revoked_by": user["user_id"]}}
    )
    
    # Clear from student record
    await db.students.update_one(
        {"nfc_card_id": nfc_id},
        {"$unset": {"nfc_card_id": ""}}
    )
    
    # Clear from user record
    await db.users.update_one(
        {"nfc_card_id": nfc_id},
        {"$unset": {"nfc_card_id": ""}}
    )
    
    return {"message": "NFC Card revoked"}

@router.get("/admin/nfc/pending-deletions")
async def get_pending_deletions(user: dict = Depends(get_current_user)):
    """Get all NFCs pending deletion"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    pending = await db.pending_nfc_deletions.find(
        {"status": "pending"},
        {"_id": 0}
    ).to_list(100)
    
    # Check which ones are due
    now = datetime.now(timezone.utc)
    for p in pending:
        due_date = datetime.fromisoformat(p["deletion_due"].replace("Z", "+00:00"))
        p["is_due"] = now >= due_date
        p["days_remaining"] = max(0, (due_date - now).days)
    
    return pending

@router.post("/admin/nfc/confirm-deletion/{old_nfc_id}")
async def confirm_nfc_deletion(old_nfc_id: str, user: dict = Depends(get_current_user)):
    """Admin confirms and permanently deletes old NFC"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    old_nfc = old_nfc_id.upper()
    
    # Update pending deletion record
    result = await db.pending_nfc_deletions.update_one(
        {"old_nfc_id": old_nfc, "status": "pending"},
        {"$set": {
            "status": "deleted",
            "verified": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": user["user_id"]
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pending deletion not found")
    
    # Delete old NFC record
    await db.nfc_cards.delete_one({"nfc_card_id": old_nfc})
    
    return {"message": f"NFC {old_nfc} permanently deleted"}
