import os
import logging
from datetime import datetime, timezone
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

# Core configurations and database
from core.database import db, client
from core.security import hash_password
from core.config import ROOT_DIR

# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("server")

# Import all modular routers
from routers import (
    sms,
    sheets,
    auth,
    students,
    programs,
    admin,
    super_admin,
    nfc,
    leads,
    certificates,
    leaderboard,
    team,
    kxcraft,
    careers,
    promo,
    attendance,
    cms,
    brands,
    partners,
    brand_head
)

# Initialize FastAPI app
app = FastAPI(title="KotlerX API", version="1.0.0")

# ======================== HEALTH CHECK & ROOT ========================
@app.get("/health")
def health_check():
    """Health check endpoint for Kubernetes liveness/readiness probes"""
    return {"status": "healthy", "service": "kxgrid-api"}

@app.get("/")
def app_root():
    """Root endpoint"""
    return {"message": "KotlerX API", "status": "running", "version": "1.0.0"}

# Include all modular routers under the App
app.include_router(auth.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(programs.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(super_admin.router, prefix="/api")
app.include_router(nfc.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(team.router, prefix="/api")
app.include_router(kxcraft.router, prefix="/api")
app.include_router(careers.router, prefix="/api")
app.include_router(promo.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(cms.router, prefix="/api")
app.include_router(brands.router, prefix="/api")
app.include_router(partners.router, prefix="/api")
app.include_router(brand_head.router, prefix="/api")

# Include existing/special routers
app.include_router(sms.router)
app.include_router(sheets.router)

# Set database for sheets router (legacy dependency)
sheets.set_database(db)

# ======================== SEED DATA ========================
async def seed_super_admin():
    """Seed initial super admin account"""
    try:
        super_admin_exists = await db.users.find_one({"role": "super_admin"})
        if not super_admin_exists:
            super_admin_doc = {
                "user_id": "user_root001",
                "email": "root@kotlerx.com",
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

async def seed_promo_banners():
    """Seed initial promotional banners"""
    try:
        existing = await db.promo_banners.count_documents({})
        if existing > 0:
            return
        
        banners = [
            {
                "banner_id": "banner_workshop001",
                "title": "Workshop on Custom Painting",
                "description": "Master the art of custom vehicle painting. Register for workshops and one-day programmes!",
                "button_text": "Register Now",
                "link_url": None,
                "link_type": "registration",
                "background_color": "#1a1a2e",
                "gradient_from": "#f59e0b",
                "gradient_to": "#ef4444",
                "icon": "Paintbrush",
                "is_active": True,
                "display_order": 1,
                "registration_enabled": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "banner_id": "banner_fitness002",
                "title": "Online Class for Motorsport Fitness",
                "description": "Get race-ready with professional fitness training designed for motorsport athletes.",
                "button_text": "Join Classes",
                "link_url": "https://www.kotlerxiron.com",
                "link_type": "external",
                "background_color": "#1a1a2e",
                "gradient_from": "#10b981",
                "gradient_to": "#06b6d4",
                "icon": "Dumbbell",
                "is_active": True,
                "display_order": 2,
                "registration_enabled": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "banner_id": "banner_connect003",
                "title": "Connect. Create. Earn.",
                "description": "Join the community! A business portal for visual creators and influencers.",
                "button_text": "Join Community",
                "link_url": "https://www.kotlerxconnect.com",
                "link_type": "external",
                "background_color": "#1a1a2e",
                "gradient_from": "#8b5cf6",
                "gradient_to": "#ec4899",
                "icon": "Users",
                "is_active": True,
                "display_order": 3,
                "registration_enabled": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "banner_id": "banner_ride004",
                "title": "Join the Ride",
                "description": "Be part of the riding community. Adventures, meetups, and more await!",
                "button_text": "Start Riding",
                "link_url": "https://www.kotlerxcore.com",
                "link_type": "external",
                "background_color": "#1a1a2e",
                "gradient_from": "#00f0ff",
                "gradient_to": "#0066ff",
                "icon": "Bike",
                "is_active": True,
                "display_order": 4,
                "registration_enabled": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        await db.promo_banners.insert_many(banners)
        logger.info("Seeded initial promotional banners")
    except Exception as e:
        logger.warning(f"Could not seed promo banners: {e}")

# ======================== LIFESPAN EVENTS ========================
@app.on_event("startup")
async def startup_event():
    """Application startup event handler"""
    logger.info("KXGRID API starting up...")
    postgres_url = os.environ.get("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/kxgrid_db")
    await db.init_pool(postgres_url)
    await seed_super_admin()
    await seed_promo_banners()
    logger.info("KXGRID API startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Application shutdown event handler"""
    client.close()

# ======================== CORS CONFIGURATION ========================
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '')

if CORS_ORIGINS:
    allowed_origins = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
else:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
