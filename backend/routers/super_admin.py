# ============================================================
# KXGRID — Router: SUPER_ADMIN
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

@router.get("/admin/brands")
async def get_all_brands(user: dict = Depends(get_current_user)):
    """Get all brands including hidden ones (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    brands = await db.brands.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return brands

@router.post("/admin/brands")
async def create_brand(data: BrandCreate, user: dict = Depends(get_current_user)):
    """Create a new brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    brand_id = f"brand_{uuid.uuid4().hex[:12]}"
    brand_doc = {
        "brand_id": brand_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.brands.insert_one(brand_doc)
    return {k: v for k, v in brand_doc.items() if k != "_id"}

@router.get("/admin/brands/{brand_id}")
async def get_brand(brand_id: str, user: dict = Depends(get_current_user)):
    """Get a specific brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    brand = await db.brands.find_one({"brand_id": brand_id}, {"_id": 0})
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.put("/admin/brands/{brand_id}")
async def update_brand(brand_id: str, data: BrandUpdate, user: dict = Depends(get_current_user)):
    """Update a brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = user["user_id"]
    
    result = await db.brands.update_one(
        {"brand_id": brand_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"message": "Brand updated"}

@router.delete("/admin/brands/{brand_id}")
async def delete_brand(brand_id: str, user: dict = Depends(get_current_user)):
    """Delete a brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.brands.delete_one({"brand_id": brand_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"message": "Brand deleted"}

@router.post("/admin/brands/{brand_id}/logo")
async def upload_brand_logo(brand_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload logo for a brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Validate file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read file content
    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:  # 2MB limit
        raise HTTPException(status_code=400, detail="File too large (max 2MB)")
    
    # Convert to base64 for storage
    base64_image = base64.b64encode(contents).decode()
    logo_url = f"data:{file.content_type};base64,{base64_image}"
    
    # Update brand
    result = await db.brands.update_one(
        {"brand_id": brand_id},
        {"$set": {"logo_url": logo_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"message": "Logo uploaded", "logo_url": logo_url}

@router.delete("/admin/brands/{brand_id}/logo")
async def delete_brand_logo(brand_id: str, user: dict = Depends(get_current_user)):
    """Remove logo from a brand (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.brands.update_one(
        {"brand_id": brand_id},
        {"$set": {"logo_url": None, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return {"message": "Logo removed"}

@router.post("/admin/brands/reorder")
async def reorder_brands(data: dict, user: dict = Depends(get_current_user)):
    """Reorder brands (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    brand_orders = data.get("brand_orders", [])
    for item in brand_orders:
        await db.brands.update_one(
            {"brand_id": item["brand_id"]},
            {"$set": {"order": item["order"]}}
        )
    
    return {"message": "Brands reordered"}

@router.post("/admin/brands/seed-defaults")
async def seed_default_brands(user: dict = Depends(get_current_user)):
    """Seed default KX brands (admin only) - call once to initialize"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Check if brands already exist
    existing = await db.brands.count_documents({})
    if existing > 0:
        return {"message": f"Brands already exist ({existing} brands). Delete all to re-seed.", "seeded": 0}
    
    default_brands = [
        {"name": "KX CORE", "description": "Foundation programs for essential skills", "color": "#00f0ff", "order": 1},
        {"name": "KX PRO", "description": "Professional-grade advanced training", "color": "#ff6b35", "order": 2},
        {"name": "KX LAB", "description": "Experimental and research programs", "color": "#7c3aed", "order": 3},
        {"name": "KX MEDIA", "description": "Motorsport journalism and broadcasting", "color": "#f59e0b", "order": 4},
        {"name": "KX TECH", "description": "Automotive technology and engineering", "color": "#10b981", "order": 5},
        {"name": "KX RACING", "description": "Professional racing and karting programs", "color": "#ef4444", "order": 6},
        {"name": "KX BUSINESS", "description": "Motorsport business and management", "color": "#6366f1", "order": 7},
        {"name": "KX ACADEMY", "description": "Foundational certification courses", "color": "#14b8a6", "order": 8},
        {"name": "KX EVENTS", "description": "Event management and coordination", "color": "#ec4899", "order": 9},
        {"name": "KX DESIGN", "description": "Automotive and livery design programs", "color": "#8b5cf6", "order": 10},
        {"name": "KX SAFETY", "description": "Safety training and marshal programs", "color": "#22c55e", "order": 11},
        {"name": "KX GLOBAL", "description": "International partnerships and programs", "color": "#0ea5e9", "order": 12},
        {"name": "KX PARTNERS", "description": "Industry collaboration programs", "color": "#f97316", "order": 13},
    ]
    
    for brand_data in default_brands:
        brand_id = f"brand_{uuid.uuid4().hex[:12]}"
        brand_doc = {
            "brand_id": brand_id,
            **brand_data,
            "logo_url": None,
            "is_visible": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": user["user_id"]
        }
        await db.brands.insert_one(brand_doc)
    
    return {"message": f"Seeded {len(default_brands)} default brands", "seeded": len(default_brands)}

@router.get("/admin/partners")
async def get_all_partners(user: dict = Depends(get_current_user)):
    """Get all partners including hidden (admin/super_admin)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    partners = await db.partners.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return partners

@router.post("/admin/partners")
async def create_partner(data: PartnerCreate, user: dict = Depends(get_current_user)):
    """Create a new partner/sponsor"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    partner_id = f"partner_{uuid.uuid4().hex[:12]}"
    partner_doc = {
        "partner_id": partner_id,
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"]
    }
    
    await db.partners.insert_one(partner_doc)
    return {k: v for k, v in partner_doc.items() if k != "_id"}

@router.put("/admin/partners/{partner_id}")
async def update_partner(partner_id: str, data: dict, user: dict = Depends(get_current_user)):
    """Update a partner/sponsor"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data.pop("partner_id", None)
    data.pop("created_at", None)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.partners.update_one(
        {"partner_id": partner_id},
        {"$set": data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {"message": "Partner updated"}

@router.delete("/admin/partners/{partner_id}")
async def delete_partner(partner_id: str, user: dict = Depends(get_current_user)):
    """Delete a partner/sponsor"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.partners.delete_one({"partner_id": partner_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {"message": "Partner deleted"}

@router.post("/super-admin/create-admin")
async def create_admin_account(data: AdminCreate, user: dict = Depends(get_current_user)):
    """Create an admin account (Super Admin only)"""
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin only")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"admin_{uuid.uuid4().hex[:12]}"
    admin_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["user_id"],
        "picture": None
    }
    
    await db.users.insert_one(admin_doc)
    
    # Try to send welcome email
    try:
        if resend.api_key and resend.api_key != 're_placeholder':
            email_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #ffffff;">
                <h1 style="color: #00f0ff; text-align: center;">Welcome to KXGRID Admin</h1>
                <p>Hello {data.name},</p>
                <p>Your Admin account has been created. Here are your login credentials:</p>
                <div style="background: #16213e; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Password:</strong> {data.password}</p>
                </div>
                <p>Please change your password after first login.</p>
                <p style="margin-top: 30px;">Best regards,<br>KX ROOT - Super Admin</p>
            </div>
            """
            resend.Emails.send({
                "from": SENDER_EMAIL,
                "to": data.email,
                "subject": "KXGRID Admin Account Created",
                "html": email_body
            })
    except Exception as e:
        logger.warning(f"Failed to send admin welcome email: {e}")
    
    return {"message": f"Admin account created for {data.email}", "user_id": user_id}

@router.get("/super-admin/admins")
async def get_all_admins(user: dict = Depends(get_current_user)):
    """Get all admin accounts (Super Admin only)"""
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin only")
    
    admins = await db.users.find(
        {"role": "admin"},
        {"_id": 0, "password_hash": 0}
    ).to_list(100)
    
    return admins

@router.delete("/super-admin/admins/{user_id}")
async def delete_admin_account(user_id: str, user: dict = Depends(get_current_user)):
    """Delete an admin account (Super Admin only)"""
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin only")
    
    # Prevent deleting super admin
    admin = await db.users.find_one({"user_id": user_id})
    if admin and admin.get("role") == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot delete Super Admin account")
    
    result = await db.users.delete_one({"user_id": user_id, "role": "admin"})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"message": "Admin account deleted"}

@router.get("/super-admin/dashboard")
async def get_super_admin_dashboard(user: dict = Depends(get_current_user)):
    """Get Super Admin dashboard stats"""
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin only")
    
    # Count various entities
    admin_count = await db.users.count_documents({"role": "admin"})
    brand_head_count = await db.users.count_documents({"role": "brand_head"})
    crew_count = await db.users.count_documents({"role": "trainer"})
    student_count = await db.students.count_documents({})
    program_count = await db.programs.count_documents({})
    brand_count = await db.brands.count_documents({})
    lead_count = await db.leads.count_documents({})
    callback_count = await db.callback_requests.count_documents({"status": "new"})
    
    return {
        "admins": admin_count,
        "brand_heads": brand_head_count,
        "crew": crew_count,
        "students": student_count,
        "programs": program_count,
        "brands": brand_count,
        "total_leads": lead_count,
        "pending_callbacks": callback_count
    }

# Seed Super Admin on startup (if not exists)
async def seed_super_admin():
    """Create the KX ROOT Super Admin if it doesn't exist"""
    try:
        existing = await db.users.find_one({"email": SUPER_ADMIN_EMAIL})
        if not existing:
            super_admin_doc = {
                "user_id": "kx_root_superadmin",
                "email": SUPER_ADMIN_EMAIL,
                "name": "KX ROOT",
                "password_hash": hash_password("KXRoot@2024"),
                "role": "super_admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "picture": None
            }
            await db.users.insert_one(super_admin_doc)
            logger.info("KX ROOT Super Admin created")
    except Exception as e:
        logger.warning(f"Could not seed super admin (will retry on next startup): {e}")
