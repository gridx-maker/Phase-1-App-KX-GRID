# 📜 Startup Script Documentation

**File**: `start-servers.bat`
**Version**: 1.0.0
**Platform**: Windows
**Purpose**: Automated startup script for KXGRID development servers

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Script Flow](#script-flow)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Usage](#usage)
6. [Script Sections](#script-sections)
7. [Troubleshooting](#troubleshooting)
8. [Customization](#customization)

---

## 🎯 Overview

`start-servers.bat` is an automated Windows batch script that performs pre-flight checks, validates configurations, and starts both the Backend (FastAPI) and Frontend (React) development servers for the KXGRID application.

### What It Does

1. ✅ Verifies Python and Node.js installations
2. ✅ Checks for PostgreSQL availability
3. ✅ Validates environment variable files (.env)
4. ✅ Verifies dependency installations
5. ✅ Starts Backend server (Port 8000)
6. ✅ Starts Frontend server (Port 3000)
7. ✅ Opens both servers in separate command windows

---

## 🔄 Script Flow

```
┌─────────────────────────────────────┐
│  User runs: start-servers.bat       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  [1/5] Pre-flight Checks            │
│  • Check Python installation        │
│  • Check Node.js installation       │
│  • Notify about PostgreSQL          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  [2/5] Environment Validation       │
│  • Check backend/.env exists        │
│  • Check frontend/.env exists       │
│  • Create from .env.example if      │
│    missing                           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  [3/5] Dependency Verification      │
│  • Check backend/venv/ exists       │
│  • Check frontend/node_modules/     │
│    exists                            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  [4/5] Start Backend Server         │
│  • Open new command window          │
│  • Activate Python venv             │
│  • Run: uvicorn server:app --reload │
│  • Port: 8000                       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  [5/5] Start Frontend Server        │
│  • Open new command window          │
│  • Run: npm start                   │
│  • Port: 3000                       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Display Success Message            │
│  • Show URLs and ports              │
│  • Instructions to stop servers     │
└─────────────────────────────────────┘
```

---

## ✨ Features

### 1. Intelligent Environment Setup
- Automatically creates `.env` files from `.env.example` templates if missing
- Warns users to configure credentials before starting servers

### 2. Comprehensive Validation
- Checks for required software (Python, Node.js)
- Validates project structure (venv, node_modules)
- Provides actionable error messages with remediation steps

### 3. Isolated Server Windows
- Backend and Frontend run in separate command windows
- Easy to monitor logs independently
- Window titles show server type and port

### 4. Error Handling
- Exit codes indicate success or failure
- Clear error messages with installation links
- Graceful handling of missing dependencies

### 5. User Feedback
- Progress indicators ([1/5], [2/5], etc.)
- Color-coded status messages
- URLs displayed for easy access

---

## 📦 Prerequisites

Before running the script, ensure:

| Requirement | Version | Check Command | Install Link |
|-------------|---------|---------------|--------------|
| **Python** | 3.10+ | `python --version` | https://www.python.org/ |
| **Node.js** | 18+ | `node --version` | https://nodejs.org/ |
| **PostgreSQL** | 14+ | `psql --version` | https://www.postgresql.org/ |

---

## 🚀 Usage

### Basic Usage

1. Open File Explorer
2. Navigate to project root directory
3. Double-click `start-servers.bat`

**OR**

### Command Line Usage

```cmd
cd "C:\Users\yuvar\Desktop\web_hoster\internship\kotlerx\old projects\Phase-1-App-KX-GRID"
start-servers.bat
```

### First-Time Setup

If this is your first time running the script:

1. **Run the script** - it will create `.env.example` files
2. **Configure `.env` files** with your credentials:
   - `backend\.env` - Database URL, JWT secret, API keys
   - `frontend\.env` - Backend URL
3. **Install dependencies**:
   ```cmd
   REM Backend
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt

   REM Frontend
   cd ..\frontend
   npm install --legacy-peer-deps
   ```
4. **Run script again** - servers will start successfully

---

## 📝 Script Sections

### Section 1: Pre-flight Checks

```batch
echo [1/5] Running pre-flight checks...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b 1
)
```

**What it does**:
- Runs `python --version` silently
- Checks exit code (`%errorlevel%`)
- If Python not found (exit code != 0), displays error and exits

**Exit Codes**:
- `0` - Success
- `1` - Python not found
- `1` - Node.js not found

---

### Section 2: Environment Variable Checks

```batch
echo [2/5] Checking environment configuration...

if not exist "%PROJECT_ROOT%backend\.env" (
    echo [WARNING] Backend .env file not found!
    copy "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env"
)
```

**What it does**:
- Checks if `.env` files exist
- Copies from `.env.example` if missing
- Warns user to configure credentials

**Files Created**:
- `backend\.env` (from `backend\.env.example`)
- `frontend\.env` (from `frontend\.env.example`)

---

### Section 3: Dependency Checks

```batch
echo [3/5] Checking dependencies...

if not exist "%PROJECT_ROOT%backend\venv\" (
    echo [WARNING] Python virtual environment not found!
    echo   Run: cd backend ^&^& python -m venv venv
)
```

**What it does**:
- Verifies `backend/venv/` exists
- Verifies `frontend/node_modules/` exists
- Provides installation commands if missing

---

### Section 4: Start Backend Server

```batch
start "KXGRID Backend - FastAPI (Port 8000)" cmd /k "
    cd /d "%PROJECT_ROOT%backend" &&
    if exist venv\Scripts\activate (venv\Scripts\activate) &&
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"
```

**What it does**:
- Opens new command window with title "KXGRID Backend - FastAPI (Port 8000)"
- Navigates to `backend/` directory
- Activates Python virtual environment
- Starts Uvicorn server with auto-reload

**Server Configuration**:
- Host: `0.0.0.0` (accessible from network)
- Port: `8000`
- Reload: Enabled (auto-restart on code changes)

**Window Behavior**:
- `/k` flag keeps window open after command
- Window remains open even if server crashes

---

### Section 5: Start Frontend Server

```batch
start "KXGRID Frontend - React (Port 3000)" cmd /k "
    cd /d "%PROJECT_ROOT%frontend" &&
    npm start
"
```

**What it does**:
- Opens new command window with title "KXGRID Frontend - React (Port 3000)"
- Navigates to `frontend/` directory
- Runs `npm start` (which executes `craco start`)

**Server Configuration**:
- Port: `3000` (default for Create React App)
- Opens browser automatically
- Hot reload enabled

---

### Section 6: Completion

```batch
echo ========================================================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ========================================================================
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:3000
```

**What it does**:
- Displays success message
- Shows access URLs
- Provides stop instructions

---

## 🔧 Troubleshooting

### Error: "Python is not installed or not in PATH"

**Cause**: Python is not installed or not added to system PATH

**Solution**:
1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart command prompt
4. Run `python --version` to verify

---

### Error: "Node.js is not installed or not in PATH"

**Cause**: Node.js is not installed or not added to system PATH

**Solution**:
1. Install Node.js from https://nodejs.org/
2. Restart command prompt
3. Run `node --version` to verify

---

### Warning: "Python virtual environment not found"

**Cause**: Backend dependencies not installed

**Solution**:
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### Warning: "Frontend node_modules not found"

**Cause**: Frontend dependencies not installed

**Solution**:
```cmd
cd frontend
npm install --legacy-peer-deps
```

---

### Server starts but shows "Connection refused"

**Cause**: PostgreSQL database is not running

**Solution**:
1. Start PostgreSQL service:
   - Windows: Services → postgresql-x64-14 → Start
   - Or: `net start postgresql-x64-14`
2. Verify with: `psql -U postgres`

---

### Backend window opens then closes immediately

**Cause**: Error in backend code or missing environment variables

**Solution**:
1. Open backend window manually:
   ```cmd
   cd backend
   venv\Scripts\activate
   uvicorn server:app --reload
   ```
2. Read error message
3. Fix configuration in `backend\.env`

---

## 🎨 Customization

### Change Backend Port

Edit line 117 in `start-servers.bat`:
```batch
uvicorn server:app --host 0.0.0.0 --port 8080 --reload
```
Also update `frontend\.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8080
```

---

### Change Frontend Port

Set environment variable before running:
```cmd
set PORT=3001
start-servers.bat
```

Or modify `frontend/package.json`:
```json
"scripts": {
  "start": "PORT=3001 craco start"
}
```

---

### Disable Auto-Reload

For production-like testing, remove `--reload` flag:
```batch
uvicorn server:app --host 0.0.0.0 --port 8000
```

---

### Run Servers in Same Window

Replace `start "..."` commands with direct execution:
```batch
REM Backend
cd backend
call venv\Scripts\activate
start /b uvicorn server:app --reload

REM Frontend (in same window)
cd ..\frontend
npm start
```

---

### Add Additional Checks

Add custom validation before starting servers:
```batch
REM Check if PostgreSQL is running
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL service
    pause
    exit /b 1
)
```

---

## 📊 Exit Codes

| Exit Code | Meaning | Action |
|-----------|---------|--------|
| `0` | Success | Servers started successfully |
| `1` | Python not found | Install Python and add to PATH |
| `1` | Node.js not found | Install Node.js and add to PATH |

---

## 🔒 Security Considerations

### Environment Variables
- `.env` files contain sensitive credentials
- Never commit `.env` to version control
- Use `.env.example` as templates only

### Network Access
- Backend binds to `0.0.0.0` (accessible from network)
- For security, use `127.0.0.1` in production or behind firewall

### Auto-Created Files
- Script automatically creates `.env` from `.env.example`
- Review and update all credentials before use

---

## 📚 Related Documentation

- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Complete setup instructions
- [README.md](README.md) - Project overview
- [SECURITY-AUDIT.md](SECURITY-AUDIT.md) - Security best practices

---

## 🤝 Contributing

To improve this script:

1. Test changes thoroughly
2. Update this documentation
3. Add comments in the `.bat` file
4. Consider cross-platform compatibility (create `.sh` version for Linux/Mac)

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-12 | Initial release with automated checks and startup |

---

**Last Updated**: 2026-07-12
**Author**: KotlerX Development Team
