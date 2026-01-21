# 🚀 Quick Start with Docker

Get the application running in 3 simple steps!

## Step 1: Install Docker

Download and install Docker Desktop:
- **Windows/Mac**: https://www.docker.com/products/docker-desktop
- **Linux**: Install Docker Engine from your package manager

## Step 2: Configure (First Time Only)

1. Copy `.env.template` to `.env`:
   ```bash
   # Windows PowerShell or CMD
   copy .env.template .env
   
   # Linux/Mac
   cp .env.template .env
   ```

2. **Important**: Edit `.env` and change:
   - `POSTGRES_PASSWORD` - Set a strong database password
   - `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_hex(32))"`

## Step 3: Start the Application

### Windows Users (Easy Way):
Just double-click `start-docker.bat` or `start-docker.ps1`

### All Platforms (Command Line):
```bash
docker-compose up -d
```

**That's it!** 🎉

## Access the Application

- **Web Interface**: http://localhost
- **API**: http://localhost:5000
- **Default Login**: admin / admin123

## 📋 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

## 🌐 Use on Other Computers

### Method 1: Copy the Entire Folder
1. Copy the entire project folder to a USB drive or network location
2. On the new computer, install Docker
3. Run `docker-compose up -d`

### Method 2: With Your Data
1. Backup database: `docker-compose exec db pg_dump -U postgres veri_analizi > backup.sql`
2. Copy project folder + backup.sql to new computer
3. Start Docker: `docker-compose up -d`
4. Restore data: `cat backup.sql | docker-compose exec -T db psql -U postgres veri_analizi`

## 🔧 Troubleshooting

### Ports Already in Use?
Edit `.env` and change:
```env
FRONTEND_PORT=8080
BACKEND_PORT=5001
DB_PORT=5433
```

### Docker Not Running?
- Windows/Mac: Open Docker Desktop
- Linux: `sudo systemctl start docker`

### Need More Help?
See [DOCKER_GUIDE.md](DOCKER_GUIDE.md) for detailed documentation.

## 🎯 What You Get

- ✅ PostgreSQL Database (auto-configured)
- ✅ Flask Backend API (auto-started)
- ✅ React Frontend (production build)
- ✅ Persistent data storage
- ✅ Automatic health checks
- ✅ Network isolation for security

---

**Need detailed instructions?** → [Read Full Docker Guide](DOCKER_GUIDE.md)
