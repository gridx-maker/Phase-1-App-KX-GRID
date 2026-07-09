# ============================================================
# KXGRID — Router: PARTNERS
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

@router.get("/partners")
async def get_partners():
    """Get all visible partners/sponsors (public)"""
    partners = await db.partners.find(
        {"is_visible": True},
        {"_id": 0}
    ).sort("order", 1).to_list(100)
    return partners
