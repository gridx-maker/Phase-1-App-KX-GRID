# 🚀 KXGRID Quick Start Scripts

**Version**: 2.0.0 (Completely Rewritten & Fixed)
**Last Updated**: 2026-07-12

---

## 📋 Overview

This folder contains automated batch scripts for managing KXGRID development servers on Windows. All scripts have been completely rewritten to fix path issues and add comprehensive functionality.

---

## 🎯 Available Scripts

### 1. **start-all.bat** - Start Everything
```batch
quick-start\start-all.bat
```
**What it does**:
- ✅ Checks all prerequisites (Python, Node.js, PostgreSQL)
- ✅ Validates environment configuration
- ✅ Verifies dependencies are installed
- ✅ Starts Backend server (Port 8000) in new window
- ✅ Starts Frontend server (Port 3000) in new window
- ✅ Auto-creates .env files from templates if missing

**Best for**: First-time setup and daily development

---

### 2. **start-backend.bat** - Backend Only
```batch
quick-start\start-backend.bat
```
**What it does**:
- Starts only FastAPI backend server
- Activates Python virtual environment
- Runs on `http://localhost:8000`
- API docs at `http://localhost:8000/docs`

**Best for**: Backend-only development, API testing

---

### 3. **start-frontend.bat** - Frontend Only
```batch
quick-start\start-frontend.bat
```
**What it does**:
- Starts only React frontend server
- Runs on `http://localhost:3000`
- Connects to backend at configured URL

**Best for**: Frontend-only development, UI work

---

### 4. **stop-all.bat** - Stop All Servers
```batch
quick-start\stop-all.bat
```
**What it does**:
- Finds all running KXGRID servers
- Terminates Backend (port 8000) processes
- Terminates Frontend (port 3000) processes
- Cleans up node.exe and python.exe processes
- Verifies ports are freed

**Best for**: Clean shutdown, troubleshooting port conflicts

---

### 5. **check-status.bat** - Server Status
```batch
quick-start\check-status.bat
```
**What it does**:
- Checks if Backend is running (port 8000)
- Checks if Frontend is running (port 3000)
- Checks PostgreSQL service status
- Tests backend health endpoint
- Shows PIDs of running processes
- Checks port availability

**Best for**: Troubleshooting, monitoring, verification

---

### 6. **check-database.bat** - Database Check
```batch
quick-start\check-database.bat
```
**What it does**:
- Verifies PostgreSQL installation
- Checks service status
- Loads database config from .env
- Tests connection parameters
- Provides manual connection commands

**Best for**: Database troubleshooting, initial setup

---

### 7. **seed-data.bat** - Initial Data Seeding
```batch
quick-start\seed-data.bat
```
**What it does**:
- Starts backend briefly to trigger auto-seeding
- Creates default Super Admin
- Creates default Admin
- Seeds 13 KX brands
- Seeds 4 promotional banners

**Best for**: First-time database setup, reset scenarios

**Note**: Seeding happens automatically on first backend startup, this is just for manual re-seeding

---

## 🔧 Quick Start Guide

### First Time Setup

1. **Install Prerequisites**:
   - Python 3.10+ from https://www.python.org/
   - Node.js 18+ from https://nodejs.org/
   - PostgreSQL 14+ from https://www.postgresql.org/

2. **Clone Repository** (if not already done):
   ```bash
   cd "path/to/Phase-1-App-KX-GRID"
   ```

3. **Run First-Time Setup**:
   ```batch
   quick-start\start-all.bat
   ```

   This will:
   - Create .env files if missing
   - Offer to install dependencies if not found
   - Start both servers

4. **Configure Environment** (if prompted):
   - Edit `backend\.env` - Set database password and JWT secret
   - Edit `frontend\.env` - Verify backend URL

5. **Rerun** after configuration:
   ```batch
   quick-start\start-all.bat
   ```

---

## 📖 Typical Workflows

### Daily Development Workflow

```batch
# Start of day
quick-start\start-all.bat

# Work on your code...

# End of day
quick-start\stop-all.bat
```

---

### Backend-Only Development

```batch
# Start backend only
quick-start\start-backend.bat

# Work on backend code (with auto-reload)

# Stop when done
quick-start\stop-all.bat
```

---

### Frontend-Only Development

```batch
# Ensure backend is running first
quick-start\check-status.bat

# If backend not running:
quick-start\start-backend.bat

# Then start frontend
quick-start\start-frontend.bat
```

---

### Troubleshooting Workflow

```batch
# Check what's running
quick-start\check-status.bat

# If ports are in use by something else
quick-start\stop-all.bat

# Check database connection
quick-start\check-database.bat

# Start fresh
quick-start\start-all.bat
```

---

## 🔍 Troubleshooting

### "Port 8000 already in use"

**Solution**:
```batch
quick-start\stop-all.bat
```
Or manually kill process:
```batch
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

### "Port 3000 already in use"

**Solution**:
```batch
quick-start\stop-all.bat
```
Or manually kill process:
```batch
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### "Python virtual environment not found"

**Solution**:
```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### "Frontend node_modules not found"

**Solution**:
```batch
cd frontend
npm install --legacy-peer-deps
```

---

### "Database connection failed"

**Solutions**:
1. **Check PostgreSQL is running**:
   ```batch
   quick-start\check-database.bat
   ```

2. **Start PostgreSQL service**:
   ```batch
   net start postgresql-x64-16
   ```

3. **Verify credentials** in `backend\.env`:
   ```env
   POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kxgrid_db
   ```

4. **Create database** if it doesn't exist:
   ```bash
   psql -U postgres
   CREATE DATABASE kxgrid_db;
   \q
   ```

---

### Backend starts then immediately closes

**Possible causes**:
1. Missing or invalid .env configuration
2. Database connection failed
3. Python dependency error

**Solution**:
Run backend manually to see error:
```batch
cd backend
venv\Scripts\activate
uvicorn server:app --reload
```
Read the error message and fix the issue.

---

### Frontend shows "Connection refused" or CORS errors

**Cause**: Backend not running or wrong backend URL

**Solution**:
1. Check backend is running:
   ```batch
   quick-start\check-status.bat
   ```

2. Verify `frontend\.env`:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. Start backend if not running:
   ```batch
   quick-start\start-backend.bat
   ```

---

## ⚙️ Script Internals

### How PATH Resolution Works

All scripts use:
```batch
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"
```

This ensures scripts work from any location by:
1. Getting the script's directory (`%~dp0`)
2. Going up one level to project root (`..\\`)

### Port Configuration

| Service | Port | Protocol | Configurable? |
|---------|------|----------|---------------|
| Backend | 8000 | HTTP | Yes (edit start-backend.bat) |
| Frontend | 3000 | HTTP | Yes (set PORT env var) |
| PostgreSQL | 5432 | TCP | Yes (in POSTGRES_URL) |

---

## 🔐 Security Notes

1. **Never commit .env files** - They contain secrets
2. **Change default passwords** immediately:
   - Super Admin: root@kotlerx.com
   - Admin: admin@kotlerx.com
3. **Generate strong JWT secret**:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

---

## 📊 Script Features Matrix

| Script | Checks Prereqs | Installs Deps | Creates .env | Starts Servers | Health Check |
|--------|----------------|---------------|--------------|----------------|--------------|
| start-all.bat | ✅ | ✅ (optional) | ✅ | Backend + Frontend | ❌ |
| start-backend.bat | ✅ | ❌ | ✅ | Backend only | ❌ |
| start-frontend.bat | ✅ | ❌ | ✅ | Frontend only | ❌ |
| stop-all.bat | ❌ | ❌ | ❌ | Stops all | ❌ |
| check-status.bat | ❌ | ❌ | ❌ | ❌ | ✅ |
| check-database.bat | ✅ (PostgreSQL) | ❌ | ❌ | ❌ | ✅ |
| seed-data.bat | ✅ | ❌ | ❌ | Backend (temp) | ❌ |

---

## 🎓 Learning Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Uvicorn Docs**: https://www.uvicorn.org/

---

## 🐛 Known Issues & Limitations

1. **Windows Only**: These are .bat files for Windows
   - **Solution**: Create .sh equivalents for Linux/Mac

2. **Process Detection**: May not catch all edge cases
   - **Solution**: Use `check-status.bat` to verify

3. **PostgreSQL Version Detection**: Checks for versions 14-16
   - **Solution**: Edit scripts if using different version

4. **No Log Rotation**: Server logs not automatically managed
   - **Solution**: Manually clear logs or implement log rotation

---

## 📞 Getting Help

If scripts don't work:

1. **Check Status**:
   ```batch
   quick-start\check-status.bat
   ```

2. **Check Database**:
   ```batch
   quick-start\check-database.bat
   ```

3. **Stop All & Restart**:
   ```batch
   quick-start\stop-all.bat
   quick-start\start-all.bat
   ```

4. **Manual Start** (for detailed errors):
   ```batch
   # Backend
   cd backend
   venv\Scripts\activate
   uvicorn server:app --reload

   # Frontend (in new terminal)
   cd frontend
   npm start
   ```

5. **Review Documentation**:
   - `docs\SETUP-GUIDE.md` - Complete setup instructions
   - `docs\SECURITY-AUDIT.md` - Security issues
   - `docs\BAT-FILE-DOCUMENTATION.md` - Original script docs

---

## 🔄 Changelog

### Version 2.0.0 (2026-07-12)
- ✅ **FIXED**: Path resolution (was pointing to quick-start instead of project root)
- ✅ **NEW**: `stop-all.bat` - Gracefully stop all servers
- ✅ **NEW**: `check-status.bat` - Comprehensive status checker
- ✅ **NEW**: `check-database.bat` - Database connection tester
- ✅ **NEW**: `start-backend.bat` - Individual backend startup
- ✅ **NEW**: `start-frontend.bat` - Individual frontend startup
- ✅ **NEW**: `seed-data.bat` - Manual data seeding
- ✅ **IMPROVED**: `start-all.bat` - Better error handling, dep installation
- ✅ **IMPROVED**: All scripts now auto-create .env from templates
- ✅ **IMPROVED**: Better error messages with solutions
- ✅ **REMOVED**: Old broken `start-servers.bat`

### Version 1.0.0 (Original)
- Basic `start-servers.bat` (had path issues)

---

**Made with ❤️ for KotlerX Development Team**
