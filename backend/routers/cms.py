# ============================================================
# KXGRID — Router: CMS
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

@router.get("/sop")
async def get_sop():
    return {
        "safety_rules": [
            "Always wear protective gear during practical sessions",
            "Follow trainer instructions at all times",
            "Report any equipment malfunction immediately",
            "No mobile phones during active training",
            "Emergency contacts must be updated"
        ],
        "emergency_protocols": [
            "In case of injury, alert trainer immediately",
            "Know the location of first aid kits",
            "Emergency contact: 112 (India)",
            "Fire exits are marked with green signs"
        ],
        "sop_documents": [
            {"name": "Track Safety Guidelines", "version": "2.1"},
            {"name": "Equipment Handling", "version": "1.5"},
            {"name": "Emergency Response", "version": "3.0"}
        ]
    }

@router.get("/cms/settings")
async def get_site_settings():
    """Get public site settings (no auth required)"""
    settings = await db.site_settings.find_one({"setting_id": "main"}, {"_id": 0})
    if not settings:
        # Return defaults
        return SiteSettings().model_dump()
    return settings

@router.put("/cms/settings")
async def update_site_settings(data: dict, user: dict = Depends(get_current_user)):
    """Update site settings (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data["setting_id"] = "main"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = user["user_id"]
    
    await db.site_settings.update_one(
        {"setting_id": "main"},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Settings updated"}

@router.post("/cms/logo/upload")
async def upload_logo(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload logo image (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read and encode as base64
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:  # 2MB limit
        raise HTTPException(status_code=400, detail="Image too large (max 2MB)")
    
    base64_image = base64.b64encode(content).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{base64_image}"
    
    # Save to settings
    await db.site_settings.update_one(
        {"setting_id": "main"},
        {"$set": {
            "logo_image": data_url,
            "logo_updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Logo uploaded", "logo_url": data_url}

class Base64ImageUpload(BaseModel):
    image_base64: str

@router.post("/cms/logo/upload-base64")
async def upload_logo_base64(data: Base64ImageUpload, user: dict = Depends(get_current_user)):
    """Upload logo image as base64 (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    # Validate base64 image
    if not data.image_base64.startswith('data:image/'):
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    # Check size (base64 is ~33% larger than binary)
    if len(data.image_base64) > 3 * 1024 * 1024:  # ~2MB original
        raise HTTPException(status_code=400, detail="Image too large (max 2MB)")
    
    # Save to settings
    await db.site_settings.update_one(
        {"setting_id": "main"},
        {"$set": {
            "logo_image": data.image_base64,
            "logo_updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Logo uploaded", "logo_url": data.image_base64}

@router.delete("/cms/logo")
async def delete_logo(user: dict = Depends(get_current_user)):
    """Delete uploaded logo and revert to text (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    await db.site_settings.update_one(
        {"setting_id": "main"},
        {"$unset": {"logo_image": ""}}
    )
    
    return {"message": "Logo deleted, reverted to text"}

@router.get("/cms/landing")
async def get_landing_content():
    """Get landing page content (public)"""
    content = await db.cms_content.find_one({"$or": [{"page": "landing"}, {"section": "hero"}]}, {"_id": 0})
    if not content:
        # Return defaults
        return {
            "page": "landing",
            "hero_headline_1": "Unified Operating Platform for the KotlerX Ecosystem",
            "hero_headline_2": "Connecting Brands, Programmes, Students, Crew & Partners",
            "hero_headline_3": "NFC + AI-powered Skill Tracking Platform",
            "hero_description": "GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem.",
            "features": [
                {"title": "NFC Identity", "description": "Secure NFC-based student identification"},
                {"title": "AI Analytics", "description": "AI-powered performance gap analysis"},
                {"title": "Multi-Brand Ops", "description": "Unified platform for all departments"},
                {"title": "Certifications", "description": "Industry-recognized certifications"}
            ],
            "stats": {
                "students_trained": "500+",
                "programs": "10+",
                "placement_rate": "95%",
                "industry_partners": "20+"
            }
        }
    return content

@router.put("/cms/landing")
async def update_landing_content(data: dict, user: dict = Depends(get_current_user)):
    """Update landing page content (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data["page"] = "landing"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = user["user_id"]
    
    await db.cms_content.update_one(
        {"page": "landing"},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Landing page updated"}

@router.get("/cms/programs-page")
async def get_programs_page_content():
    """Get programs page content (public)"""
    content = await db.cms_content.find_one({"page": "programs"}, {"_id": 0})
    if not content:
        return {
            "page": "programs",
            "title": "OUR PROGRAMS",
            "subtitle": "Choose your path to motorsport excellence",
            "cta_title": "Already a Student?",
            "cta_subtitle": "Tap your NFC card or enter your NFC ID to access your dashboard"
        }
    return content

@router.put("/cms/programs-page")
async def update_programs_page_content(data: dict, user: dict = Depends(get_current_user)):
    """Update programs page content (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data["page"] = "programs"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.cms_content.update_one(
        {"page": "programs"},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Programs page updated"}

@router.get("/cms/theme")
async def get_theme():
    """Get theme settings (public)"""
    theme = await db.cms_content.find_one({"type": "theme"}, {"_id": 0})
    if not theme:
        return {
            "type": "theme",
            "primary_color": "#00f0ff",
            "secondary_color": "#f59e0b",
            "accent_color": "#ef4444",
            "background_color": "#0a0a0f",
            "surface_color": "#111118",
            "heading_font": "Unbounded",
            "body_font": "Inter",
            "border_radius": "0.75rem"
        }
    return theme

@router.put("/cms/theme")
async def update_theme(data: dict, user: dict = Depends(get_current_user)):
    """Update theme settings (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    data["type"] = "theme"
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_by"] = user["user_id"]
    
    await db.cms_content.update_one(
        {"type": "theme"},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Theme updated"}

@router.get("/media/gallery/{category}")
async def get_media_gallery(category: str):
    """Get media gallery by category (public only shows public, student shows both)"""
    if category == "student":
        # Students can see both public and student content
        items = await db.media_gallery.find(
            {"is_visible": True},
            {"_id": 0}
        ).sort("order", 1).to_list(50)
    else:
        # Public only sees public content
        items = await db.media_gallery.find(
            {"category": "public", "is_visible": True},
            {"_id": 0}
        ).sort("order", 1).to_list(50)
    return items

@router.get("/cms/programme-director")
async def get_programme_director():
    """Get Programme Director info (public)"""
    director = await db.cms_content.find_one({"$or": [{"page": "programme_director"}, {"section": "programme_director"}]}, {"_id": 0})
    if not director:
        return {
            "page": "programme_director",
            "name": "Programme Director",
            "designation": "Director of Programmes",
            "message": "Welcome to KXGRID. Our mission is to nurture the next generation of motorsport professionals through world-class training and industry partnerships.",
            "photo_url": None,
            "photo_base64": None
        }
    return director

@router.put("/cms/programme-director")
async def update_programme_director(data: ProgrammeDirectorUpdate, user: dict = Depends(get_current_user)):
    """Update Programme Director info (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    director_doc = {
        "page": "programme_director",
        **data.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["user_id"]
    }
    
    await db.cms_content.update_one(
        {"page": "programme_director"},
        {"$set": director_doc},
        upsert=True
    )
    
    return {"message": "Programme Director updated"}

@router.get("/cms/contact-info")
async def get_contact_info():
    """Get contact info (public)"""
    contact = await db.cms_content.find_one({"$or": [{"page": "contact_info"}, {"section": "contact"}]}, {"_id": 0})
    if not contact:
        return {
            "page": "contact_info",
            "email": "admissions@kotlerx.com",
            "phone": "+91 98765 43210",
            "whatsapp_number": "+919876543210",
            "location_address": "KotlerX Academy, Motorsport City, India",
            "location_maps_url": "https://maps.google.com",
            "heading_text": "Questions? Please get in touch",
            "subheading_text": "Our admission team will be happy to discuss your options"
        }
    return contact

@router.put("/cms/contact-info")
async def update_contact_info(data: ContactInfoUpdate, user: dict = Depends(get_current_user)):
    """Update contact info (admin only)"""
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    contact_doc = {
        "page": "contact_info",
        **data.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": user["user_id"]
    }
    
    await db.cms_content.update_one(
        {"page": "contact_info"},
        {"$set": contact_doc},
        upsert=True
    )
    
    return {"message": "Contact info updated"}
