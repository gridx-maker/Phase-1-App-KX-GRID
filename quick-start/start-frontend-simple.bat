@echo off
setlocal EnableDelayedExpansion

title KXGRID Frontend Server

cd /d "%~dp0..\frontend"

echo ========================================================================
echo  KXGRID Frontend Server - Starting
echo ========================================================================
echo.
echo Current Directory: %cd%
echo.

if not exist node_modules (
    echo [ERROR] node_modules not found!
    echo Run this first:
    echo   npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo ========================================================================
echo  Starting React Development Server
echo  URL: http://localhost:3000
echo ========================================================================
echo.

npm start
