@echo off
REM ========================================================================
REM  KXGRID Frontend Server Launcher
REM  Simple and reliable frontend startup
REM ========================================================================

title KXGRID Frontend - React

cd /d "%~dp0..\frontend"

echo.
echo ========================================================================
echo  KXGRID Frontend Server
echo  React Development Server on Port 3000
echo ========================================================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking dependencies...
if not exist node_modules (
    echo [WARNING] Dependencies not found!
    echo Installing npm packages...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting React Development Server...
echo URL: http://localhost:3000
echo Backend: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================================================
echo.

call npm start

pause
