# 🌐 Network Access Fix - Complete Guide

## Problem
The application works on the local computer but doesn't fetch data when accessed from another computer on the network.

## Root Cause
The frontend was using hard-coded `localhost` URLs for API calls, which only work on the local machine.

## ✅ What Was Fixed

### 1. Frontend API Calls (11 files updated)
Changed all hard-coded `http://localhost:5000/api/*` URLs to relative paths `/api/*`:

- ✅ StatisticsChart.tsx
- ✅ UserProfiles.tsx  
- ✅ BasicTableOne.tsx
- ✅ MonthlySalesChart.tsx
- ✅ PivotTableOnMainPage.tsx
- ✅ PieChart.tsx (ecommerce)
- ✅ EcommerceMetrics.tsx
- ✅ PivotTable.tsx (form elements)
- ✅ PieChart.tsx (charts)
- ✅ LineChartOne.tsx
- ✅ BarChartOne.tsx

### 2. Vite Development Server Configuration
Updated `frontend/vite.config.ts` to:
- Listen on all network interfaces (`host: '0.0.0.0'`)
- Proxy `/api` and `/upload` requests to Flask backend (port 5000)

## 🚀 How to Start the Application

### Option 1: Development Mode (Recommended for Testing)

1. **Start the Flask Backend** (Terminal 1):
   ```powershell
   cd "c:\Users\teknik.ofis\Desktop\Veri analizi uygulaması 2\Data-Analysis-Web-Application"
   python app.py
   ```
   - Backend will run on: `http://0.0.0.0:5000`

2. **Start the Vite Frontend** (Terminal 2):
   ```powershell
   cd "c:\Users\teknik.ofis\Desktop\Veri analizi uygulaması 2\Data-Analysis-Web-Application\frontend"
   npm run dev
   ```
   - Frontend will run on: `http://0.0.0.0:8080`

3. **Access from ANY Computer on Your Network**:
   - Local: `http://localhost:8080`
   - Network: `http://10.135.8.253:8080` (use your actual IP)

### Option 2: Production Build (Better Performance)

1. **Build the Frontend**:
   ```powershell
   cd "c:\Users\teknik.ofis\Desktop\Veri analizi uygulaması 2\Data-Analysis-Web-Application\frontend"
   npm run build
   ```

2. **Serve Everything Through Flask**:
   Update `app.py` to serve the built frontend:
   ```python
   from flask import send_from_directory
   
   @app.route('/')
   def serve_frontend():
       return send_from_directory('frontend/dist', 'index.html')
   
   @app.route('/<path:path>')
   def serve_static(path):
       return send_from_directory('frontend/dist', path)
   ```

3. **Start Only Flask**:
   ```powershell
   python app.py
   ```
   - Access at: `http://10.135.8.253:5000`

## 🔍 Troubleshooting

### If data still doesn't load from other computers:

1. **Check Firewall**:
   ```powershell
   # Allow Python through Windows Firewall
   netsh advfirewall firewall add rule name="Flask App" dir=in action=allow program="C:\Path\To\python.exe" enable=yes
   ```

2. **Check Flask is Listening on All Interfaces**:
   In `app.py`, verify:
   ```python
   app.run(debug=True, host='0.0.0.0', port=5000)
   ```

3. **Check Vite Dev Server Network Access**:
   In `vite.config.ts`, verify:
   ```typescript
   server: {
     host: '0.0.0.0',
     port: 8080
   }
   ```

4. **Test API Directly**:
   From another computer, try:
   ```
   http://10.135.8.253:5000/api/health
   ```
   Should return: `{"status": "ok"}`

5. **Check Network Connection**:
   ```powershell
   # From another computer
   ping 10.135.8.253
   telnet 10.135.8.253 5000
   telnet 10.135.8.253 8080
   ```

## 📝 Technical Details

### Before Fix:
```typescript
// ❌ BAD - Only works locally
fetch("http://localhost:5000/api/data")
```

### After Fix:
```typescript
// ✅ GOOD - Works from any computer
fetch("/api/data")
```

When accessed from `http://10.135.8.253:8080`, the browser will automatically request:
- `http://10.135.8.253:8080/api/data`
- Vite proxy forwards to → `http://127.0.0.1:5000/api/data`
- Flask handles the request ✅

## ✅ Verification Checklist

- [ ] Flask backend starts successfully on port 5000
- [ ] Vite dev server starts on port 8080
- [ ] Can access UI from local computer: `http://localhost:8080`
- [ ] Can access UI from another computer: `http://10.135.8.253:8080`
- [ ] Company Table loads data on another computer
- [ ] Statistics charts load on another computer
- [ ] No console errors about CORS or network failures

## 🎯 Quick Test

1. Open browser on **another computer**
2. Go to: `http://10.135.8.253:8080` (replace with your IP)
3. Open Developer Tools (F12)
4. Go to Network tab
5. Reload page
6. You should see:
   - ✅ `/api/data` → Status 200
   - ✅ `/api/stats` → Status 200
   - ❌ NOT seeing errors like "Failed to fetch" or "CORS"

## 📞 Need Help?

If it still doesn't work:
1. Check the browser console for errors (F12)
2. Check Flask terminal for error messages
3. Verify your local IP hasn't changed: `ipconfig`
4. Test API endpoint directly: `http://10.135.8.253:5000/api/health`
