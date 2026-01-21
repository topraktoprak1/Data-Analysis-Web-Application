# 🐳 Docker Deployment Guide

Complete guide to deploy the Data Analysis Web Application using Docker on any computer.

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
  - Download: https://www.docker.com/products/docker-desktop
  - Minimum version: Docker 20.10+, Docker Compose 2.0+
- **Git** (to clone the repository)

## 🚀 Quick Start (First Time Setup)

### Step 1: Clone or Copy the Project

```bash
# If using Git
git clone <your-repo-url>
cd Data-Analysis-Web-Application

# Or simply copy the entire project folder to your target computer
```

### Step 2: Configure Environment Variables

1. Copy the environment template:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.template .env

   # Linux/Mac
   cp .env.template .env
   ```

2. Edit `.env` file with your preferred text editor and change these important values:
   ```env
   # Change the database password!
   POSTGRES_PASSWORD=your_strong_password_here
   
   # Generate a secret key (run this in Python)
   # python -c "import secrets; print(secrets.token_hex(32))"
   SECRET_KEY=your_generated_64_character_secret_key_here
   ```

### Step 3: Start the Application

```bash
docker-compose up -d
```

This command will:
- Download necessary Docker images
- Build the backend and frontend
- Start PostgreSQL database
- Start the Flask backend
- Start the Nginx frontend server

### Step 4: Access the Application

- **Frontend (Web Interface)**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123` (change this after first login!)

## 📦 What Gets Created?

### Docker Containers
- `veri-analizi-db` - PostgreSQL database
- `veri-analizi-web` - Flask backend application
- `veri-analizi-frontend` - Nginx serving React frontend

### Docker Volumes (Persistent Data)
- `postgres_data` - Database files (survives container restarts)
- `uploads_data` - Uploaded files
- `instance_data` - Application instance data

## 🔧 Common Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs frontend
docker-compose logs db

# Follow logs (live)
docker-compose logs -f web
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove All Data (⚠️ Warning: Deletes database!)
```bash
docker-compose down -v
```

### Restart a Specific Service
```bash
docker-compose restart web
docker-compose restart frontend
```

### Rebuild After Code Changes
```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build web
```

## 🔄 Updating on Another Computer

### To move to a new computer:

1. **Copy the entire project folder** to the new computer
2. Make sure Docker is installed on the new computer
3. Navigate to the project folder
4. Run the same commands:
   ```bash
   docker-compose up -d
   ```

### To preserve your data when moving:

**Option A: Backup Database** (Recommended)
```bash
# On old computer - backup
docker-compose exec db pg_dump -U postgres veri_analizi > backup.sql

# Copy backup.sql to new computer

# On new computer - restore
cat backup.sql | docker-compose exec -T db psql -U postgres veri_analizi
```

**Option B: Copy Docker Volumes**
```bash
# Export volume data
docker run --rm -v veri-analizi_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Copy postgres_backup.tar.gz to new computer

# Import on new computer
docker run --rm -v veri-analizi_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 🌐 Access from Other Computers on Network

To access the application from other computers on your local network:

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   # or
   hostname -I
   ```

2. Other computers can access via:
   - Frontend: `http://YOUR_IP_ADDRESS`
   - Backend API: `http://YOUR_IP_ADDRESS:5000`

3. **Firewall Configuration** (if needed):
   - Windows: Allow ports 80 and 5000 through Windows Firewall
   - Linux: `sudo ufw allow 80` and `sudo ufw allow 5000`

## 🔒 Production Security Checklist

Before deploying to production or exposing to the internet:

- [ ] Change `POSTGRES_PASSWORD` in `.env`
- [ ] Generate and set strong `SECRET_KEY` in `.env`
- [ ] Change admin password after first login
- [ ] Consider using HTTPS (add nginx SSL configuration)
- [ ] Restrict database port access (remove `DB_PORT` mapping in docker-compose.yml)
- [ ] Review and restrict CORS origins in `app.py`
- [ ] Set up regular database backups
- [ ] Monitor logs for security issues

## 🛠️ Troubleshooting

### Port Already in Use
If you get port conflict errors, change ports in `.env`:
```env
DB_PORT=5433
BACKEND_PORT=5001
FRONTEND_PORT=8080
```

### Database Connection Failed
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Frontend Can't Connect to Backend
```bash
# Check backend health
curl http://localhost:5000/api/health

# View backend logs
docker-compose logs web
```

### Out of Disk Space
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## 📊 Health Checks

The application includes built-in health checks:

```bash
# Backend health
curl http://localhost:5000/api/health

# Check container health status
docker-compose ps
```

## 🔄 Backup and Restore

### Automated Backup Script (Windows PowerShell)
```powershell
# backup.ps1
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker-compose exec -T db pg_dump -U postgres veri_analizi > "backups/backup_$timestamp.sql"
Write-Host "Backup created: backups/backup_$timestamp.sql"
```

### Restore from Backup
```bash
# Windows PowerShell
Get-Content backups/backup_20260121_120000.sql | docker-compose exec -T db psql -U postgres veri_analizi

# Linux/Mac
cat backups/backup_20260121_120000.sql | docker-compose exec -T db psql -U postgres veri_analizi
```

## 📧 Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Review this guide's troubleshooting section
4. Check Docker Desktop dashboard for resource issues

## 🎯 Architecture

```
┌─────────────────────────────────────────────┐
│          User's Browser                      │
│          http://localhost                    │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    Frontend Container (Nginx)               │
│    - Serves React SPA                       │
│    - Proxies /api to backend                │
│    Port: 80                                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    Backend Container (Flask)                │
│    - REST API                               │
│    - Business Logic                         │
│    Port: 5000                               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    Database Container (PostgreSQL)          │
│    - Persistent Data Storage                │
│    Port: 5432                               │
└─────────────────────────────────────────────┘
```

## ⚡ Performance Tips

1. **Allocate enough resources to Docker**:
   - Recommended: 4GB RAM, 2 CPUs minimum
   - Configure in Docker Desktop: Settings → Resources

2. **Regular maintenance**:
   ```bash
   # Weekly cleanup
   docker system prune -f
   ```

3. **Monitor resource usage**:
   ```bash
   docker stats
   ```

---

**Last Updated**: January 2026
**Docker Version**: 20.10+
**Docker Compose Version**: 2.0+
