# ============================================================
# KXGRID — Router: BRANDS
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

@router.get("/brands")
async def get_brands():
    """Get all brands (public endpoint - respects visibility)"""
    brands = await db.brands.find({"is_visible": True}, {"_id": 0}).sort("order", 1).to_list(100)
    return brands

@router.get("/brands/{brand_slug}")
async def get_brand_public(brand_slug: str):
    """Get a single brand by slug or ID (public endpoint)"""
    # Try to find by brand_id first
    brand = await db.brands.find_one({"brand_id": brand_slug, "is_visible": True}, {"_id": 0})
    
    # If not found, try to find by name slug (e.g., "kx-core" -> "KX CORE")
    if not brand:
        # Convert slug to possible name: "kx-core" -> "KX CORE"
        name_from_slug = brand_slug.upper().replace("-", " ")
        brand = await db.brands.find_one({"name": name_from_slug, "is_visible": True}, {"_id": 0})
    
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    # Get programs associated with this brand
    programs = await db.programs.find({"brand_id": brand.get("brand_id")}, {"_id": 0}).to_list(50)
    
    # Get trainers/crew assigned to this brand (or all if none assigned)
    trainers = await db.users.find(
        {"role": "trainer", "assigned_brand_id": brand.get("brand_id")},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "email": 1}
    ).to_list(20)
    
    # If no trainers assigned to brand, get all trainers
    if not trainers:
        trainers = await db.users.find(
            {"role": "trainer"},
            {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "email": 1}
        ).to_list(20)
    
    return {
        **brand,
        "programs": programs,
        "trainers": trainers
    }
