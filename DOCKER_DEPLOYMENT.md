# Docker Deployment Guide

## Running on Another Computer

### Prerequisites
- Docker installed (https://www.docker.com/)
- Docker Compose installed (usually comes with Docker Desktop)
- Port 5000, 5173, and 5432 available

### Quick Start

1. **Clone/Copy the project to the other computer**

2. **Navigate to the project directory:**
```bash
cd "Data-Analysis-Web-Application"
```

3. **Start all services with Docker Compose:**
```bash
docker-compose up -d
```

This will:
- Create and start PostgreSQL container
- Build and start Flask backend
- Build and start Vite frontend dev server
- Create a shared network for containers to communicate

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: localhost:5432

### Connecting from Another Machine on the Network

If you want to access the app from another computer on the same network:

1. **Find your machine's IP address:**

   **Windows:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (usually 192.168.x.x or 10.x.x.x)

   **Mac/Linux:**
   ```bash
   ifconfig
   ```

2. **Update the frontend configuration:**

   Edit `frontend/vite.config.ts`:
   ```typescript
   server: {
     proxy: {
       '/api': 'http://<YOUR_MACHINE_IP>:5000',
       '/upload': 'http://<YOUR_MACHINE_IP>:5000'
     }
   }
   ```

   Replace `<YOUR_MACHINE_IP>` with your actual IP (e.g., http://192.168.1.50:5000)

3. **Access from another computer:**
   ```
   http://<YOUR_MACHINE_IP>:5173
   ```

### Useful Docker Commands

```bash
# View running containers
docker ps

# View logs
docker-compose logs -f web        # Flask logs
docker-compose logs -f frontend   # Vite logs
docker-compose logs -f db         # Database logs

# Stop all services
docker-compose down

# Stop and remove volumes (warning: deletes database!)
docker-compose down -v

# Rebuild containers after code changes
docker-compose up --build

# Execute command in container
docker exec -it veri-analizi-web python app.py
docker exec -it veri-analizi-db psql -U postgres -d veri_analizi
```

### Port Mapping

| Service | Container Port | Host Port | Access |
|---------|---|---|---|
| Frontend (Vite) | 5173 | 5173 | http://localhost:5173 |
| Backend (Flask) | 5000 | 5000 | http://localhost:5000 |
| Database (PostgreSQL) | 5432 | 5432 | localhost:5432 |

### Environment Variables

The docker-compose.yml uses environment variables for configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `POSTGRES_PASSWORD`: Database password
- `VITE_API_URL`: Frontend API endpoint

### Troubleshooting

**Port already in use:**
```bash
# Change port in docker-compose.yml
# Example: change 5173:5173 to 5174:5173
```

**Database connection error:**
- Wait 10-15 seconds for PostgreSQL to fully start
- Check database logs: `docker-compose logs db`

**Frontend can't connect to backend:**
- Check the proxy configuration in `frontend/vite.config.ts`
- Ensure backend container is running: `docker ps`
- Check backend logs: `docker-compose logs web`

**Permission issues on Linux/Mac:**
```bash
# Give permission to uploads folder
sudo chmod -R 777 uploads
```

### Production Deployment

For production, update docker-compose.yml:
1. Set `FLASK_ENV=production`
2. Use a proper database password (not default)
3. Use a proper SECRET_KEY
4. Consider using nginx as reverse proxy
5. Use PostgreSQL hosted service instead of container

