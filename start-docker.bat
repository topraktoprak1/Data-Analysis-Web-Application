@echo off
REM Docker Start Script for Windows
REM This script starts the application using Docker

echo ========================================
echo   Data Analysis App - Docker Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found! Creating from template...
    if exist ".env.template" (
        copy ".env.template" ".env" >nul
        echo [OK] Created .env file from template
        echo.
        echo [IMPORTANT] Please edit .env file and change:
        echo   1. POSTGRES_PASSWORD
        echo   2. SECRET_KEY
        echo.
        set /p continue="Continue with default values? (y/n): "
        if /i not "%continue%"=="y" (
            echo Please edit .env file and run this script again.
            pause
            exit /b 0
        )
    ) else (
        echo [ERROR] .env.template not found!
        pause
        exit /b 1
    )
) else (
    echo [OK] .env file found
)

echo.
echo ========================================
echo   Starting Docker Containers...
echo ========================================
echo.

REM Stop existing containers
echo Stopping existing containers...
docker-compose down >nul 2>&1

REM Start containers
echo Building and starting containers...
echo (This may take several minutes on first run)
echo.

docker-compose up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start containers!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Access the application at:
echo   Frontend:  http://localhost
echo   Backend:   http://localhost:5000
echo   Database:  localhost:5432
echo.
echo Default Admin Login:
echo   Username: admin
echo   Password: admin123
echo.
echo Useful Commands:
echo   View logs:     docker-compose logs -f
echo   Stop app:      docker-compose down
echo   Restart app:   docker-compose restart
echo.

REM Wait for services
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Show status
docker-compose ps

echo.
echo Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost

echo.
pause
