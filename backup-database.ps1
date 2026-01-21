# Database Backup Script for Windows
# Automatically creates a timestamped backup of the PostgreSQL database

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backups/backup_$timestamp.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Backup Utility" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
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

# Check if database container is running
Write-Host "Checking database container..." -ForegroundColor Yellow
$dbContainer = docker-compose ps -q db 2>$null
if (-not $dbContainer) {
    Write-Host "✗ Database container is not running!" -ForegroundColor Red
    Write-Host "  Please start the application first with: docker-compose up -d" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Database container is running" -ForegroundColor Green

Write-Host ""
Write-Host "Creating backup..." -ForegroundColor Yellow
Write-Host "File: $backupFile" -ForegroundColor Gray

# Create backups directory if it doesn't exist
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
}

# Perform backup
try {
    docker-compose exec -T db pg_dump -U postgres veri_analizi > $backupFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $backupFile).Length
        $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Backup Completed Successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Backup Details:" -ForegroundColor Cyan
        Write-Host "  File: $backupFile" -ForegroundColor White
        Write-Host "  Size: $fileSizeKB KB" -ForegroundColor White
        Write-Host "  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        Write-Host ""
        Write-Host "To restore this backup later, run:" -ForegroundColor Yellow
        Write-Host "  Get-Content $backupFile | docker-compose exec -T db psql -U postgres veri_analizi" -ForegroundColor Gray
        Write-Host ""
        
        # List recent backups
        Write-Host "Recent backups:" -ForegroundColor Cyan
        Get-ChildItem "backups\backup_*.sql" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 5 | 
            ForEach-Object {
                $size = [math]::Round($_.Length / 1KB, 2)
                Write-Host "  $($_.Name) - $size KB - $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
            }
        
    } else {
        throw "Backup command failed"
    }
} catch {
    Write-Host ""
    Write-Host "✗ Backup failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"
