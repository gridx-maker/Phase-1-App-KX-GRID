# ============================================================
# KXGRID — Router: LEADERBOARD
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

@router.get("/leaderboard")
async def get_leaderboard(batch_id: Optional[str] = None, program_id: Optional[str] = None):
    query = {"status": "active"}
    if batch_id:
        query["batch_id"] = batch_id
    
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    
    # Sort by average rating
    sorted_students = sorted(students, key=lambda x: (x.get("average_rating", 0), x.get("total_attendance", 0)), reverse=True)
    
    leaderboard = []
    for rank, student in enumerate(sorted_students[:50], 1):
        leaderboard.append({
            "rank": rank,
            "student_id": student["student_id"],
            "name": student.get("full_name", "Unknown"),
            "average_rating": student.get("average_rating", 0),
            "total_attendance": student.get("total_attendance", 0),
            "badges": student.get("badges", [])
        })
    
    return leaderboard
