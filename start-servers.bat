@echo off
REM ========================================================================
REM  KXGRID - KotlerX Unified Platform Server Startup Script
REM
REM  This script starts both the Backend (FastAPI) and Frontend (React) servers
REM  Version: 1.0.0
REM  Author: KotlerX Team
REM ========================================================================

title KXGRID - Server Startup

echo.
echo ========================================================================
echo  KXGRID - KotlerX Unified Platform
echo  Starting Development Servers...
echo ========================================================================
echo.

REM Store the current directory
set "PROJECT_ROOT=%~dp0"

REM ========================================================================
REM  PRE-FLIGHT CHECKS
REM ========================================================================

echo [1/5] Running pre-flight checks...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
echo   [OK] Python detected

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
echo   [OK] Node.js detected

REM Check if PostgreSQL is accessible (optional check)
echo   [INFO] Make sure PostgreSQL is running on localhost:5432
echo.

REM ========================================================================
REM  ENVIRONMENT VARIABLE CHECKS
REM ========================================================================

echo [2/5] Checking environment configuration...
echo.

REM Check for backend .env file
if not exist "%PROJECT_ROOT%backend\.env" (
    echo [WARNING] Backend .env file not found!
    echo Creating template .env file from .env.example...
    if exist "%PROJECT_ROOT%backend\.env.example" (
        copy "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env" >nul
        echo   [CREATED] backend\.env created from .env.example
        echo   [ACTION REQUIRED] Please configure backend\.env with your credentials!
    ) else (
        echo [ERROR] .env.example not found. Please create backend\.env manually.
        echo See SETUP-GUIDE.md for configuration details.
    )
    echo.
) else (
    echo   [OK] Backend .env file exists
)

REM Check for frontend .env file
if not exist "%PROJECT_ROOT%frontend\.env" (
    echo [WARNING] Frontend .env file not found!
    echo Creating template .env file from .env.example...
    if exist "%PROJECT_ROOT%frontend\.env.example" (
        copy "%PROJECT_ROOT%frontend\.env.example" "%PROJECT_ROOT%frontend\.env" >nul
        echo   [CREATED] frontend\.env created from .env.example
    ) else (
        echo [ERROR] .env.example not found. Please create frontend\.env manually.
        echo See SETUP-GUIDE.md for configuration details.
    )
    echo.
) else (
    echo   [OK] Frontend .env file exists
)

echo.

REM ========================================================================
REM  DEPENDENCY CHECKS
REM ========================================================================

echo [3/5] Checking dependencies...
echo.

REM Check if backend dependencies are installed
if not exist "%PROJECT_ROOT%backend\venv\" (
    echo [WARNING] Python virtual environment not found!
    echo   Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    echo.
) else (
    echo   [OK] Python virtual environment exists
)

REM Check if frontend dependencies are installed
if not exist "%PROJECT_ROOT%frontend\node_modules\" (
    echo [WARNING] Frontend node_modules not found!
    echo   Run: cd frontend ^&^& npm install --legacy-peer-deps
    echo.
) else (
    echo   [OK] Frontend node_modules exists
)

echo.

REM ========================================================================
REM  START BACKEND SERVER (FastAPI with Uvicorn)
REM ========================================================================

echo [4/5] Starting Backend Server (FastAPI)...
echo.

REM Open a new command window for the backend
start "KXGRID Backend - FastAPI (Port 8000)" cmd /k "cd /d "%PROJECT_ROOT%backend" && if exist venv\Scripts\activate (venv\Scripts\activate) && echo [BACKEND] Starting FastAPI server on http://localhost:8000 && echo [BACKEND] API Docs: http://localhost:8000/docs && echo. && uvicorn server:app --host 0.0.0.0 --port 8000 --reload"

echo   [OK] Backend server starting in new window...
echo   Backend URL: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.

REM Wait a bit for backend to initialize
timeout /t 3 /nobreak >nul

REM ========================================================================
REM  START FRONTEND SERVER (React with CRACO)
REM ========================================================================

echo [5/5] Starting Frontend Server (React)...
echo.

REM Open a new command window for the frontend
start "KXGRID Frontend - React (Port 3000)" cmd /k "cd /d "%PROJECT_ROOT%frontend" && echo [FRONTEND] Starting React development server on http://localhost:3000 && echo [FRONTEND] Please wait, this may take a moment... && echo. && npm start"

echo   [OK] Frontend server starting in new window...
echo   Frontend URL: http://localhost:3000
echo.

REM ========================================================================
REM  COMPLETION
REM ========================================================================

echo ========================================================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ========================================================================
echo.
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  Frontend: http://localhost:3000
echo.
echo  Two new command windows have been opened:
echo    1. KXGRID Backend - FastAPI (Port 8000)
echo    2. KXGRID Frontend - React (Port 3000)
echo.
echo  To stop the servers:
echo    - Close both command windows OR
echo    - Press Ctrl+C in each window
echo.
echo  Logs and errors will appear in their respective windows.
echo ========================================================================
echo.
echo Press any key to close this startup window...
pause >nul

exit /b 0
