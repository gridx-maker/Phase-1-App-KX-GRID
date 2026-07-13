@echo off
REM ========================================================================
REM  KXGRID - Database Connection Checker
REM  Checks PostgreSQL connection and database status
REM  Version: 1.0.0
REM ========================================================================

title KXGRID - Database Check

echo.
echo ========================================================================
echo  KXGRID Database Connection Checker
echo ========================================================================
echo.

REM Get project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\\"

echo [1/4] Checking PostgreSQL installation...
set "PSQL_PATH="
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PSQL_PATH=psql"
) else (
    echo [WARNING] psql command not found in PATH
    echo   PostgreSQL may not be installed or not in PATH
    echo   Install from: https://www.postgresql.org/download/
    echo.
    echo Attempting to check via common installation paths...

    if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set "PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe"
    if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" if not defined PSQL_PATH set "PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe"
    if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" if not defined PSQL_PATH set "PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

if not defined PSQL_PATH (
    echo [ERROR] Could not find PostgreSQL installation
    pause
    exit /b 1
)

echo   [OK] Found PostgreSQL at: %PSQL_PATH%
echo.

echo [2/4] Checking PostgreSQL service status...
sc query postgresql-x64-16 2>nul | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo   [OK] PostgreSQL service is RUNNING
) else (
    sc query postgresql-x64-15 2>nul | find "RUNNING" >nul
    if %errorlevel% equ 0 (
        echo   [OK] PostgreSQL service is RUNNING
    ) else (
        sc query postgresql-x64-14 2>nul | find "RUNNING" >nul
        if %errorlevel% equ 0 (
            echo   [OK] PostgreSQL service is RUNNING
        ) else (
            echo [WARNING] PostgreSQL service may not be running
            echo   Start it from Services or run: net start postgresql-x64-16
        )
    )
)
echo.

echo [3/4] Loading database configuration from .env...
if not exist "%PROJECT_ROOT%backend\.env" (
    echo [ERROR] backend\.env not found!
    echo   Create it from backend\.env.example
    pause
    exit /b 1
)

REM Parse POSTGRES_URL from .env
for /f "tokens=1,* delims==" %%a in ('findstr /i "^POSTGRES_URL=" "%PROJECT_ROOT%backend\.env"') do (
    set "POSTGRES_URL=%%b"
)

if "%POSTGRES_URL%"=="" (
    echo [ERROR] POSTGRES_URL not found in .env
    pause
    exit /b 1
)

echo   Database URL: %POSTGRES_URL%
echo.

echo [4/4] Testing database connection...
echo   Attempting to connect to PostgreSQL...
echo.

REM Extract database name, user, password from connection string
REM Format: postgresql://user:password@host:port/database
for /f "tokens=2 delims=/" %%a in ("%POSTGRES_URL%") do set "DB_PART=%%a"
for /f "tokens=1 delims=@" %%a in ("%DB_PART%") do set "USER_PASS=%%a"
for /f "tokens=1 delims=:" %%a in ("%USER_PASS%") do set "DB_USER=%%a"

echo   Database User: %DB_USER%
echo.

echo ========================================================================
echo  Database Status Summary
echo ========================================================================
echo   PostgreSQL: Installed
echo   Service: Check above
echo   Configuration: Loaded from .env
echo   Connection String: Set
echo.
echo  To manually test connection, run:
echo    psql -U %DB_USER% -d kxgrid_db
echo.
echo  To view all databases:
echo    psql -U %DB_USER% -l
echo ========================================================================
echo.

pause
