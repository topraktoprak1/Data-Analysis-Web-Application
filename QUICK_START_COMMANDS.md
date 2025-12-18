# Quick Start Commands

## 🐳 Docker (Recommended)

### Start Everything
```bash
docker-compose up --build
```

### Stop Everything
```bash
docker-compose down
```

### Clean Reset (Delete Database)
```bash
docker-compose down -v
docker-compose up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f frontend
docker-compose logs -f db
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

---

## 💻 Local Development (Without Docker)

### Terminal 1: Backend
```bash
# Activate virtual environment
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run Flask
python app.py
```

Backend: http://localhost:5000

### Terminal 2: Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Run dev server
npm run dev
```

Frontend: http://localhost:3000

---

## 🔑 Default Login

After first run, create an admin user or use the registration page.

---

## 📁 Project Structure

```
deneme/
├── app.py                  # Flask backend (DO NOT MODIFY - per user request)
├── docker-compose.yml      # Docker orchestration
├── GETTING_START.dockerfile # Backend Dockerfile
├── requirements.txt        # Python dependencies
├── uploads/                # Uploaded Excel files
├── instance/               # Database instance
└── frontend/
    ├── Dockerfile.dev      # Frontend Dockerfile
    ├── package.json        # Node dependencies
    ├── vite.config.js      # Vite configuration
    ├── .env.development    # Local env vars
    ├── .env.docker         # Docker env vars
    └── src/
        ├── App.jsx         # Main React app
        ├── store/          # Redux store
        ├── pages/          # Page components
        ├── components/     # Reusable components
        └── services/       # API services
```

---

## 🛠️ Useful Commands

### Check if ports are available
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5432
```

### Kill process on port
```bash
taskkill /PID <PID> /F
```

### Docker cleanup
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune
```

### Install new Python package
```bash
pip install <package-name>
pip freeze > requirements.txt
```

### Install new NPM package
```bash
cd frontend
npm install <package-name>
```

---

## 📚 Documentation

- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Detailed Docker setup guide
- [CONNECTION_SUMMARY.md](CONNECTION_SUMMARY.md) - Frontend-Backend connection details
- [README.md](README.md) - Full project documentation

---

## ⚠️ Important Notes

1. **Backend is unchanged** - All backend code in `app.py` remains as originally created
2. **CORS enabled** - Flask-CORS added to allow React frontend
3. **Docker networking** - Frontend uses service name `web:5000` in Docker, `localhost:5000` locally
4. **Session management** - Uses Flask sessions with secure cookies
5. **File uploads** - Max 16MB, stored in `uploads/` directory
