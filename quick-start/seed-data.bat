@echo off
REM ========================================================================
REM  KXGRID - Database Seeding Script
REM  Seeds initial data (super admin, brands, banners, etc.)
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Database Seeding

echo.
echo ========================================================================
echo  KXGRID Database Seeding
echo  This will seed initial data to the database
echo ========================================================================
echo.

REM Get project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo [WARNING] This operation will:
echo   - Create default Super Admin (root@kotlerx.com)
echo   - Create default Admin (admin@kotlerx.com)
echo   - Seed default KX brands (13 brands)
echo   - Seed promotional banners (4 banners)
echo.
echo   NOTE: Data seeding happens automatically on backend startup
echo   This script just starts the backend server briefly to trigger seeding
echo.
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo [1/3] Checking Python and virtual environment...
if not exist "%PROJECT_ROOT%backend\venv\" (
    echo [ERROR] Virtual environment not found!
    echo   Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)
echo   [OK] Virtual environment exists
echo.

echo [2/3] Checking database configuration...
if not exist "%PROJECT_ROOT%backend\.env" (
    echo [ERROR] backend\.env not found!
    echo   Create it from backend\.env.example and configure POSTGRES_URL
    pause
    exit /b 1
)
echo   [OK] Environment configured
echo.

echo [3/3] Starting backend server to trigger seeding...
echo   The server will start and seed data automatically
echo   Press Ctrl+C after you see "KXGRID API startup complete"
echo.
cd /d "%PROJECT_ROOT%backend"
call venv\Scripts\activate

uvicorn server:app --host 127.0.0.1 --port 8000

echo.
echo ========================================================================
echo  Seeding Status
echo ========================================================================
echo   If you saw these messages above:
echo     - "KX ROOT Super Admin created"
echo     - "Standard Admin admin@kotlerx.com created"
echo     - "Seeded X default brands"
echo     - "Seeded initial promotional banners"
echo.
echo   Then seeding was SUCCESSFUL!
echo.
echo   Default Credentials:
echo     Super Admin: root@kotlerx.com / KXRoot@2024
echo     Admin: admin@kotlerx.com / admin123
echo.
echo   IMPORTANT: Change these passwords in production!
echo ========================================================================
echo.
pause
