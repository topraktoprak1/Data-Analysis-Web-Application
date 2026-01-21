# 🎯 START HERE - Docker Deployment

## 👋 Welcome!

Your application is now **fully configured for Docker**! This means you can run it on **any computer** with Docker installed - no complex setup required.

---

## 🚀 Quick Start (3 Steps)

### Step 1️⃣: Install Docker

**Windows or Mac:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. You'll see the Docker icon in your system tray/menu bar

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
```

### Step 2️⃣: Configure (First Time Only)

**Windows (PowerShell or Command Prompt):**
```cmd
copy .env.template .env
notepad .env
```

**Linux/Mac:**
```bash
cp .env.template .env
nano .env
```

**⚠️ Important:** Change these in `.env`:
- `POSTGRES_PASSWORD` - Choose a strong password
- `SECRET_KEY` - Generate with:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

### Step 3️⃣: Start!

**Easy Way (Windows):**
- Double-click: `start-docker.bat`

**Command Line (All platforms):**
```bash
docker-compose up -d
```

**That's it! 🎉**

Open your browser to: **http://localhost**

---

## 📱 Default Login

- **Username:** `admin`
- **Password:** `admin123`

⚠️ Change the password after first login!

---

## 📚 What to Read Next

1. **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** ← Start here for more details
2. **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** ← Complete documentation
3. **[DOCKER_DEPLOYMENT_CHECKLIST.md](DOCKER_DEPLOYMENT_CHECKLIST.md)** ← Pre-flight checklist
4. **[DOCKER_ARCHITECTURE.md](DOCKER_ARCHITECTURE.md)** ← Technical details

---

## 🌐 Use on Another Computer

### Simple Method:
1. **Copy** the entire project folder (USB, cloud, network share)
2. **Install** Docker on the new computer
3. **Run** `docker-compose up -d` in the project folder
4. **Done!** Your app with all data is now running

### With Existing Data:
1. **Backup** database: Run `backup-database.ps1`
2. **Copy** project folder + backup file to new computer
3. **Start** Docker: `docker-compose up -d`
4. **Restore** (optional): See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for restore commands

---

## 🔧 Common Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs (watch what's happening)
docker-compose logs -f

# Check if everything is running
docker-compose ps

# Restart a service
docker-compose restart web

# Backup database
.\backup-database.ps1

# Update after code changes
docker-compose up -d --build
```

---

## 🌍 Access from Other Computers on Your Network

1. **Find your IP:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. **Other computers access via:**
   - `http://YOUR_IP_ADDRESS`
   - Example: `http://192.168.1.100`

3. **Allow through firewall:**
   - Windows: Allow ports 80 and 5000
   - Linux: `sudo ufw allow 80 && sudo ufw allow 5000`

---

## ⚡ What's Running?

When you start Docker, it creates:

| Service | What It Does | Port |
|---------|-------------|------|
| 🗄️ PostgreSQL | Database - stores all your data | 5432 |
| 🐍 Flask | Backend API - handles business logic | 5000 |
| 🌐 Nginx | Frontend - serves the React web interface | 80 |

Everything runs in **isolated containers** with **persistent data storage**.

---

## 🔍 Troubleshooting

### "Port already in use"
**Solution:** Edit `.env` and change the ports:
```env
FRONTEND_PORT=8080
BACKEND_PORT=5001
DB_PORT=5433
```

### "Docker is not running"
**Solution:** 
- **Windows/Mac:** Start Docker Desktop (check system tray)
- **Linux:** `sudo systemctl start docker`

### "Container is unhealthy"
**Solution:** Check logs for errors:
```bash
docker-compose logs SERVICE_NAME
# Examples:
docker-compose logs web
docker-compose logs db
docker-compose logs frontend
```

### Can't access the app
**Solution:** 
1. Check containers are running: `docker-compose ps`
2. Check backend health: http://localhost:5000/api/health
3. Check logs: `docker-compose logs -f`

---

## 💾 Backup Your Data

**Create Backup:**
```bash
# Windows
.\backup-database.ps1

# Linux/Mac
docker-compose exec -T db pg_dump -U postgres veri_analizi > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore Backup:**
```bash
# Windows (PowerShell)
Get-Content backups\backup_FILENAME.sql | docker-compose exec -T db psql -U postgres veri_analizi

# Linux/Mac
cat backups/backup_FILENAME.sql | docker-compose exec -T db psql -U postgres veri_analizi
```

---

## ✅ Checklist for New Computer

- [ ] Docker installed and running
- [ ] Project folder copied
- [ ] `.env` file created from template
- [ ] Passwords changed in `.env`
- [ ] Run `docker-compose up -d`
- [ ] Open http://localhost
- [ ] Login successful
- [ ] Change admin password

---

## 🎓 What You Get

✅ **Portable** - Works on Windows, Mac, Linux
✅ **Isolated** - Doesn't affect your system
✅ **Complete** - Database + Backend + Frontend
✅ **Secure** - Isolated networks, non-root containers
✅ **Reliable** - Auto-restart, health checks
✅ **Easy** - One command to start
✅ **Data Safe** - Persistent storage
✅ **Production Ready** - Optimized for performance

---

## 🆘 Need Help?

1. **Quick Start:** [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)
2. **Full Guide:** [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
3. **Check Logs:** `docker-compose logs -f`
4. **Check Status:** `docker-compose ps`
5. **Restart Everything:** `docker-compose restart`

---

## 🎉 Ready to Go!

**Run this now:**

```bash
# Windows: Double-click start-docker.bat
# Or run in terminal:
docker-compose up -d
```

Then open: **http://localhost**

**Enjoy your containerized application! 🐳**

---

## 📋 Files Created for You

- `Dockerfile.backend` - Backend container configuration
- `Dockerfile.frontend` - Frontend container configuration  
- `docker-compose.yml` - Service orchestration
- `.env.template` - Configuration template
- `.dockerignore` - Build optimization
- `start-docker.bat` - Windows startup script
- `start-docker.ps1` - PowerShell startup script
- `backup-database.ps1` - Backup utility
- `DOCKER_QUICK_START.md` - Quick reference
- `DOCKER_GUIDE.md` - Complete guide
- `DOCKER_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `DOCKER_ARCHITECTURE.md` - Technical diagrams
- `DOCKER_README.md` - Overview

**Everything you need is ready to go!**

---

**Last Updated:** January 2026  
**Status:** ✅ Production Ready  
**Tested On:** Docker 20.10+, Docker Compose 2.0+
