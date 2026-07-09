"""
Twilio SMS Integration for OTP
"""
import os
import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

router = APIRouter(prefix="/api/sms", tags=["SMS"])

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

# In-memory OTP storage (in production, use Redis or DB)
otp_store = {}

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

def get_twilio_client():
    """Get Twilio client if credentials are configured"""
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_ACCOUNT_SID != 'your_account_sid':
        return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    return None

def generate_otp():
    """Generate a 6-digit OTP"""
    return str(random.randint(100000, 999999))

def normalize_phone(phone: str) -> str:
    """Normalize phone number to E.164 format"""
    phone = phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        if phone.startswith("91"):
            phone = "+" + phone
        else:
            phone = "+91" + phone
    return phone

@router.post("/send-otp")
async def send_otp(data: SendOTPRequest):
    """Send OTP via Twilio SMS"""
    phone = normalize_phone(data.phone)
    otp = generate_otp()
    
    # Store OTP with expiry (5 minutes)
    otp_store[phone] = {
        "otp": otp,
        "created_at": datetime.now(timezone.utc),
        "attempts": 0
    }
    
    client = get_twilio_client()
    
    if client:
        try:
            # Format the from number
            from_number = TWILIO_PHONE_NUMBER
            if not from_number.startswith("+"):
                from_number = "+" + from_number
            
            message = client.messages.create(
                body=f"Your KXGRID verification code is: {otp}. Valid for 5 minutes.",
                from_=from_number,
                to=phone
            )
            return {
                "success": True,
                "message": "OTP sent successfully",
                "phone": phone[-4:].rjust(len(phone), '*'),  # Mask phone
                "sid": message.sid
            }
        except TwilioRestException as e:
            # Log error but don't expose details
            print(f"Twilio Error: {e}")
            # Fallback to mock mode
            return {
                "success": True,
                "message": "OTP sent (demo mode)",
                "phone": phone[-4:].rjust(len(phone), '*'),
                "demo_otp": otp,  # Only in demo mode
                "note": "Twilio error - using demo mode"
            }
    else:
        # Demo mode - return OTP for testing
        return {
            "success": True,
            "message": "OTP sent (demo mode - Twilio not configured)",
            "phone": phone[-4:].rjust(len(phone), '*'),
            "demo_otp": otp
        }

@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    """Verify OTP"""
    phone = normalize_phone(data.phone)
    
    if phone not in otp_store:
        raise HTTPException(status_code=400, detail="No OTP found for this number. Please request a new one.")
    
    stored = otp_store[phone]
    
    # Check if OTP expired (5 minutes)
    elapsed = (datetime.now(timezone.utc) - stored["created_at"]).total_seconds()
    if elapsed > 300:
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    
    # Check attempts
    if stored["attempts"] >= 3:
        del otp_store[phone]
        raise HTTPException(status_code=400, detail="Too many attempts. Please request a new OTP.")
    
    stored["attempts"] += 1
    
    if data.otp == stored["otp"]:
        del otp_store[phone]  # Clear used OTP
        return {"success": True, "message": "OTP verified successfully", "verified": True}
    else:
        raise HTTPException(status_code=400, detail=f"Invalid OTP. {3 - stored['attempts']} attempts remaining.")

@router.get("/status")
async def sms_status():
    """Check Twilio configuration status"""
    client = get_twilio_client()
    return {
        "configured": client is not None,
        "provider": "twilio" if client else "demo",
        "phone_configured": bool(TWILIO_PHONE_NUMBER)
    }
