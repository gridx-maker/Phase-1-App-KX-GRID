# 🚀 KXGRID - START HERE

**Quick Start Guide - Working Solution**

---

## ⚡ FASTEST WAY TO START (Recommended)

### **Option 1: Manual Start (Most Reliable)**

Open **2 command terminals** side by side.

#### **Terminal 1 - Backend Server**

```batch
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

---

#### **Terminal 2 - Frontend Server**

```batch
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in your browser
```

Browser should open automatically at http://localhost:3000

---

## ✅ Verify Servers Are Running

Once both show the success messages above:

1. **Backend API**: http://localhost:8000/docs
2. **Frontend**: http://localhost:3000
3. **Health Check**: http://localhost:8000/health

---

## 🎯 First-Time Setup

If you get **"module not found"** or **"command not found"** errors:

### **Step 1: Install Backend Dependencies**

```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Then try Terminal 1 commands again.

### **Step 2: Install Frontend Dependencies**

```batch
cd frontend
npm install --legacy-peer-deps
```

Then try Terminal 2 commands again.

---

## 🔑 Default Login Credentials

Once running, go to http://localhost:3000 and login with:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@kotlerx.com` | `admin123` |
| **Super Admin** | `root@kotlerx.com` | `KXRoot@2024` |

⚠️ **IMPORTANT**: Change these passwords immediately!

---

## 🛑 Stop Servers

In each terminal window:
- Press `Ctrl+C`

Or run:
```batch
quick-start\stop-all.bat
```

---

## 📊 Troubleshooting

### Backend Says "uvicorn: command not found"

**Solution**:
```batch
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

---

### Frontend Says "npm: command not found"

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

### Database Connection Error

**Check PostgreSQL is running**:
```batch
quick-start\check-database.bat
```

Start PostgreSQL service if needed, then retry.

---

### "Port 8000 already in use"

```batch
quick-start\stop-all.bat
```

Then start again.

---

## 🎨 What's Running

### Backend (Port 8000)
- FastAPI server
- PostgreSQL connection
- All API endpoints
- Interactive docs at http://localhost:8000/docs

### Frontend (Port 3000)
- React development server
- Connected to backend
- Auto-reload on code changes

---

## 📚 Full Documentation

Once servers are running, see:
- `quick-start/README.md` - Advanced startup options
- `docs/SETUP-GUIDE.md` - Complete setup guide
- `docs/SECURITY-AUDIT.md` - Security improvements needed
- `docs/ACTION-ITEMS-COMPLETE.md` - All action items

---

## ✅ Checklist

- [ ] Terminal 1: Backend running (`http://localhost:8000/docs`)
- [ ] Terminal 2: Frontend running (`http://localhost:3000`)
- [ ] Can access frontend UI
- [ ] Can login with admin credentials
- [ ] API docs page loads

**Everything working? Great! 🎉**

**Issues? Follow troubleshooting above or check the detailed documentation.**

---

**Last Updated**: 2026-07-13
