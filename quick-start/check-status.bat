@echo off
REM ========================================================================
REM  KXGRID - Server Status Checker
REM  Checks if servers are running and displays status
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Server Status

echo.
echo ========================================================================
echo  KXGRID Server Status Checker
echo ========================================================================
echo.

echo [1/4] Checking Backend Server (Port 8000)...
echo.

netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   Status: [RUNNING]
    echo   Port: 8000
    echo   URL: http://localhost:8000
    echo   API Docs: http://localhost:8000/docs

    REM Get PID
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
        echo   PID: %%a
        set BACKEND_PID=%%a
    )

    REM Test backend health endpoint
    echo.
    echo   Testing health endpoint...
    curl -s http://localhost:8000/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo   Health Check: [OK]
    ) else (
        echo   Health Check: [FAILED - Server may still be starting]
    )
) else (
    echo   Status: [NOT RUNNING]
    echo   To start: quick-start\start-backend.bat
)

echo.
echo [2/4] Checking Frontend Server (Port 3000)...
echo.

netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   Status: [RUNNING]
    echo   Port: 3000
    echo   URL: http://localhost:3000

    REM Get PID
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo   PID: %%a
        set FRONTEND_PID=%%a
    )
) else (
    echo   Status: [NOT RUNNING]
    echo   To start: quick-start\start-frontend.bat
)

echo.
echo [3/4] Checking PostgreSQL Database...
echo.

sc query postgresql-x64-16 2>nul | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo   Status: [RUNNING]
    echo   Service: postgresql-x64-16
    goto db_running
)

sc query postgresql-x64-15 2>nul | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo   Status: [RUNNING]
    echo   Service: postgresql-x64-15
    goto db_running
)

sc query postgresql-x64-14 2>nul | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo   Status: [RUNNING]
    echo   Service: postgresql-x64-14
    goto db_running
)

echo   Status: [NOT RUNNING or NOT INSTALLED]
echo   Check: Services (services.msc) or install PostgreSQL
goto db_check_done

:db_running
netstat -ano | findstr :5432 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo   Port 5432: [LISTENING]
) else (
    echo   Port 5432: [NOT LISTENING - Check configuration]
)

:db_check_done

echo.
echo [4/4] Checking Port Availability...
echo.

REM Check if ports are available when servers are not running
set "PORT_8000_LISTENING="
netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 set PORT_8000_LISTENING=1

netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo   Port 8000: [AVAILABLE]
) else (
    if not defined PORT_8000_LISTENING (
        echo   Port 8000: [IN USE by another process]
    )
)

set "PORT_3000_LISTENING="
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 set PORT_3000_LISTENING=1

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo   Port 3000: [AVAILABLE]
) else (
    if not defined PORT_3000_LISTENING (
        echo   Port 3000: [IN USE by another process]
    )
)

echo.
echo ========================================================================
echo  System Status Summary
echo ========================================================================
echo.

REM Overall status
set BACKEND_RUNNING=0
set FRONTEND_RUNNING=0

netstat -ano | findstr :8000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 set BACKEND_RUNNING=1

netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 set FRONTEND_RUNNING=1

set ALL_RUNNING=0
if %BACKEND_RUNNING%==1 if %FRONTEND_RUNNING%==1 set ALL_RUNNING=1

if %ALL_RUNNING%==1 (
    echo   Overall Status: [ALL SYSTEMS OPERATIONAL]
    echo.
    echo   Access your application:
    echo     Frontend: http://localhost:3000
    echo     Backend API: http://localhost:8000/docs
    echo.
    echo   To stop all servers: quick-start\stop-all.bat
) else (
    echo   Overall Status: [SOME SERVICES NOT RUNNING]
    echo.
    echo   To start all servers: quick-start\start-all.bat
    echo   Or start individually:
    echo     - Backend: quick-start\start-backend.bat
    echo     - Frontend: quick-start\start-frontend.bat
)

echo ========================================================================
echo.

pause
