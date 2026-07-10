# ============================================================
# KXGRID — Models
# ============================================================

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

class UserBase(BaseModel):
    email: EmailStr
    name: str
    picture: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "student"  # student, trainer, admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class LeadRegistration(BaseModel):
    name: str
    location: str
    mobile: str
    program_interest: str
    fee_type: str  # cash, loan

class StudentRegistration(BaseModel):
    user_id: str
    photo_url: Optional[str] = None
    full_name: str
    mobile: str
    age: int
    blood_group: str
    address: str
    city: str
    state: str
    emergency_contact: str
    highest_degree: str
    occupation_type: str  # student, working, business, govt, freelancer
    occupation_detail: Optional[str] = None  # college/office/company/dept name
    medical_conditions: List[str] = []
    other_medical: Optional[str] = None
    blood_donation_willing: bool = False
    nfc_card_id: Optional[str] = None

class ProgramCreate(BaseModel):
    name: str
    program_type: str  # certification, diploma, pg_diploma
    description: str
    duration_weeks: int
    batch_size: int = 20
    modules: List[Dict[str, Any]] = []
    registration_open: bool = True
    next_batch_date: Optional[str] = None
    brand_id: Optional[str] = None  # Primary brand (legacy)
    brand_ids: List[str] = []  # Multiple brands involved
    highlights: List[str] = []  # Program highlights visible in public view

class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    program_type: Optional[str] = None
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    batch_size: Optional[int] = None
    registration_open: Optional[bool] = None
    next_batch_date: Optional[str] = None
    brand_id: Optional[str] = None
    brand_ids: Optional[List[str]] = None
    highlights: Optional[List[str]] = None  # Program highlights

# Program Unit Models
class UnitCreate(BaseModel):
    program_id: str
    name: str
    description: Optional[str] = ""
    brand_id: str  # Which brand handles this unit
    duration_weeks: int = 1
    order: int = 1
    theory_hours: int = 0
    practical_hours: int = 0
    assessments_required: List[Dict[str, Any]] = []  # [{name, type, passing_score}]

class UnitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    brand_id: Optional[str] = None
    duration_weeks: Optional[int] = None
    order: Optional[int] = None
    theory_hours: Optional[int] = None
    practical_hours: Optional[int] = None
    assessments_required: Optional[List[Dict[str, Any]]] = None

# Student Unit Progress Models
class UnitProgressUpdate(BaseModel):
    status: str  # not_started, in_progress, completed
    completion_date: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None

class BatchCreate(BaseModel):
    program_id: str
    trainer_id: str
    start_date: str
    schedule: Dict[str, Any] = {}

class AttendanceRecord(BaseModel):
    student_id: str
    batch_id: str
    nfc_card_id: str
    timestamp: Optional[str] = None
    gps_location: Optional[Dict[str, float]] = None
    session_type: str = "normal"  # normal, assessment
    offline_sync: bool = False

class AssessmentCreate(BaseModel):
    student_id: str
    batch_id: str
    trainer_id: str
    session_id: str
    skill_control: int = Field(ge=1, le=5)
    discipline: int = Field(ge=1, le=5)
    safety_awareness: int = Field(ge=1, le=5)
    execution: int = Field(ge=1, le=5)
    teamwork: int = Field(ge=1, le=5)
    notes: Optional[str] = None

class UpgradeApplication(BaseModel):
    student_id: str
    current_program_id: str
    target_program_id: str

class AttendanceSessionCreate(BaseModel):
    unit_id: str
    session_name: Optional[str] = None
    notes: Optional[str] = None

class NFCAttendanceRequest(BaseModel):
    nfc_card_id: str
    session_id: str

class AssessmentCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    assessment_type: str = "rating"  # rating, checkbox, text
    scale_min: int = 1
    scale_max: int = 5
    weight: float = 1.0  # Weight for calculating overall score
    is_required: bool = True  # Required for completing assessment
    is_active: bool = True
    brand_ids: List[str] = []  # Assign to multiple brands
    display_order: int = 0  # Order in assessment form

class NFCAssessmentCreate(BaseModel):
    student_id: str
    session_id: str
    unit_id: str
    ratings: Dict[str, int]  # {category_id: rating}
    notes: Optional[str] = None
    crew_nfc_confirmation: str  # Crew's NFC ID for confirmation

class PartnerCreate(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    logo_base64: Optional[str] = None
    website_url: Optional[str] = None
    partner_type: str = "partner"  # partner, sponsor, association
    is_visible: bool = True
    is_featured: bool = False  # Featured partners show as big logos
    order: int = 0

class ProgrammeDirectorUpdate(BaseModel):
    name: str
    designation: str
    message: str
    photo_url: Optional[str] = None
    photo_base64: Optional[str] = None

class ContactInfoUpdate(BaseModel):
    email: str
    phone: str
    whatsapp_number: str
    location_address: str
    location_maps_url: Optional[str] = None
    heading_text: str = "Questions? Please get in touch"
    subheading_text: str = "Our admission team will be happy to discuss your options"

class CallbackRequestCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None
    preferred_time: Optional[str] = None

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class NFCLogin(BaseModel):
    nfc_card_id: str

class MobileLogin(BaseModel):
    mobile: str

class NFCPasswordLogin(BaseModel):
    nfc_card_id: str
    password: str

class PasswordResetRequest(BaseModel):
    mobile: str

class PasswordResetVerify(BaseModel):
    mobile: str
    otp: str
    new_password: str

class AdminPasswordReset(BaseModel):
    user_id: str
    new_password: str

DEFAULT_NFC_PASSWORD = "NFC1234"

class NFCIssue(BaseModel):
    user_id: str
    nfc_card_id: str
    user_type: str  # student, trainer, admin

class NFCReplace(BaseModel):
    old_nfc_id: str
    new_nfc_id: str

class RegistrationToggle(BaseModel):
    registration_open: bool
    next_batch_date: Optional[str] = None

class AdminMessage(BaseModel):
    title: str
    content: str
    type: str = "info"  # info, announcement, alert

class BatchCompletion(BaseModel):
    batch_id: str
    completion_date: Optional[str] = None

class SiteSettings(BaseModel):
    university_email: Optional[str] = None
    auto_email_enabled: bool = False
    auto_email_weekly: bool = False
    auto_email_monthly: bool = False
    logo_text_1: str = "KX"
    logo_text_2: str = "GRID"
    site_title: str = "KXGRID"
    site_tagline: str = "Unified Operating Platform"
    hero_headline_1: str = "Unified Operating Platform for the KotlerX Ecosystem"
    hero_headline_2: str = "Connecting Brands, Programmes, Students, Crew & Partners"
    hero_headline_3: str = "NFC + AI-powered Skill Tracking Platform"
    hero_description: str = "GRID enables programme execution, department coordination, attendance & assessment tracking, content delivery, and brand visibility across the ecosystem."
    footer_text: str = "KXGRID - Unified Operating Platform"
    contact_email: str = ""
    contact_phone: str = ""

class LandingPageContent(BaseModel):
    hero_headline_1: Optional[str] = None
    hero_headline_2: Optional[str] = None
    hero_headline_3: Optional[str] = None
    hero_description: Optional[str] = None
    features: Optional[List[Dict[str, str]]] = None
    stats: Optional[Dict[str, Any]] = None

class Base64ImageUpload(BaseModel):
    image_base64: str

class MediaItem(BaseModel):
    title: str
    description: Optional[str] = ""
    media_type: str  # image, video
    url: Optional[str] = None
    media_base64: Optional[str] = None  # For direct uploads
    thumbnail_url: Optional[str] = None
    thumbnail_base64: Optional[str] = None
    category: str  # public, student
    is_visible: bool = True
    order: int = 0

class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str

class ReportEmailRequest(BaseModel):
    report_type: str  # weekly, monthly, batch, completion
    batch_id: Optional[str] = None



class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    logo_url: Optional[str] = None
    color: Optional[str] = "#00f0ff"
    order: int = 0
    is_visible: bool = True
    # Editable stats for "Why Choose" section
    stats_certifications: Optional[str] = "Industry"
    stats_success_rate: Optional[str] = "95%"
    tagline: Optional[str] = None

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None
    is_visible: Optional[bool] = None
    stats_certifications: Optional[str] = None
    stats_success_rate: Optional[str] = None
    tagline: Optional[str] = None

class BrandHeadAssign(BaseModel):
    user_id: str
    brand_id: str

class CreateCrewRequest(BaseModel):
    name: str
    email: str
    password: str
    brand_id: Optional[str] = None

class CreateUserAccount(BaseModel):
    email: str
    password: str
    name: str
    brand_id: Optional[str] = None  # Required for brand_head and crew

class ReClassCreate(BaseModel):
    unit_id: str
    scheduled_date: str
    scheduled_time: str
    location: Optional[str] = ""
    notes: Optional[str] = ""
    student_ids: List[str] = []

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    category: str = "instructor"  # instructor, staff
    photo_url: Optional[str] = None
    photo_base64: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class KXCraftProductCreate(BaseModel):
    name: str
    category: str = "motorsport"
    price: str = "0"
    description: str = ""
    image_url: str = ""
    image_base64: Optional[str] = None
    badge: Optional[str] = None
    rating: float = 5.0
    is_visible: bool = True
    order: int = 0
    external_link: Optional[str] = None

class CareerCreate(BaseModel):
    title: str
    company: str
    location: str
    job_type: str = "full-time"  # full-time, part-time, internship, contract
    description: str
    requirements: List[str] = []
    brand_id: Optional[str] = None
    salary_range: Optional[str] = None
    application_url: Optional[str] = None
    is_active: bool = True

class PromoBannerCreate(BaseModel):
    title: str
    description: str
    button_text: str = "Learn More"
    link_url: Optional[str] = None
    link_type: str = "external"  # external, registration, internal
    background_color: str = "#1a1a2e"
    gradient_from: str = "#00f0ff"
    gradient_to: str = "#ff00ff"
    icon: str = "Zap"  # Lucide icon name
    logo_url: Optional[str] = None  # Custom logo image URL
    is_active: bool = True
    display_order: int = 0
    registration_enabled: bool = False  # For workshop registrations

class WorkshopRegistration(BaseModel):
    banner_id: str
    name: str
    email: str
    phone: str
    message: Optional[str] = None

