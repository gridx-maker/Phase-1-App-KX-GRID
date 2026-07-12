# 🏛️ KXGRID — KotlerX Unified Operating Platform

<div align="center">

[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)](#)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)](#)

**Central hub for all KotlerX brands, programs, students, crew, and partners.**  
Role-based access platform with NFC systems, admin panels, and full digital operations.

**Production:** [https://kotlerx.in](https://kotlerx.in)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Folder Structure](#-folder-structure)
- [User Roles](#-user-roles)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Default Credentials](#-default-credentials)
- [Roadmap](#-roadmap)

---

## 🌟 Project Overview

KXGRID is a full-stack **digital operating system** for the KotlerX ecosystem. It serves as the central hub connecting:
- All **KotlerX brands** and programs
- **Students** and their progress tracking
- **Crew/Trainers** managing attendance and assessments
- **Brand Heads** with operational dashboards
- **Admins** and **Super Admins** with full platform control

---

## 📁 Folder Structure

```
Phase-1-App-KX-GRID/
│
├── backend/                          # 🐍 Python FastAPI Backend
│   ├── server.py                     # Entry point (initializes FastAPI, CORS, DB pool, seeds, and mounts routers)
│   ├── requirements.txt              # Python dependencies
│   ├── migrate_cms.py                # One-off CMS data migration script
│   ├── .env                          # Environment variables (PostgreSQL, JWT, Twilio, OAuth, Groq, etc.)
│   ├── routers/                      # Modular route handlers (21 domain-specific files)
│   │   ├── __init__.py               # Router imports & exports exports
│   │   ├── admin.py                  # Admin dashboard & entity operations
│   │   ├── attendance.py             # NFC attendance session management
│   │   ├── auth.py                   # User signup, login, OAuth callbacks
│   │   ├── brand_head.py             # Brand manager dashboard and actions
│   │   ├── brands.py                 # Brand list, detail, visibility CRUD
│   │   ├── careers.py                # Job listings and application flow
│   │   ├── certificates.py           # Generation & lookup of student completion certificates (QR integrated)
│   │   ├── cms.py                    # CMS content setup
│   │   ├── kxcraft.py                # E-commerce product endpoints
│   │   ├── leaderboard.py            # Global and batch leaderboard queries
│   │   ├── leads.py                  # Capture system for closed registrations
│   │   ├── nfc.py                    # NFC card registration, authentication, login
│   │   ├── partners.py               # Sponsor and partner listing APIs
│   │   ├── programs.py               # Programs, batches, and unit progress
│   │   ├── promo.py                  # Promotional banner carousel control
│   │   ├── sheets.py                 # Google Sheets reports sync export
│   │   ├── sms.py                    # Twilio SMS OTP utilities
│   │   ├── students.py               # Student onboarding & profile actions
│   │   ├── super_admin.py            # Super Admin operations (Admin accounts & configurations)
│   │   └── team.py                   # Team list and bulk import/export operations
│   └── tests/                        # Backend pytest integration test suite
│       ├── test_brands.py
│       ├── test_cms_features.py
│       ├── test_multimodal_auth_leads.py
│       ├── test_new_features.py
│       ├── test_nfc_attendance.py
│       ├── test_registration_reports.py
│       ├── test_super_admin_features.py
│       └── test_unit_progress.py
│
├── frontend/                         # ⚛️  React Frontend (CRACO + TailwindCSS)
│   ├── public/                       # Static public assets
│   │   ├── index.html                # App HTML shell
│   │   ├── manifest.json             # PWA manifest
│   │   └── service-worker.js         # PWA offline service worker
│   ├── src/
│   │   ├── App.js                    # Root component & route definitions
│   │   ├── App.css                   # Global app styles
│   │   ├── index.js                  # React DOM entry point
│   │   ├── index.css                 # Tailwind base styles
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js        # Global auth state (login, token, user)
│   │   │
│   │   ├── hooks/
│   │   │   └── use-toast.js          # Toast notification hook
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js              # Shared utility functions (cn, etc.)
│   │   │
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ImageUploadWithZoom.jsx   # Image upload + zoom/crop
│   │   │   ├── KotlerXLogo.js            # Brand logo component
│   │   │   ├── PromoCarousel.js          # Promotional banner carousel
│   │   │   ├── ProtectedRoute.js         # Auth guard for protected pages
│   │   │   ├── RoleBasedRedirect.js      # Redirects by user role on login
│   │   │   └── ui/                       # shadcn/ui component library (46 files)
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── form.jsx
│   │   │       ├── input.jsx
│   │   │       ├── select.jsx
│   │   │       ├── table.jsx
│   │   │       ├── tabs.jsx
│   │   │       ├── toast.jsx
│   │   │       └── ... (37 more)
│   │   │
│   │   └── pages/                    # Route-level page components
│   │       ├── LandingPage.js        # Public homepage
│   │       ├── LoginPage.js          # Login (email/password + OAuth)
│   │       ├── AuthCallback.js       # OAuth callback handler
│   │       ├── RegisterPage.js       # Basic user registration
│   │       ├── StudentRegistration.js # Full student onboarding
│   │       ├── StudentDashboard.js   # Student portal
│   │       ├── StudentIDCard.js      # NFC-triggered digital ID card
│   │       ├── ProgramsPage.js       # Programs listing & filter
│   │       ├── BrandPage.js          # Individual brand detail page
│   │       ├── KXCraftPage.js        # KXCraft e-commerce page
│   │       ├── TeamPage.js           # Public team members page
│   │       ├── CertificatesPage.js   # Student certificates page
│   │       ├── LeaderboardPage.js    # Program leaderboard
│   │       ├── CrewDashboard.js      # Crew/Trainer dashboard
│   │       ├── CrewAttendanceMode.js # NFC attendance session management
│   │       ├── TrainerDashboard.js   # Trainer-specific view
│   │       ├── BrandHeadDashboard.js # Brand Head operations panel
│   │       ├── NFCAttendance.js      # NFC attendance scan page
│   │       ├── NFCLoginPage.js       # NFC-triggered login flow
│   │       ├── AdminDashboard.js     # Admin summary dashboard
│   │       ├── AdminPanel.js         # Full admin panel (CRUD for all entities)
│   │       └── SuperAdminPanel.js    # KX ROOT super admin panel
│   │
│   ├── plugins/                      # CRACO dev plugins
│   │   ├── visual-edits/             # Visual edit dev-server helpers
│   │   └── health-check/             # Health check webpack plugin
│   ├── craco.config.js               # CRACO webpack/eslint config
│   ├── tailwind.config.js            # TailwindCSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── jsconfig.json                 # JS path aliases
│   ├── components.json               # shadcn/ui component registry
│   ├── package.json                  # Frontend dependencies & scripts
│   └── .env                          # REACT_APP_BACKEND_URL
│
├── memory/                           # 📝 Project memory & docs
│   └── PRD.md                        # Product Requirements Document
│
├── test_reports/                     # 📊 Automated test iteration reports
│   ├── iteration_1.json … iteration_8.json
│   └── pytest/                       # Pytest HTML/XML reports
│
├── tests/                            # 🔬 Root-level integration tests
│   └── __init__.py
│
├── .emergent/                        # 🤖 AI agent state & memory
│   └── summary.txt                   # Agent handoff summary
│
├── backend_test.py                   # Standalone backend smoke test script
├── design_guidelines.json            # UI/UX design system guidelines
├── .gitignore                        # Git ignore rules
└── README.md                         # ← You are here
```

---

## 👥 User Roles

| Role | Access Level | Landing Page |
|---|---|---|
| **Public** | Landing page, brand pages, programs | `/` |
| **Student** | Dashboard, certificates, leaderboard | `/dashboard` |
| **Crew / Trainer** | Attendance, assessments, trainer panel | `/crew` |
| **Brand Head** | Brand operations, reclasses, reports | `/brand-head` |
| **Admin** | Full CRUD — students, programs, NFC, leads | `/admin` |
| **KX ROOT (Super Admin)** | All admin features + user & brand management | `/super-admin` |

---

## 🔄 Role-Based Workflow Diagram

```mermaid
graph TD
    %% Roles
    SuperAdmin[👑 Super Admin]
    Admin[🛡️ Admin]
    Crew[📱 Crew / Trainer]
    Student[🎓 Student]
    BrandHead[🏢 Brand Head]

    %% Database
    DB[(🐘 PostgreSQL DB)]

    %% Super Admin Actions
    SuperAdmin -->|Manage Admins & Platform| Admin
    SuperAdmin -->|Audit Logs / CMS Config| DB

    %% Admin Actions
    Admin -->|Create Programs, Batches, Units| DB
    Admin -->|Register Students & Assign NFC| Student
    Admin -->|Create Crew Accounts & Assign| Crew
    Admin -->|Assign Brand Heads| BrandHead
    Admin -->|Sync sheets & reports| DB

    %% Student Actions
    Student -->|Register & Verify OTP| DB
    Student -->|View Dashboard / Progress| DB
    Student -->|Tap NFC Card| Crew

    %% Crew Actions
    Crew -->|Start Active Session| DB
    Crew -->|Scan NFC Attendance & Submit| DB
    Crew -->|Grade Assessments| DB

    %% Brand Head Actions
    BrandHead -->|View intern performance| DB
    BrandHead -->|View brand dashboard| DB
```

---

## ✨ Features

### 🔐 Authentication
- Email/password login with JWT tokens
- OAuth callback support
- NFC-triggered login flow
- Role-based redirect on login

### 👨‍🎓 Student Portal
- Full student registration & onboarding
- Dashboard with program progress
- Digital ID card (NFC-triggered)
- Certificates & leaderboard

### 🏷️ Brand & Program Management
- Multi-brand support with individual brand pages
- Program listing with category filters
- Unit progress tracking
- Flex Assessment Builder

### 👷 Crew / Trainer
- Attendance session management
- NFC-based attendance scanning
- Assessment category management
- Offline queue with sync

### 🛒 KXCraft E-Commerce
- Admin-manageable product listings
- Buy Now buttons on product cards

### 🛡️ Admin Panel
- CRUD for students, programs, brands, leads
- NFC user management
- Workshop registration + CSV export
- Promotional banner carousel management
- Bulk team-member import + JSON export
- Google Sheets integration

### 📱 PWA
- Service worker for offline capability
- Installable on mobile/desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| CRACO | CRA config override (webpack + ESLint) |
| TailwindCSS | Utility-first CSS |
| shadcn/ui | Pre-built accessible UI components |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Recharts | Data visualization |
| react-hook-form + zod | Form validation |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | Python async API framework |
| asyncpg | Async PostgreSQL client driver |
| PostgreSQL | Primary database |
| PyJWT + python-jose | JWT auth |
| bcrypt | Password hashing |
| Twilio | SMS notifications |
| Resend | Transactional email |
| gspread | Google Sheets integration |
| qrcode | QR code generation (for digital certificates) |
| google-auth-oauthlib | Google OAuth authentication |
| python-dotenv | Environment config |
| uvicorn | ASGI server |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database server

### 1. Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env (see Environment Variables section)
# Then start the server:
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env (see Environment Variables section)
# Then start the dev server:
npm start
```

The app will open at `http://localhost:3000`

---

## 🔧 Environment Variables

### `backend/.env`
```env
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/kxgrid_db
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDER_EMAIL=onboarding@resend.dev
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

### `frontend/.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## 📡 API Overview

The full interactive API reference is available at `http://localhost:8000/docs`.

Key route groups in `server.py`:

| Prefix | Description |
|---|---|
| `/api/auth/` | Login, register, OAuth, token verify |
| `/api/students/` | Student CRUD, registration, progress |
| `/api/programs/` | Programs, units, enrollments |
| `/api/brands/` | Brand management |
| `/api/admin/` | Admin panel operations |
| `/api/super-admin/` | Super admin / KX ROOT operations |
| `/api/nfc/` | NFC attendance & login |
| `/api/leads/` | Contact form & lead management |
| `/api/certificates/` | Certificate generation & listing |
| `/api/leaderboard/` | Program leaderboards |
| `/api/team/` | Team member management |
| `/api/kxcraft/` | KXCraft product management |
| `/api/sms/` | Twilio SMS (via router) |
| `/api/sheets/` | Google Sheets export (via router) |
| `/health` | Server health check |

---

## 🔑 Default Credentials

> ⚠️ Change all passwords immediately in production!

| Role | Email | Password |
|---|---|---|
| **KX ROOT** (Super Admin) | `root@kotlerx.com` | `KXRoot@2024` |
| **Admin** | `admin@kotlerx.com` | `admin123` |
| **Brand Head** | `KXGRIDBH@kotlerx.com` | `brandmgr123` |
| **Crew** | `crew@kotlerx.com` | `crew123` |
| **Student** | `regularstudent@kotlerx.com` | `student123` |

---

## 🗺️ Roadmap

- [x] Multi-role auth (JWT + OAuth)
- [x] Brand & Program management
- [x] NFC attendance system
- [x] Admin panel (CRUD for all entities)
- [x] Super Admin panel (KX ROOT)
- [x] PWA (offline service worker)
- [x] KXCraft e-commerce page
- [x] Promotional banner carousel
- [x] Bulk team import + JSON export
- [x] Google Sheets integration
- [x] Refactor `server.py` into separate router modules
- [ ] Refactor `AdminPanel.js` (6500+ lines → split by domain)
- [x] Fix conditional occupation field in Student Registration
- [ ] Push notifications
- [ ] Crew performance analytics
- [ ] Sponsor & Partner engine with tiers

---

## ⚠️ Important Notes

> [!CAUTION]
> `sync_production_data.py` and `sync_production.py` have been **permanently deleted**. Their `delete_many({})` calls caused a team_members data loss incident. **Do NOT re-introduce** any destructive sync script without an explicit, audited migration plan and a confirmed backup.

> [!NOTE]
> The refactoring of `backend/server.py` into domain-specific modular router files has been successfully completed. The route handling logic has been moved to individual files in `backend/routers/` and imported dynamically in the primary FastAPI initialization server file.

---

## 📄 License

Private — KotlerX internal platform. All rights reserved.
