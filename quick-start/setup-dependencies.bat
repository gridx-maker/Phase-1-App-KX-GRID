@echo off
setlocal EnableDelayedExpansion

title KXGRID - Setup Dependencies

echo.
echo ========================================================================
echo  KXGRID - Install & Setup Dependencies
echo ========================================================================
echo.

REM Get project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo Installing Backend Dependencies...
echo.

cd /d "%PROJECT_ROOT%backend"

if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

if !errorlevel! neq 0 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

echo Installing Python packages...
pip install -r requirements.txt

if !errorlevel! neq 0 (
    echo [ERROR] Failed to install Python packages
    pause
    exit /b 1
)

echo.
echo [OK] Backend dependencies installed successfully!
echo.

REM Frontend setup
echo Installing Frontend Dependencies...
echo.

cd /d "%PROJECT_ROOT%frontend"

if not exist node_modules (
    echo Installing npm packages...
    call npm install --legacy-peer-deps

    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install npm packages
        pause
        exit /b 1
    )
)

echo.
echo ========================================================================
echo  All dependencies installed successfully!
echo ========================================================================
echo.
echo Next steps:
echo   1. Run: quick-start\start-backend-simple.bat
echo   2. In another terminal: quick-start\start-frontend-simple.bat
echo.
pause
