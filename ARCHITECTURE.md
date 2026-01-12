# Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                    │
│                    http://localhost:3000                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FRONTEND CONTAINER                               │
│                   (veri-analizi-frontend)                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  React 18 + Redux Toolkit + React Router               │        │
│  │  Running on Node:20 with Vite Dev Server               │        │
│  │  Port: 3000                                             │        │
│  └─────────────────────┬──────────────────────────────────┘        │
│                        │                                             │
│                        │ Vite Proxy                                  │
│                        ▼                                             │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  Proxy Config (vite.config.js)                         │        │
│  │  /api/*    → http://web:5000  (Docker)                 │        │
│  │  /static/* → http://web:5000  (Docker)                 │        │
│  │                                                         │        │
│  │  /api/*    → http://localhost:5000  (Local Dev)        │        │
│  │  /static/* → http://localhost:5000  (Local Dev)        │        │
│  └────────────────────────────────────────────────────────┘        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Proxied API Calls
                             │ (DOCKER_ENV determines target)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND CONTAINER                               │
│                     (veri-analizi-web)                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  Flask 3.0 + SQLAlchemy + Flask-CORS                   │        │
│  │  Running on Python 3.12                                │        │
│  │  Port: 5000                                             │        │
│  │                                                         │        │
│  │  API Routes:                                            │        │
│  │  ├─ POST /api/login                                    │        │
│  │  ├─ POST /api/register                                 │        │
│  │  ├─ GET  /api/profile                                  │        │
│  │  ├─ POST /api/process_empty_cells                      │        │
│  │  ├─ GET  /api/get_data                                 │        │
│  │  └─ ... (admin, filters, charts)                       │        │
│  │                                                         │        │
│  │  Excel Processing:                                      │        │
│  │  └─ 23 formulas (XLOOKUP, IF, AND, OR, etc.)          │        │
│  └─────────────────────┬──────────────────────────────────┘        │
└────────────────────────┼────────────────────────────────────────────┘
                         │
                         │ SQLAlchemy ORM
                         │ postgresql://postgres:postgres@db:5432/veri_analizi
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE CONTAINER                               │
│                      (veri-analizi-db)                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  PostgreSQL 15                                          │        │
│  │  Port: 5432                                             │        │
│  │                                                         │        │
│  │  Database: veri_analizi                                │        │
│  │  User: postgres                                         │        │
│  │  Password: postgres                                     │        │
│  │                                                         │        │
│  │  Tables:                                                │        │
│  │  ├─ data_record (Excel data)                           │        │
│  │  ├─ user (authentication)                              │        │
│  │  ├─ saved_filter (filter configs)                      │        │
│  │  └─ saved_chart (chart configs)                        │        │
│  │                                                         │        │
│  │  Volume: postgres_data (persistent storage)            │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## Redux State Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Redux Store                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  authSlice                                              │        │
│  │  ├─ user: { id, email, username, role }               │        │
│  │  ├─ isAuthenticated: boolean                           │        │
│  │  ├─ isAdmin: boolean                                   │        │
│  │  └─ loading: boolean                                   │        │
│  │                                                         │        │
│  │  Actions:                                               │        │
│  │  ├─ login(credentials)                                 │        │
│  │  ├─ logout()                                           │        │
│  │  ├─ register(userData)                                 │        │
│  │  └─ checkSession()                                     │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  dataSlice                                              │        │
│  │  ├─ records: Array<DataRecord>                         │        │
│  │  ├─ loading: boolean                                   │        │
│  │  ├─ error: string | null                               │        │
│  │  └─ lastUpdated: timestamp                             │        │
│  │                                                         │        │
│  │  Actions:                                               │        │
│  │  ├─ fetchData()                                        │        │
│  │  ├─ uploadFile(file)                                   │        │
│  │  ├─ deleteRecord(id)                                   │        │
│  │  └─ updateRecord(id, data)                             │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  filterSlice                                            │        │
│  │  ├─ filters: { field1: value1, field2: value2, ... }  │        │
│  │  ├─ savedFilters: Array<SavedFilter>                  │        │
│  │  └─ activeFilterId: number | null                      │        │
│  │                                                         │        │
│  │  Actions:                                               │        │
│  │  ├─ setFilter(field, value)                            │        │
│  │  ├─ clearFilters()                                     │        │
│  │  ├─ saveFilter(name, filters)                          │        │
│  │  └─ loadFilter(id)                                     │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  chartSlice                                             │        │
│  │  ├─ chartConfig: { type, xAxis, yAxis, ... }          │        │
│  │  ├─ savedCharts: Array<SavedChart>                    │        │
│  │  └─ activeChartId: number | null                       │        │
│  │                                                         │        │
│  │  Actions:                                               │        │
│  │  ├─ setChartConfig(config)                             │        │
│  │  ├─ saveChart(name, config)                            │        │
│  │  └─ loadChart(id)                                      │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow Example: Login

```
1. User enters credentials in Login.jsx
   ↓
2. dispatch(login({ email, password }))
   ↓
3. authSlice.login() calls api.post('/api/login', credentials)
   ↓
4. Axios interceptor adds headers, credentials
   ↓
5. Vite proxy forwards to http://web:5000/api/login
   ↓
6. Flask backend validates credentials
   ↓
7. Backend creates session, returns user data
   ↓
8. authSlice updates state: user, isAuthenticated, isAdmin
   ↓
9. React Router redirects to Dashboard
   ↓
10. PrivateRoute allows access (isAuthenticated = true)
```

## Request Flow Example: File Upload

```
1. User selects Excel file in Dashboard.jsx
   ↓
2. dispatch(uploadFile(file))
   ↓
3. dataSlice.uploadFile() creates FormData
   ↓
4. api.post('/api/process_empty_cells', formData)
   ↓
5. Vite proxy forwards to http://web:5000/api/process_empty_cells
   ↓
6. Flask backend receives file
   ↓
7. Backend processes file with 23 Excel formulas
   ↓
8. Backend saves records to PostgreSQL
   ↓
9. Backend returns processed data
   ↓
10. dataSlice updates records array
    ↓
11. Dashboard re-renders with new data
```

## Network Configuration

### Local Development
```
Frontend (Vite)    → localhost:3000
Backend (Flask)    → localhost:5000
Database (Postgres)→ localhost:8080

Vite Proxy: localhost:5000
```

### Docker
```
Frontend Container → 0.0.0.0:3000 (internal) → localhost:3000 (host)
Backend Container  → 0.0.0.0:5000 (internal) → localhost:5000 (host)
Database Container → 0.0.0.0:5432 (internal) → localhost:5432 (host)

Container Network:
Frontend → web:5000 → Backend
Backend  → db:5432  → Database

Vite Proxy: web:5000 (service name, not localhost!)
```

## Docker Service Dependencies

```
┌─────────────────────┐
│    db (postgres)    │  ← No dependencies, starts first
└──────────┬──────────┘
           │
           │ Health check: pg_isready
           │
           ▼
┌─────────────────────┐
│   web (flask)       │  ← Waits for db health check
└──────────┬──────────┘
           │
           │ No health check
           │
           ▼
┌─────────────────────┐
│  frontend (react)   │  ← Waits for web to start
└─────────────────────┘
```

## File Structure

```
deneme/
├── Backend Files (Python/Flask)
│   ├── app.py                    ← Flask app with 23 Excel formulas
│   ├── requirements.txt          ← Python dependencies (Flask, pandas, etc.)
│   ├── GETTING_START.dockerfile  ← Backend Docker image
│   └── uploads/                  ← Uploaded Excel files
│
├── Frontend Files (React)
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx           ← Main React component
│       │   ├── store/            ← Redux store & slices
│       │   ├── pages/            ← Page components
│       │   ├── components/       ← Reusable components
│       │   └── services/         ← API service (axios)
│       ├── vite.config.js        ← Vite configuration with proxy
│       ├── Dockerfile.dev        ← Frontend Docker image
│       ├── .env.development      ← Local env vars
│       └── .env.docker           ← Docker env vars
│
├── Docker Files
│   └── docker-compose.yml        ← Orchestrates 3 containers
│
└── Documentation
    ├── DOCKER_SETUP.md           ← Docker setup guide
    ├── CONNECTION_SUMMARY.md     ← Connection details
    ├── QUICK_START_COMMANDS.md   ← Quick reference
    └── ARCHITECTURE.md           ← This file
```

## Key Technologies

### Frontend Stack
- **React 18**: UI library
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Vite**: Build tool & dev server
- **Bootstrap 5**: CSS framework
- **Recharts**: Data visualization

### Backend Stack
- **Flask 3.0**: Web framework
- **SQLAlchemy**: ORM
- **Flask-CORS**: CORS support
- **Pandas**: Data processing
- **pyxlsb**: Excel file reading
- **Gunicorn**: Production server

### Database
- **PostgreSQL 15**: Relational database

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Security Features

1. **Session Management**: Flask sessions with secure cookies
2. **CORS**: Configured to allow only localhost:3000
3. **Password Hashing**: Werkzeug security
4. **File Upload Validation**: Size limit (16MB) and type checking
5. **Admin Routes**: Protected with @admin_required decorator
6. **Private Routes**: PrivateRoute component checks authentication

## Excel Processing Features

The backend implements 23 Excel formulas:

1. XLOOKUP equivalent in Python
2. IF statements with complex conditions
3. AND/OR logic
4. Nested conditionals
5. String concatenation
6. Date calculations
7. Numeric calculations
8. Boolean conversions

All formulas handle edge cases like:
- Empty cells
- Missing columns
- Type conversions (string ↔ numeric)
- Division by zero
