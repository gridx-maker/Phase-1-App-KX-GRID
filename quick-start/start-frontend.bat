@echo off
REM ========================================================================
REM  KXGRID - Frontend Server Startup Script
REM  Starts only the React frontend server
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Starting Frontend Server

echo.
echo ========================================================================
echo  KXGRID Frontend Server
echo  Starting React Development Server on Port 3000
echo ========================================================================
echo.

REM Get project root (parent of quick-start folder)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found! Install from https://nodejs.org/
    pause
    exit /b 1
)
echo   [OK] Node.js detected
echo.

echo [2/3] Checking frontend environment...
if not exist "%PROJECT_ROOT%frontend\node_modules\" (
    echo [ERROR] Dependencies not installed!
    echo   Run: cd frontend ^&^& npm install --legacy-peer-deps
    pause
    exit /b 1
)
echo   [OK] Dependencies installed
echo.

if not exist "%PROJECT_ROOT%frontend\.env" (
    echo [WARNING] .env file not found! Creating from template...
    if exist "%PROJECT_ROOT%frontend\.env.example" (
        copy "%PROJECT_ROOT%frontend\.env.example" "%PROJECT_ROOT%frontend\.env" >nul
        echo   [CREATED] Using default configuration
    )
)
echo   [OK] Environment configured
echo.

echo [3/3] Starting Frontend Server...
cd /d "%PROJECT_ROOT%frontend"

echo.
echo ========================================================================
echo  Frontend Server Running
echo  URL: http://localhost:3000
echo  Backend: %REACT_APP_BACKEND_URL%
echo ========================================================================
echo  Press Ctrl+C to stop the server
echo ========================================================================
echo.

npm start
