# ✅ Docker Deployment Checklist

Use this checklist to ensure successful Docker deployment on any computer.

## 📋 Pre-Deployment Checklist

### System Requirements
- [ ] Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- [ ] Docker version 20.10+ (`docker --version`)
- [ ] Docker Compose version 2.0+ (`docker-compose --version`)
- [ ] At least 4GB RAM allocated to Docker
- [ ] At least 10GB free disk space

### Project Files
- [ ] All project files copied to target computer
- [ ] `.env.template` file exists
- [ ] `docker-compose.yml` file exists
- [ ] `Dockerfile.backend` file exists
- [ ] `Dockerfile.frontend` file exists

## 🔧 First-Time Setup Checklist

### Configuration
- [ ] Copy `.env.template` to `.env`
- [ ] Open `.env` file in text editor
- [ ] Change `POSTGRES_PASSWORD` to a strong password
- [ ] Generate and set `SECRET_KEY`:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Review and adjust port numbers if needed:
  - `FRONTEND_PORT=80`
  - `BACKEND_PORT=5000`
  - `DB_PORT=5432`

### Firewall (if accessing from network)
- [ ] Allow port 80 through firewall (frontend)
- [ ] Allow port 5000 through firewall (backend)
- [ ] (Optional) Allow port 5432 for direct database access

## 🚀 Deployment Checklist

### Starting the Application
- [ ] Docker Desktop is running (check system tray/menu bar)
- [ ] Navigate to project folder in terminal
- [ ] Run: `docker-compose up -d`
- [ ] Wait for all services to start (2-5 minutes first time)
- [ ] Check status: `docker-compose ps`
- [ ] Verify all containers are "healthy" or "running"

### Verification
- [ ] Open browser to http://localhost
- [ ] Frontend loads without errors
- [ ] Can see login page
- [ ] Login with admin/admin123 works
- [ ] Can see dashboard
- [ ] No console errors in browser (F12)

### Backend Verification
- [ ] Check backend health: http://localhost:5000/api/health
- [ ] Should return: `{"status":"healthy","database":"connected"}`
- [ ] View backend logs: `docker-compose logs web`
- [ ] No error messages in logs

### Database Verification
- [ ] Database container is healthy: `docker-compose ps db`
- [ ] Can connect to database (optional):
  ```bash
  docker-compose exec db psql -U postgres veri_analizi
  ```
- [ ] View database logs: `docker-compose logs db`

## 🔒 Security Checklist (Before Production)

- [ ] Changed `POSTGRES_PASSWORD` in `.env`
- [ ] Generated strong `SECRET_KEY` in `.env`
- [ ] Changed admin password after first login
- [ ] `.env` file is NOT committed to git (check `.gitignore`)
- [ ] Reviewed CORS settings in `app.py`
- [ ] Database port (5432) not exposed if not needed
- [ ] Consider adding SSL/HTTPS (production only)
- [ ] Set up regular backup schedule

## 💾 Backup Checklist

### Initial Backup Setup
- [ ] `backups/` folder exists
- [ ] Backup script is executable: `backup-database.ps1`
- [ ] Test backup: `.\backup-database.ps1`
- [ ] Verify backup file created in `backups/` folder
- [ ] Test restore on a copy/dev environment

### Regular Backups
- [ ] Schedule daily backups (Windows Task Scheduler)
- [ ] Keep at least 7 days of backups
- [ ] Test restore monthly
- [ ] Store important backups off-site

## 🌐 Network Access Checklist (Optional)

### Accessing from Other Computers
- [ ] Find host computer IP address: `ipconfig` or `ifconfig`
- [ ] Test access from another computer: `http://HOST_IP`
- [ ] Configure firewall to allow connections
- [ ] Test API access: `http://HOST_IP:5000/api/health`
- [ ] Verify uploads work from remote computer

### Router Configuration (Optional)
- [ ] Set static IP for host computer
- [ ] Configure port forwarding (if accessing from internet)
- [ ] Set up DDNS (if accessing from internet)
- [ ] ⚠️ **WARNING**: Only expose to internet with proper security!

## 🔄 Moving to Another Computer Checklist

### Export from Old Computer
- [ ] Create database backup: `.\backup-database.ps1`
- [ ] Copy entire project folder to USB/cloud
- [ ] Include the backup file
- [ ] Note the `.env` configuration (passwords, keys)

### Import to New Computer
- [ ] Install Docker on new computer
- [ ] Copy project folder to new location
- [ ] Copy/create `.env` file with same configuration
- [ ] Start services: `docker-compose up -d`
- [ ] (Optional) Restore backup:
  ```bash
  Get-Content backups/backup_TIMESTAMP.sql | docker-compose exec -T db psql -U postgres veri_analizi
  ```
- [ ] Test application access
- [ ] Verify data is present

## 📊 Monitoring Checklist

### Daily Checks
- [ ] All containers running: `docker-compose ps`
- [ ] No errors in logs: `docker-compose logs --tail=50`
- [ ] Application accessible
- [ ] Disk space available: `docker system df`

### Weekly Maintenance
- [ ] Review logs for errors
- [ ] Create backup
- [ ] Clean up old backups (keep last 30 days)
- [ ] Check Docker disk usage
- [ ] Run: `docker system prune -f` (cleanup)

### Monthly Maintenance
- [ ] Test backup restore procedure
- [ ] Review and update `.env` if needed
- [ ] Check for Docker updates
- [ ] Review security settings
- [ ] Update application if new version available

## 🆘 Troubleshooting Checklist

### Container Won't Start
- [ ] Check Docker is running
- [ ] Check logs: `docker-compose logs SERVICE_NAME`
- [ ] Check port conflicts (change in `.env`)
- [ ] Check disk space: `docker system df`
- [ ] Try rebuilding: `docker-compose up -d --build`

### Can't Access Application
- [ ] Check all containers are running: `docker-compose ps`
- [ ] Check backend health: http://localhost:5000/api/health
- [ ] Check firewall settings
- [ ] Try different browser
- [ ] Check browser console for errors (F12)

### Database Issues
- [ ] Check database is healthy: `docker-compose ps db`
- [ ] View database logs: `docker-compose logs db`
- [ ] Verify credentials in `.env`
- [ ] Try restarting database: `docker-compose restart db`

### Performance Issues
- [ ] Check Docker resource allocation (Settings → Resources)
- [ ] Check system resources: `docker stats`
- [ ] Clean up: `docker system prune -a`
- [ ] Check disk space
- [ ] Review container logs for errors

## ✅ Deployment Complete Checklist

- [ ] Application is accessible
- [ ] All containers are healthy
- [ ] Login works with admin credentials
- [ ] Admin password has been changed
- [ ] Initial backup has been created
- [ ] Backup procedure has been tested
- [ ] Documentation has been reviewed
- [ ] Team members have access instructions
- [ ] Support contact information is available

## 📝 Notes

Use this section to record any custom configurations or issues:

```
Computer Name: ____________________
IP Address: ____________________
Date Deployed: ____________________
Deployed By: ____________________

Custom Port Numbers:
- Frontend: ____________________
- Backend: ____________________
- Database: ____________________

Issues Encountered:
____________________
____________________
____________________

Solutions Applied:
____________________
____________________
____________________
```

---

## Quick Reference Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Backup
.\backup-database.ps1

# Rebuild
docker-compose up -d --build

# Clean up
docker system prune -f
```

---

**Last Updated**: January 2026
**Version**: 1.0
