@echo off
REM ========================================================================
REM  KXGRID Backend Server Launcher
REM  Simple and reliable backend startup
REM ========================================================================

title KXGRID Backend - FastAPI

cd /d "%~dp0..\backend"

echo.
echo ========================================================================
echo  KXGRID Backend Server
echo  FastAPI on Port 8000
echo ========================================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

echo Checking dependencies...
python -m pip show uvicorn >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] uvicorn not installed!
    echo Installing requirements...
    python -m pip install -r requirements.txt
)

echo.
echo Starting FastAPI Backend Server...
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================================================
echo.

python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

pause
