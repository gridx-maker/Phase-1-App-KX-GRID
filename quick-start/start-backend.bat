@echo off
REM ========================================================================
REM  KXGRID - Backend Server Startup Script
REM  Starts only the FastAPI backend server
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Starting Backend Server

echo.
echo ========================================================================
echo  KXGRID Backend Server
echo  Starting FastAPI on Port 8000
echo ========================================================================
echo.

REM Get project root (parent of quick-start folder)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Install from https://www.python.org/
    pause
    exit /b 1
)
echo   [OK] Python detected
echo.

echo [2/3] Checking backend environment...
if not exist "%PROJECT_ROOT%backend\venv\" (
    echo [ERROR] Virtual environment not found!
    echo   Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)
echo   [OK] Virtual environment exists
echo.

if not exist "%PROJECT_ROOT%backend\.env" (
    echo [WARNING] .env file not found! Creating from template...
    if exist "%PROJECT_ROOT%backend\.env.example" (
        copy "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env" >nul
        echo   [CREATED] Please configure backend\.env before starting!
        pause
        exit /b 1
    )
)
echo   [OK] Environment configured
echo.

echo [3/3] Starting Backend Server...
cd /d "%PROJECT_ROOT%backend"
call venv\Scripts\activate

echo.
echo ========================================================================
echo  Backend Server Running
echo  URL: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  Health Check: http://localhost:8000/health
echo ========================================================================
echo  Press Ctrl+C to stop the server
echo ========================================================================
echo.

uvicorn server:app --host 0.0.0.0 --port 8000 --reload
