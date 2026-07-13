# 🔧 Troubleshooting Guide

**Problem**: Terminal opens but nothing starts - "uvicorn is not recognized" or "cargo" shows up

---

## 🎯 Quick Fix (Do This First!)

### **Use the New Simpler Scripts**

Instead of `start-all.bat`, use:

**Terminal 1 - Backend**:
```batch
quick-start\run-backend.bat
```

**Terminal 2 - Frontend**:
```batch
quick-start\run-frontend.bat
```

These are simpler and more reliable!

---

## 🔍 What Went Wrong?

The original `start-all.bat` had issues:
1. ❌ Virtual environment activation syntax was wrong
2. ❌ Path references were incorrect
3. ❌ No error checking for missing dependencies

The new `run-backend.bat` and `run-frontend.bat`:
- ✅ Use direct Python commands (more reliable)
- ✅ Better error handling
- ✅ Auto-installs missing dependencies

---

## 📋 Step-by-Step Manual Startup

### **If scripts still don't work, do this manually:**

#### **Terminal 1: Backend**

```batch
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

If you get "uvicorn not found":
```batch
cd backend
python -m pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

#### **Terminal 2: Frontend**

```batch
cd frontend
npm start
```

If you get "npm not found":
```batch
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## ❓ Common Error Messages

### **"uvicorn is not recognized"**

**Cause**: Dependencies not installed

**Solution**:
```batch
cd backend
python -m pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

---

### **"npm is not recognized"**

**Cause**: Node.js not installed

**Solution**:
1. Install Node.js from https://nodejs.org/
2. Restart command prompt
3. Run:
```batch
cd frontend
npm install --legacy-peer-deps
npm start
```

---

### **"cargo" appears (Weird!)**

**Cause**: Wrong terminal or PATH confusion

**Solution**:
1. Close all terminals
2. Open fresh command prompt
3. Use new simple scripts:
```batch
quick-start\run-backend.bat
quick-start\run-frontend.bat
```

---

### **"Port 8000 already in use"**

**Cause**: Backend still running from previous attempt

**Solution**:
```batch
quick-start\stop-all.bat
```

Or manually kill processes:
```batch
REM Find what's using port 8000
netstat -ano | findstr :8000

REM Kill it (replace XXXX with PID)
taskkill /PID XXXX /F
```

---

### **"Cannot find module" (Python error)**

**Cause**: Virtual environment not activated or requirements not installed

**Solution**:
```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

---

### **"node_modules not found"**

**Cause**: Frontend dependencies not installed

**Solution**:
```batch
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## ✅ Verification Checklist

After servers start, verify:

- [ ] Backend console shows: `Application startup complete`
- [ ] Frontend console shows: `Compiled successfully!`
- [ ] Browser opened at http://localhost:3000
- [ ] Can access http://localhost:8000/docs
- [ ] No error messages in console

---

## 🆘 If Nothing Works

### **Step 1: Check Prerequisites**

```batch
python --version
node --version
npm --version
```

All should return version numbers.

If any are missing:
- Python: https://www.python.org/
- Node.js: https://nodejs.org/

---

### **Step 2: Reinstall Everything**

```batch
REM Backend
cd backend
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

REM Frontend
cd ..\frontend
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

---

### **Step 3: Test Individual Components**

**Backend only**:
```batch
cd backend
venv\Scripts\activate
python -m uvicorn server:app --reload
```

**Frontend only**:
```batch
cd frontend
npm start
```

If both work independently, issue is with both starting together.

---

### **Step 4: Check Database**

```batch
quick-start\check-database.bat
```

Make sure PostgreSQL is running!

---

## 📞 Still Stuck?

Check these files for more info:
- `quick-start/START-HERE.md` - Simple getting started
- `docs/SETUP-GUIDE.md` - Detailed setup instructions
- `docs/ACTION-ITEMS-COMPLETE.md` - All known issues

---

## 🎯 Recommended Approach

**Don't use**: `start-all.bat` (complex, can fail)

**Use instead**:
1. `quick-start\run-backend.bat` in Terminal 1
2. `quick-start\run-frontend.bat` in Terminal 2

**Or manual** if scripts fail:
```batch
# Terminal 1
cd backend && python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2
cd frontend && npm start
```

---

**Version**: 1.0
**Last Updated**: 2026-07-13
