"""
Google Sheets Auto-sync for Students, Assessments, Attendance
"""
import os
import json
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import gspread
from google.oauth2.service_account import Credentials

router = APIRouter(prefix="/api/sheets", tags=["Google Sheets"])

# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
SPREADSHEET_ID = os.environ.get('GOOGLE_SPREADSHEET_ID')

def get_gspread_client():
    """Get Google Sheets client if credentials are configured"""
    if GOOGLE_SHEETS_CREDENTIALS:
        try:
            creds_dict = json.loads(GOOGLE_SHEETS_CREDENTIALS)
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
            creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
            return gspread.authorize(creds)
        except Exception as e:
            print(f"Google Sheets auth error: {e}")
    return None

class SyncRequest(BaseModel):
    spreadsheet_id: Optional[str] = None
    sheet_name: str = "Students"

class ExportResponse(BaseModel):
    success: bool
    message: str
    rows_exported: int = 0
    spreadsheet_url: Optional[str] = None

# Placeholder for database access - will be injected from main app
db = None

def set_database(database):
    global db
    db = database

@router.get("/status")
async def sheets_status():
    """Check Google Sheets configuration status"""
    client = get_gspread_client()
    return {
        "configured": client is not None,
        "spreadsheet_configured": bool(SPREADSHEET_ID),
        "note": "Configure GOOGLE_SHEETS_CREDENTIALS env var with service account JSON"
    }

@router.post("/export/students")
async def export_students(data: SyncRequest):
    """Export all students to Google Sheets"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    client = get_gspread_client()
    if not client:
        # Return mock response for demo
        students = await db.students.find({}, {"_id": 0}).to_list(1000)
        return {
            "success": True,
            "message": "Demo mode - Google Sheets not configured",
            "rows_exported": len(students),
            "data_preview": students[:5] if students else []
        }
    
    try:
        spreadsheet_id = data.spreadsheet_id or SPREADSHEET_ID
        if not spreadsheet_id:
            raise HTTPException(status_code=400, detail="Spreadsheet ID required")
        
        spreadsheet = client.open_by_key(spreadsheet_id)
        
        # Get or create sheet
        try:
            sheet = spreadsheet.worksheet(data.sheet_name)
        except gspread.WorksheetNotFound:
            sheet = spreadsheet.add_worksheet(title=data.sheet_name, rows=1000, cols=20)
        
        # Fetch students
        students = await db.students.find({}, {"_id": 0}).to_list(1000)
        
        if not students:
            return {"success": True, "message": "No students to export", "rows_exported": 0}
        
        # Prepare headers and data
        headers = ["Student ID", "Full Name", "Email", "Phone", "Program", "Status", "NFC Card", "Created At"]
        rows = [headers]
        
        for s in students:
            rows.append([
                s.get("student_id", ""),
                s.get("full_name", ""),
                s.get("email", ""),
                s.get("phone", ""),
                s.get("program_id", ""),
                s.get("status", ""),
                s.get("nfc_card_id", ""),
                s.get("created_at", "")
            ])
        
        # Clear and update sheet
        sheet.clear()
        sheet.update(rows, 'A1')
        
        return {
            "success": True,
            "message": f"Exported {len(students)} students",
            "rows_exported": len(students),
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/export/assessments")
async def export_assessments(data: SyncRequest):
    """Export all assessments to Google Sheets"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    client = get_gspread_client()
    
    # Fetch assessments
    assessments = await db.nfc_assessments.find({}, {"_id": 0}).to_list(1000)
    
    if not client:
        return {
            "success": True,
            "message": "Demo mode - Google Sheets not configured",
            "rows_exported": len(assessments),
            "data_preview": assessments[:5] if assessments else []
        }
    
    try:
        spreadsheet_id = data.spreadsheet_id or SPREADSHEET_ID
        spreadsheet = client.open_by_key(spreadsheet_id)
        
        sheet_name = data.sheet_name or "Assessments"
        try:
            sheet = spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            sheet = spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=20)
        
        headers = ["Assessment ID", "Student Name", "Session ID", "Unit ID", "Average Rating", "Crew Name", "Notes", "Created At"]
        rows = [headers]
        
        for a in assessments:
            rows.append([
                a.get("assessment_id", ""),
                a.get("student_name", ""),
                a.get("session_id", ""),
                a.get("unit_id", ""),
                str(a.get("average_rating", "")),
                a.get("crew_name", ""),
                a.get("notes", ""),
                a.get("created_at", "")
            ])
        
        sheet.clear()
        sheet.update(rows, 'A1')
        
        return {
            "success": True,
            "message": f"Exported {len(assessments)} assessments",
            "rows_exported": len(assessments),
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/export/attendance")
async def export_attendance(data: SyncRequest):
    """Export all attendance records to Google Sheets"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    client = get_gspread_client()
    
    # Fetch attendance
    attendance = await db.session_attendance.find({}, {"_id": 0}).to_list(5000)
    
    if not client:
        return {
            "success": True,
            "message": "Demo mode - Google Sheets not configured",
            "rows_exported": len(attendance),
            "data_preview": attendance[:5] if attendance else []
        }
    
    try:
        spreadsheet_id = data.spreadsheet_id or SPREADSHEET_ID
        spreadsheet = client.open_by_key(spreadsheet_id)
        
        sheet_name = data.sheet_name or "Attendance"
        try:
            sheet = spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            sheet = spreadsheet.add_worksheet(title=sheet_name, rows=5000, cols=20)
        
        headers = ["Attendance ID", "Session ID", "Student Name", "NFC Card", "Unit ID", "Marked By", "Marked At"]
        rows = [headers]
        
        for a in attendance:
            rows.append([
                a.get("attendance_id", ""),
                a.get("session_id", ""),
                a.get("student_name", ""),
                a.get("nfc_card_id", ""),
                a.get("unit_id", ""),
                a.get("marked_by", ""),
                a.get("marked_at", "")
            ])
        
        sheet.clear()
        sheet.update(rows, 'A1')
        
        return {
            "success": True,
            "message": f"Exported {len(attendance)} attendance records",
            "rows_exported": len(attendance),
            "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")
