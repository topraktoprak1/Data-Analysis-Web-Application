# Docker Setup and Start Script for Windows
# Run this script to set up and start the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Data Analysis App - Docker Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not found"
    }
    Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "  Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is running
Write-Host "Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠ .env file not found! Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Host "✓ Created .env file from template" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ IMPORTANT: Please edit .env file and change:" -ForegroundColor Yellow
        Write-Host "  1. POSTGRES_PASSWORD (set a strong password)" -ForegroundColor Yellow
        Write-Host "  2. SECRET_KEY (generate with: python -c `"import secrets; print(secrets.token_hex(32))`")" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Do you want to continue with default values? (y/n)"
        if ($continue -ne "y") {
            Write-Host "Please edit .env file and run this script again." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "✗ .env.template not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Docker Containers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any existing containers
Write-Host "Stopping existing containers (if any)..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null

# Start containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow
Write-Host "(This may take several minutes on first run)" -ForegroundColor Gray
Write-Host ""

docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Application Started Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application at:" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://localhost" -ForegroundColor White
    Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
    Write-Host "  Database:  localhost:5432" -ForegroundColor White
    Write-Host ""
    Write-Host "Default Admin Login:" -ForegroundColor Cyan
    Write-Host "  Username: admin" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Cyan
    Write-Host "  View logs:        docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  Stop app:         docker-compose down" -ForegroundColor Gray
    Write-Host "  Restart app:      docker-compose restart" -ForegroundColor Gray
    Write-Host "  Check status:     docker-compose ps" -ForegroundColor Gray
    Write-Host ""
    
    # Wait a bit for services to be ready
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check health
    Write-Host "Checking service health..." -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host ""
    Write-Host "Opening application in browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Start-Process "http://localhost"
    
} else {
    Write-Host ""
    Write-Host "✗ Failed to start containers!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Ports already in use (change in .env file)" -ForegroundColor Gray
    Write-Host "  - Not enough Docker resources (increase in Docker Desktop settings)" -ForegroundColor Gray
    Write-Host "  - Build errors (check docker-compose logs)" -ForegroundColor Gray
}

Write-Host ""
Read-Host "Press Enter to exit"
