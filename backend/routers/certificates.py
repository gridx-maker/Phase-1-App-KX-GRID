# ============================================================
# KXGRID — Router: CERTIFICATES
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

@router.post("/certificates/generate/{student_id}")
async def generate_certificate(student_id: str, program_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin only")
    
    student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
    program = await db.programs.find_one({"program_id": program_id}, {"_id": 0})
    
    if not student or not program:
        raise HTTPException(status_code=404, detail="Student or program not found")
    
    cert_id = f"cert_{uuid.uuid4().hex[:12]}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(f"https://kotlerx.verify/{cert_id}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    cert_doc = {
        "certificate_id": cert_id,
        "student_id": student_id,
        "student_name": student.get("full_name"),
        "program_id": program_id,
        "program_name": program.get("name"),
        "program_type": program.get("program_type"),
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "issued_by": user["user_id"],
        "qr_code": qr_base64,
        "status": "issued",
        "verified": False
    }
    
    await db.certificates.insert_one(cert_doc)
    return {k: v for k, v in cert_doc.items() if k != "_id"}

@router.get("/certificates/student/{student_id}")
async def get_student_certificates(student_id: str, user: dict = Depends(get_current_user)):
    certs = await db.certificates.find({"student_id": student_id}, {"_id": 0}).to_list(50)
    return certs

@router.get("/certificates/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    cert = await db.certificates.find_one({"certificate_id": cert_id}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"valid": True, "certificate": cert}
