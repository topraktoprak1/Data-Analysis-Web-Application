# Docker Setup Guide

## Overview
This application has two parts:
- **Backend**: Flask API (Python) - Port 5000
- **Frontend**: React SPA (Node.js) - Port 3000
- **Database**: PostgreSQL - Port 5432

## Running with Docker

### Prerequisites
- Docker Desktop installed and running
- Docker Compose installed

### Start All Services

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL database (port 5432)
2. Start Flask backend (port 5000)
3. Start React frontend (port 3000)

### Access the Application

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (Clean Reset)

```bash
docker-compose down -v
```

## Running Locally (Without Docker)

### Backend Setup

1. **Create Python virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables** (optional):
   ```bash
   set DATABASE_URL=postgresql://postgres:1234@localhost:8080/veri_analizi
   set FLASK_ENV=development
   ```

4. **Run Flask app**:
   ```bash
   python app.py
   ```

   Backend will be available at: http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:3000

## Environment Configuration

### Frontend Environment Variables

The frontend uses different configurations for local development vs Docker:

- **Local Development**: `.env.development` (uses localhost:5000)
- **Docker**: `.env.docker` (uses web:5000 service name)

### Backend Environment Variables

Backend uses these environment variables (set in docker-compose.yml or locally):

- `DATABASE_URL`: PostgreSQL connection string
- `FLASK_ENV`: production or development
- `SECRET_KEY`: Flask secret key for sessions

## Network Architecture

### Local Development
```
Browser → localhost:3000 (React) → localhost:5000 (Flask) → localhost:8080 (PostgreSQL)
```

### Docker
```
Browser → localhost:3000 (frontend container) → web:5000 (web container) → db:5432 (db container)
```

Key difference: 
- In Docker, containers communicate using **service names** (web, db, frontend)
- Locally, everything uses **localhost**

## Troubleshooting

### Frontend can't connect to backend in Docker

Check:
1. `DOCKER_ENV=true` is set in docker-compose.yml frontend service
2. Vite proxy is configured to use `web:5000` when DOCKER_ENV is true
3. Backend CORS allows the frontend origin

### Database connection fails

Check:
1. PostgreSQL container is healthy: `docker-compose ps`
2. DATABASE_URL is correct in docker-compose.yml
3. Database initialization completed successfully

### Port already in use

```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Development Workflow

### Making Changes to Frontend

1. Edit files in `frontend/src/`
2. Changes auto-reload (Vite HMR)
3. No restart needed

### Making Changes to Backend

1. Edit files in root directory
2. Flask auto-reloads in development mode
3. Or restart: `docker-compose restart web`

### Database Changes

1. Stop containers: `docker-compose down`
2. Remove volumes: `docker-compose down -v`
3. Rebuild: `docker-compose up --build`

## Production Deployment

For production, you should:

1. Build React for production:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve React build from Flask (static files)

3. Use proper SECRET_KEY and secure session settings

4. Enable HTTPS (SESSION_COOKIE_SECURE=True)

5. Use production database with proper credentials

6. Configure proper CORS origins (not localhost)
