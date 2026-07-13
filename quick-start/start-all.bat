@echo off
setlocal EnableDelayedExpansion
REM ========================================================================
REM  KXGRID - Start All Servers
REM  Starts Backend and Frontend in separate windows
REM  Version: 1.0.0 (FIXED)
REM ========================================================================

title KXGRID - Starting All Servers

echo.
echo ========================================================================
echo  KXGRID - KotlerX Unified Platform
echo  Starting All Development Servers
echo ========================================================================
echo.

REM Get project root (parent of quick-start folder)
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo Project Root: %PROJECT_ROOT%
echo.

REM ========================================================================
REM  PRE-FLIGHT CHECKS
REM ========================================================================

echo [1/5] Running pre-flight checks...
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not installed! Get it from https://www.python.org/
    pause
    exit /b 1
)
echo   [OK] Python detected

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed! Get it from https://nodejs.org/
    pause
    exit /b 1
)
echo   [OK] Node.js detected
echo.

REM ========================================================================
REM  ENVIRONMENT CHECKS
REM ========================================================================

echo [2/5] Checking environment configuration...
echo.

REM Backend .env check
if not exist "%PROJECT_ROOT%backend\.env" (
    echo [WARNING] Backend .env not found!
    if exist "%PROJECT_ROOT%backend\.env.example" (
        copy "%PROJECT_ROOT%backend\.env.example" "%PROJECT_ROOT%backend\.env" >nul
        echo   [CREATED] backend\.env from template
        echo   [ACTION] Configure your credentials in backend\.env!
        echo.
        set /p CONTINUE="Continue anyway? (Y/N): "
        if /i not "!CONTINUE!"=="Y" (
            echo Setup cancelled. Please configure backend\.env
            pause
            exit /b 1
        )
    ) else (
        echo [ERROR] .env.example not found!
        pause
        exit /b 1
    )
) else (
    echo   [OK] Backend .env exists
)

REM Frontend .env check
if not exist "%PROJECT_ROOT%frontend\.env" (
    echo [WARNING] Frontend .env not found!
    if exist "%PROJECT_ROOT%frontend\.env.example" (
        copy "%PROJECT_ROOT%frontend\.env.example" "%PROJECT_ROOT%frontend\.env" >nul
        echo   [CREATED] frontend\.env from template
    )
) else (
    echo   [OK] Frontend .env exists
)
echo.

REM ========================================================================
REM  DEPENDENCY CHECKS
REM ========================================================================

echo [3/5] Checking dependencies...
echo.

if not exist "%PROJECT_ROOT%backend\venv\" (
    echo [WARNING] Python venv not found!
    echo   Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    echo.
    set /p INSTALL="Install now? (Y/N): "
    if /i "!INSTALL!"=="Y" (
        cd /d "%PROJECT_ROOT%backend"
        echo Installing backend dependencies...
        python -m venv venv
        call venv\Scripts\activate
        pip install -r requirements.txt
        cd /d "%SCRIPT_DIR%"
    ) else (
        echo Cannot start without dependencies!
        pause
        exit /b 1
    )
) else (
    echo   [OK] Python venv exists
)

if not exist "%PROJECT_ROOT%frontend\node_modules\" (
    echo [WARNING] Frontend node_modules not found!
    echo   Run: cd frontend ^&^& npm install --legacy-peer-deps
    echo.
    set /p INSTALL="Install now? (Y/N): "
    if /i "!INSTALL!"=="Y" (
        cd /d "%PROJECT_ROOT%frontend"
        echo Installing frontend dependencies...
        call npm install --legacy-peer-deps
        cd /d "%SCRIPT_DIR%"
    ) else (
        echo Cannot start without dependencies!
        pause
        exit /b 1
    )
) else (
    echo   [OK] Frontend node_modules exists
)
echo.

REM ========================================================================
REM  START BACKEND SERVER
REM ========================================================================

echo [4/5] Starting Backend Server...
echo.

start "KXGRID Backend - Port 8000" cmd /k "cd /d "%PROJECT_ROOT%backend" && call venv\Scripts\activate && echo. && echo ======================================================================== && echo  KXGRID Backend Server && echo  Port: 8000 && echo  API Docs: http://localhost:8000/docs && echo ======================================================================== && echo. && uvicorn server:app --host 0.0.0.0 --port 8000 --reload"

echo   [OK] Backend starting in new window
echo   URL: http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo.

REM Wait for backend to initialize
echo   Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

REM ========================================================================
REM  START FRONTEND SERVER
REM ========================================================================

echo [5/5] Starting Frontend Server...
echo.

start "KXGRID Frontend - Port 3000" cmd /k "cd /d "%PROJECT_ROOT%frontend" && echo. && echo ======================================================================== && echo  KXGRID Frontend Server && echo  Port: 3000 && echo  Backend: http://localhost:8000 && echo ======================================================================== && echo. && npm start"

echo   [OK] Frontend starting in new window
echo   URL: http://localhost:3000
echo.

REM ========================================================================
REM  COMPLETION
REM ========================================================================

echo.
echo ========================================================================
echo  SERVERS STARTED SUCCESSFULLY!
echo ========================================================================
echo.
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  Frontend: http://localhost:3000
echo.
echo  Two command windows have been opened:
echo    1. Backend (FastAPI) - Port 8000
echo    2. Frontend (React) - Port 3000
echo.
echo  To stop servers:
echo    - Run: quick-start\stop-all.bat
echo    - OR close both command windows
echo    - OR press Ctrl+C in each window
echo.
echo  To check server status:
echo    - Run: quick-start\check-status.bat
echo ========================================================================
echo.
echo Press any key to close this window...
pause >nul
