@echo off
REM ========================================================================
REM  KXGRID - Stop All Servers
REM  Terminates Backend and Frontend servers
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Stopping All Servers

echo.
echo ========================================================================
echo  KXGRID - Stop All Servers
echo ========================================================================
echo.

echo [1/3] Searching for running servers...
echo.

REM Check for backend (uvicorn on port 8000)
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   [FOUND] Backend server on port 8000
    set BACKEND_FOUND=1
) else (
    echo   [NOT RUNNING] Backend server (port 8000)
    set BACKEND_FOUND=0
)

REM Check for frontend (React on port 3000)
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   [FOUND] Frontend server on port 3000
    set FRONTEND_FOUND=1
) else (
    echo   [NOT RUNNING] Frontend server (port 3000)
    set FRONTEND_FOUND=0
)

if %BACKEND_FOUND%==0 if %FRONTEND_FOUND%==0 (
    echo.
    echo ========================================================================
    echo  No servers are currently running
    echo ========================================================================
    echo.
    pause
    exit /b 0
)

echo.
echo [WARNING] This will stop all running KXGRID servers
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [2/3] Stopping servers...
echo.

REM Stop backend (port 8000)
if %BACKEND_FOUND%==1 (
    echo Stopping Backend server on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
        if %errorlevel% equ 0 (
            echo   [STOPPED] Backend server (PID: %%a)
        )
    )
)

REM Stop frontend (port 3000)
if %FRONTEND_FOUND%==1 (
    echo Stopping Frontend server on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
        if %errorlevel% equ 0 (
            echo   [STOPPED] Frontend server (PID: %%a)
        )
    )
)

REM Also kill any node.exe processes running npm start
echo.
echo Cleaning up additional processes...
taskkill /IM "node.exe" /F >nul 2>&1
taskkill /IM "python.exe" /F /FI "WINDOWTITLE eq KXGRID*" >nul 2>&1

echo.
echo [3/3] Verifying servers are stopped...
timeout /t 2 /nobreak >nul

netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo   [OK] Port 8000 is now free
) else (
    echo   [WARNING] Port 8000 may still be in use
)

netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo   [OK] Port 3000 is now free
) else (
    echo   [WARNING] Port 3000 may still be in use
)

echo.
echo ========================================================================
echo  All servers have been stopped
echo ========================================================================
echo.
echo  To start servers again:
echo    - Run: quick-start\start-all.bat
echo    - Or start individually:
echo      - Backend: quick-start\start-backend.bat
echo      - Frontend: quick-start\start-frontend.bat
echo ========================================================================
echo.
pause
