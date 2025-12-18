# Frontend-Backend Connection Summary

## ✅ Configuration Status

### Docker Compose Setup
- **Database** (PostgreSQL 15): Port 5432
- **Backend** (Flask): Port 5000
- **Frontend** (React + Vite): Port 3000

### Environment Configuration

#### Frontend (.env files)
```
.env.development    → VITE_API_URL=http://localhost:5000 (local dev)
.env.docker         → VITE_API_URL=http://localhost:5000 + DOCKER_ENV=true
```

#### Vite Proxy (vite.config.js)
```javascript
proxy: {
  '/api': {
    target: process.env.DOCKER_ENV ? 'http://web:5000' : 'http://localhost:5000',
    changeOrigin: true,
  },
  '/static': {
    target: process.env.DOCKER_ENV ? 'http://web:5000' : 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

**Key Point**: When `DOCKER_ENV=true`, Vite proxies to `web:5000` (Docker service name) instead of `localhost:5000`.

#### Backend CORS (app.py)
```python
from flask_cors import CORS
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
```

## 🔄 Request Flow

### Local Development (npm run dev + python app.py)
```
Browser
  ↓ http://localhost:3000
React App (Vite Dev Server)
  ↓ /api/* → proxy to localhost:5000
Flask Backend
  ↓ postgresql://localhost:8080
PostgreSQL Database
```

### Docker (docker-compose up)
```
Browser
  ↓ http://localhost:3000 (mapped from container 3000)
Frontend Container (veri-analizi-frontend)
  ↓ /api/* → proxy to web:5000 (Docker internal network)
Backend Container (veri-analizi-web)
  ↓ postgresql://db:5432 (Docker internal network)
Database Container (veri-analizi-db)
```

## 📋 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get current user profile (used for session check)

### Data Management
- `GET /api/get_data` - Fetch all database records
- `POST /api/process_empty_cells` - Upload & process Excel file
- `DELETE /api/delete_record/<id>` - Delete a record
- `PUT /api/update_record/<id>` - Update a record

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `POST /api/admin/users` - Create user (admin only)
- `PUT /api/admin/users/<id>` - Update user (admin only)
- `DELETE /api/admin/users/<id>` - Delete user (admin only)

### Filters & Charts
- `POST /api/save_filter` - Save filter configuration
- `GET /api/get_filters` - Load filter configuration
- `POST /api/save_chart` - Save chart configuration
- `GET /api/get_charts` - Load chart configuration

## 🔧 Technical Details

### Session Management
- **Backend**: Flask sessions with secure cookies
- **Frontend**: Redux authSlice manages auth state
- **Session Check**: Calls `GET /api/profile` (not `@login_required` to avoid redirect loops)
- **Credentials**: `axios` configured with `withCredentials: true`

### File Upload
- **Max Size**: 16MB
- **Allowed Formats**: .xlsb, .xlsx
- **Processing**: 23 Excel formulas (XLOOKUP, IF, AND, OR, etc.)
- **Storage**: `uploads/` directory with timestamped filenames

### State Management (Redux)
- **authSlice**: login, logout, checkSession (user, isAuthenticated, isAdmin)
- **dataSlice**: records, loading, error (fetchData, deleteRecord, updateRecord)
- **filterSlice**: saved filter configurations
- **chartSlice**: saved chart configurations

## 🚀 How to Run

### With Docker (Recommended)
```bash
docker-compose up --build
```
Then open: http://localhost:3000

### Without Docker
1. **Terminal 1 - Backend**:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Then open: http://localhost:3000

## 🔍 Verification Checklist

### ✅ Backend Ready
- [ ] Flask app running on port 5000
- [ ] PostgreSQL database connected
- [ ] CORS enabled for localhost:3000
- [ ] Flask-CORS installed in requirements.txt

### ✅ Frontend Ready
- [ ] React app running on port 3000
- [ ] Vite proxy configured (localhost vs Docker)
- [ ] Redux store configured
- [ ] Axios interceptor configured
- [ ] All page components created

### ✅ Docker Ready
- [ ] Dockerfile.dev created for frontend
- [ ] docker-compose.yml configured with 3 services
- [ ] DOCKER_ENV environment variable set
- [ ] Volumes configured for persistence
- [ ] Health checks configured

### ✅ Connection Working
- [ ] Login/logout works
- [ ] Session persists on page refresh
- [ ] File upload processes correctly
- [ ] Data fetching works
- [ ] Admin panel accessible

## 🐛 Common Issues

### Issue: "Network Error" when calling API
**Solution**: Check CORS is enabled and frontend origin is allowed

### Issue: Session lost on page refresh
**Solution**: Ensure `withCredentials: true` in axios and `supports_credentials=True` in CORS

### Issue: 404 on /api/* routes
**Solution**: Check Vite proxy configuration and Flask routes have `/api` prefix

### Issue: Frontend can't connect in Docker
**Solution**: Verify `DOCKER_ENV=true` is set and proxy uses `web:5000`

### Issue: Database connection refused
**Solution**: Wait for `db` service health check to pass before starting `web` service
