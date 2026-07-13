@echo off
setlocal EnableDelayedExpansion

title KXGRID Backend Server

cd /d "%~dp0..\backend"

echo ========================================================================
echo  KXGRID Backend Server - Starting
echo ========================================================================
echo.
echo Current Directory: %cd%
echo.

REM Try to activate venv
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
    echo Virtual environment activated
    echo.
) else (
    echo [ERROR] Virtual environment not found!
    echo Run this first:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

echo ========================================================================
echo  Starting FastAPI Backend Server
echo  URL: http://localhost:8000
echo  Docs: http://localhost:8000/docs
echo ========================================================================
echo.

REM Start uvicorn
%~dp0..\backend\venv\Scripts\uvicorn.exe server:app --host 0.0.0.0 --port 8000 --reload
