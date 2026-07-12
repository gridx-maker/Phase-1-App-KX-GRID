# 🚀 KXGRID Setup Guide

Complete setup guide for the KotlerX Unified Platform (KXGRID).

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## 🖥️ System Requirements

### Required Software

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| **Python** | 3.10+ | https://www.python.org/downloads/ |
| **Node.js** | 18+ | https://nodejs.org/ |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ |
| **Git** | Latest | https://git-scm.com/downloads |

### Optional Tools

- **pgAdmin 4**: GUI for PostgreSQL management
- **Postman**: API testing tool
- **VS Code**: Recommended IDE with extensions:
  - Python
  - ESLint
  - Prettier
  - TailwindCSS IntelliSense

---

## ⚡ Quick Start

### Using the Automated Startup Script (Windows)

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd Phase-1-App-KX-GRID
   ```

2. **Ensure PostgreSQL is running** on `localhost:5432`

3. **Run the startup script**
   ```bash
   start-servers.bat
   ```

The script will:
- ✅ Check for Python and Node.js installation
- ✅ Create .env files from templates (if missing)
- ✅ Verify dependencies
- ✅ Start both Backend (port 8000) and Frontend (port 3000) servers

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 🔧 Detailed Setup

### 1. Database Setup

#### Install PostgreSQL

1. Download and install PostgreSQL 14+ from https://www.postgresql.org/download/
2. During installation:
   - Set a **password** for the `postgres` user (remember this!)
   - Note the **port** (default: 5432)

#### Create Database

**Option A: Using pgAdmin**
1. Open pgAdmin 4
2. Right-click "Databases" → Create → Database
3. Name: `kxgrid_db`
4. Owner: `postgres`
5. Click Save

**Option B: Using Command Line**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kxgrid_db;

# Exit
\q
```

The backend will automatically create all required tables on first startup.

---

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

#### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

#### Step 4: Configure Environment Variables

Create `.env` file in the `backend/` directory:

```bash
# Copy from example
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac
```

Edit `backend/.env` with your configuration:

```env
# Database (Update password if you set a different one during PostgreSQL install)
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kxgrid_db

# JWT Secret (CRITICAL: Generate a strong random secret!)
# Generate using: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=<generated_secret_key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168

# Email (Optional - for sending emails via Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=noreply@kotlerx.com

# SMS (Optional - for Twilio OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# OAuth (Optional - for Google Sign-In)
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxx

# AI (Optional - for Groq API)
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

#### Step 5: Test Backend
```bash
# Ensure virtual environment is activated
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

✅ Backend should start at http://localhost:8000
✅ Visit http://localhost:8000/docs for API documentation

---

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

#### Step 2: Install Dependencies
```bash
# Install with legacy peer deps flag (required for React 19 compatibility)
npm install --legacy-peer-deps
```

#### Step 3: Configure Environment Variables

Create `.env` file in the `frontend/` directory:

```bash
# Copy from example
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac
```

Edit `frontend/.env`:

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8000
```

#### Step 4: Test Frontend
```bash
npm start
```

✅ Frontend should open automatically at http://localhost:3000

---

## ⚙️ Configuration

### Required API Keys and Services

#### 1. Resend (Email) - Optional
- Sign up: https://resend.com/
- Create API key
- Add to `backend/.env`: `RESEND_API_KEY=re_xxxxx`

#### 2. Twilio (SMS) - Optional
- Sign up: https://www.twilio.com/
- Get Account SID, Auth Token, Phone Number
- Add to `backend/.env`

#### 3. Google OAuth - Optional
- Go to: https://console.cloud.google.com/
- Create new project
- Enable Google+ API
- Create OAuth 2.0 credentials (Web application)
- Add authorized redirect URI: `http://localhost:8000/api/auth/callback/google`
- Add credentials to `backend/.env`

#### 4. Groq API - Optional
- Sign up: https://console.groq.com/
- Create API key
- Add to `backend/.env`: `GROQ_API_KEY=gsk_xxxxx`

### JWT Secret Key Generation

⚠️ **CRITICAL FOR SECURITY**

Generate a strong random secret key:

```bash
# Method 1: Using Python
python -c "import secrets; print(secrets.token_hex(32))"

# Method 2: Using OpenSSL
openssl rand -hex 32
```

Copy the output and set it as `JWT_SECRET_KEY` in `backend/.env`

---

## 🚀 Running the Application

### Method 1: Using Automated Startup Script (Recommended for Windows)

```bash
# From project root
start-servers.bat
```

This opens two command windows:
1. **Backend Server** (Port 8000)
2. **Frontend Server** (Port 3000)

### Method 2: Manual Startup (All Platforms)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate    # Windows
source venv/bin/activate # Linux/Mac
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Method 3: Using VS Code

1. Open the project in VS Code
2. Install "Tasks" extension (optional)
3. Press `Ctrl+Shift+B` to run build tasks
4. Select "Start Backend" or "Start Frontend"

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Python not found" or "Node not found"

**Solution:**
- Ensure Python and Node.js are installed
- Add to system PATH environment variable
- Restart terminal/command prompt

#### 2. "Connection to PostgreSQL failed"

**Solutions:**
- Verify PostgreSQL service is running:
  ```bash
  # Windows: Check Services (services.msc)
  # Look for "postgresql-x64-14" or similar

  # Linux/Mac:
  sudo systemctl status postgresql
  ```
- Verify credentials in `backend/.env`
- Check port (default: 5432)
- Ensure database `kxgrid_db` exists

#### 3. "ModuleNotFoundError" in Backend

**Solution:**
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

#### 4. "npm ERR! peer dependencies" in Frontend

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 5. Backend starts but shows "Could not seed super admin"

**Possible Causes:**
- Database connection issue
- Check `POSTGRES_URL` in `backend/.env`
- Verify database exists and is accessible

#### 6. CORS errors in browser console

**Solution:**
- Ensure backend is running on port 8000
- Verify `REACT_APP_BACKEND_URL=http://localhost:8000` in `frontend/.env`
- Restart both servers

#### 7. "Port 8000 already in use"

**Solution:**
```bash
# Windows: Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

---

## 🌐 Production Deployment

### Pre-Deployment Checklist

- [ ] Change all default passwords (Root, Admin, etc.)
- [ ] Generate and set a strong `JWT_SECRET_KEY`
- [ ] Update `POSTGRES_URL` with production database credentials
- [ ] Set `ENVIRONMENT=production` in `backend/.env`
- [ ] Configure production domain in `CORS_ORIGINS`
- [ ] Set up SSL/TLS certificates (HTTPS)
- [ ] Configure production email/SMS providers
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Review and update `.gitignore` (ensure .env is excluded)

### Backend Deployment (Example: Railway/Render/AWS)

1. Update `backend/.env` for production
2. Set environment variables in hosting platform
3. Deploy using:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

### Frontend Deployment (Example: Vercel/Netlify)

1. Update `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=https://api.kotlerx.in
   ```
2. Build production bundle:
   ```bash
   npm run build
   ```
3. Deploy `build/` folder to hosting platform

### Database Migrations

The application uses PostgreSQL with automatic table creation. For schema changes:
1. Update collection definitions in `backend/core/database.py`
2. Restart backend to apply changes

---

## 📞 Support

For issues or questions:
- Check the [README.md](README.md) for project overview
- Review [SECURITY-AUDIT.md](SECURITY-AUDIT.md) for security guidelines
- Contact: KotlerX Development Team

---

## 📝 Notes

- **Development Mode**: Uses `--reload` for auto-restart on code changes
- **Production Mode**: Remove `--reload` flag for better performance
- **Default Credentials**: See [README.md](README.md#default-credentials) (⚠️ Change immediately!)

---

**Last Updated**: 2026-07-12
**Version**: 1.0.0
