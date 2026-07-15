# ============================================================
# KXGRID — Router: AUTH
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import logging
import os
import httpx
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
from core.config import twilio_client, SENDER_EMAIL, resend as resend_client, TWILIO_PHONE_NUMBER
from core.security import get_current_user, hash_password, verify_password, create_token, otp_store

# Shared models
from models import *

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "picture": None
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, data.role)
    return {"token": token, "user_id": user_id, "role": data.role, "name": data.name, "email": data.email}

@router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user.get("role", "student"))
    return {"token": token, "user_id": user["user_id"], "role": user.get("role"), "name": user["name"], "email": user["email"]}

@router.post("/auth/session")
async def create_session(request: Request, response: Response):
    # Google OAuth via Emergent AI has been removed.
    # Implement your own OAuth provider here.
    raise HTTPException(status_code=501, detail="OAuth session login not configured")

@router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password_hash"}

@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}

@router.post("/otp/send")
async def send_otp(data: OTPRequest):
    use_mock = os.environ.get("USE_MOCK_OTP", "false").lower() == "true"
    
    if use_mock:
        otp = "123456"
        logger.info(f"MOCK OTP for {data.phone}: {otp}")
    else:
        otp = ''.join(random.choices(string.digits, k=6))
        
        # Send OTP via Twilio
        if twilio_client and TWILIO_PHONE_NUMBER:
            try:
                message = twilio_client.messages.create(
                    body=f"Your KXGRID verification code is: {otp}. Valid for 10 minutes.",
                    from_=TWILIO_PHONE_NUMBER,
                    to=data.phone
                )
                logger.info(f"OTP sent to {data.phone} via Twilio. SID: {message.sid}")
            except Exception as e:
                logger.error(f"Failed to send OTP via Twilio (Likely trial account unverified number): {e}")
                logger.info(f"Using fallback MOCK OTP: 123456")
                otp = "123456"
        else:
            logger.warning(f"Twilio not configured. OTP for {data.phone}: {otp}")
    
    otp_store[data.phone] = otp
    
    return {"status": "sent", "message": "OTP sent successfully"}

@router.post("/otp/verify")
async def verify_otp(data: OTPVerify):
    stored_otp = otp_store.get(data.phone)
    if not stored_otp or stored_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    del otp_store[data.phone]
    return {"valid": True, "message": "OTP verified"}

@router.post("/auth/nfc-login")
async def nfc_login(data: NFCLogin):
    """Login using NFC Card ID - works for students, crew, and admin"""
    nfc_id = data.nfc_card_id.upper()
    
    # Check in students
    student = await db.students.find_one({"nfc_card_id": nfc_id, "status": "active"}, {"_id": 0})
    if student:
        user = await db.users.find_one({"user_id": student["user_id"]}, {"_id": 0})
        if user:
            token = create_token(user["user_id"], user.get("role", "student"))
            return {"token": token, "user_id": user["user_id"], "role": user.get("role"), "name": student.get("full_name", user.get("name")), "nfc_card_id": nfc_id}
    
    # Check in crew/admin NFC records
    nfc_record = await db.nfc_cards.find_one({"nfc_card_id": nfc_id, "status": "active"}, {"_id": 0})
    if nfc_record:
        user = await db.users.find_one({"user_id": nfc_record["user_id"]}, {"_id": 0})
        if user:
            token = create_token(user["user_id"], user.get("role", "student"))
            return {"token": token, "user_id": user["user_id"], "role": user.get("role"), "name": user.get("name"), "nfc_card_id": nfc_id}
    
    raise HTTPException(status_code=404, detail="NFC Card not found or inactive")

@router.post("/auth/nfc-password-login")
async def nfc_password_login(data: NFCPasswordLogin):
    """Login using NFC ID + Password"""
    nfc_id = data.nfc_card_id.upper().strip()
    
    # Check in nfc_users collection (bulk uploaded users)
    nfc_user = await db.nfc_users.find_one({"nfc_id": nfc_id, "is_active": True}, {"_id": 0})
    
    if not nfc_user:
        raise HTTPException(status_code=404, detail="NFC ID not found or not activated")
    
    # Verify password
    stored_password = nfc_user.get("password", DEFAULT_NFC_PASSWORD)
    
    # Check if password is hashed or plain
    if stored_password.startswith("$2"):
        # Hashed password
        if not bcrypt.checkpw(data.password.encode('utf-8'), stored_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid password")
    else:
        # Plain text password (default)
        if data.password != stored_password:
            raise HTTPException(status_code=401, detail="Invalid password")
    
    # Check if user account exists, if not create one
    user = await db.users.find_one({"nfc_card_id": nfc_id}, {"_id": 0, "password": 0})
    
    if not user:
        # Create user account from NFC user data
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "name": nfc_user.get("name", "NFC User"),
            "email": nfc_user.get("email"),
            "mobile": nfc_user.get("mobile"),
            "role": nfc_user.get("role", "student"),
            "nfc_card_id": nfc_id,
            "password_changed": nfc_user.get("password_changed", False),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        user = {k: v for k, v in user_doc.items() if k not in ["_id", "password"]}
        
        # Also create student profile if role is student
        if user_doc["role"] == "student":
            student_doc = {
                "student_id": f"std_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "full_name": nfc_user.get("name"),
                "mobile": nfc_user.get("mobile"),
                "email": nfc_user.get("email"),
                "nfc_card_id": nfc_id,
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.students.insert_one(student_doc)
    
    # Generate token
    token = create_token(user["user_id"], user.get("role", "student"))
    
    # Check if first login (password not changed)
    is_first_login = not nfc_user.get("password_changed", False)
    
    return {
        "token": token,
        "user_id": user["user_id"],
        "role": user.get("role", "student"),
        "name": user.get("name"),
        "nfc_card_id": nfc_id,
        "is_first_login": is_first_login,
        "show_password_reset_reminder": is_first_login
    }

@router.post("/auth/request-password-reset")
async def request_password_reset(data: PasswordResetRequest):
    """Request OTP for password reset"""
    mobile = data.mobile.strip()
    
    # Find user by mobile
    user = await db.users.find_one({"mobile": mobile}, {"_id": 0, "password": 0})
    if not user:
        # Check in students
        student = await db.students.find_one({"mobile": mobile}, {"_id": 0})
        if student:
            user = await db.users.find_one({"user_id": student["user_id"]}, {"_id": 0, "password": 0})
    
    if not user:
        # Check in nfc_users
        nfc_user = await db.nfc_users.find_one({"mobile": mobile}, {"_id": 0})
        if not nfc_user:
            raise HTTPException(status_code=404, detail="Mobile number not registered")
    
    # Generate OTP (mocked for now - will integrate Twilio later)
    otp = "123456"  # TODO: Replace with Twilio
    
    # Store OTP with expiry
    await db.otp_requests.update_one(
        {"mobile": mobile},
        {
            "$set": {
                "mobile": mobile,
                "otp": otp,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
                "verified": False
            }
        },
        upsert=True
    )
    
    # TODO: Send SMS via Twilio
    logger.info(f"OTP for {mobile}: {otp} (MOCKED - will send via Twilio)")
    
    return {"message": "OTP sent to your mobile number", "mobile": mobile[-4:].rjust(len(mobile), '*')}

@router.post("/auth/verify-reset-password")
async def verify_and_reset_password(data: PasswordResetVerify):
    """Verify OTP and reset password"""
    mobile = data.mobile.strip()
    
    # Verify OTP
    otp_record = await db.otp_requests.find_one({"mobile": mobile}, {"_id": 0})
    if not otp_record:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    # Check expiry
    expires_at = datetime.fromisoformat(otp_record["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    # Verify OTP
    if otp_record["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Hash new password
    hashed_password = bcrypt.hashpw(data.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Update password in users collection
    user = await db.users.find_one({"mobile": mobile})
    if user:
        await db.users.update_one(
            {"mobile": mobile},
            {"$set": {"password": hashed_password, "password_changed": True}}
        )
    
    # Also update in nfc_users if exists
    nfc_user = await db.nfc_users.find_one({"mobile": mobile})
    if nfc_user:
        await db.nfc_users.update_one(
            {"mobile": mobile},
            {"$set": {"password": hashed_password, "password_changed": True}}
        )
    
    # Check students
    student = await db.students.find_one({"mobile": mobile})
    if student:
        await db.users.update_one(
            {"user_id": student["user_id"]},
            {"$set": {"password": hashed_password, "password_changed": True}}
        )
    
    # Mark OTP as used
    await db.otp_requests.delete_one({"mobile": mobile})
    
    return {"message": "Password reset successfully"}

@router.put("/auth/change-password")
async def change_password(new_password: str, user: dict = Depends(get_current_user)):
    """Change password for logged-in user"""
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"password": hashed_password, "password_changed": True}}
    )
    
    # Also update nfc_users if exists
    nfc_id = user.get("nfc_card_id")
    if nfc_id:
        await db.nfc_users.update_one(
            {"nfc_id": nfc_id},
            {"$set": {"password": hashed_password, "password_changed": True}}
        )
    
    return {"message": "Password changed successfully"}

@router.post("/auth/mobile-login")
async def mobile_login(data: MobileLogin):
    """Login using verified mobile number"""
    mobile = data.mobile
    
    # Check in students
    student = await db.students.find_one({"mobile": mobile, "status": "active"}, {"_id": 0})
    if student:
        user = await db.users.find_one({"user_id": student["user_id"]}, {"_id": 0})
        if user:
            token = create_token(user["user_id"], user.get("role", "student"))
            return {"token": token, "user_id": user["user_id"], "role": user.get("role"), "name": student.get("full_name", user.get("name"))}
    
    # Check in users directly (for crew/admin who may have mobile linked)
    user = await db.users.find_one({"mobile": mobile}, {"_id": 0})
    if user:
        token = create_token(user["user_id"], user.get("role", "student"))
        return {"token": token, "user_id": user["user_id"], "role": user.get("role"), "name": user.get("name")}
    
    raise HTTPException(status_code=404, detail="Mobile number not registered")
