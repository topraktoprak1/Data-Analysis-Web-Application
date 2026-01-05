# Session Management

## Overview

The application now has enhanced session management with automatic timeout and redirect features.

## Key Features

### 1. **Session Timeout: 10 Minutes**
- Sessions expire after **10 minutes** of inactivity
- This improves security by ensuring users don't stay logged in indefinitely
- The timer resets with any API activity (page loads, data fetches, etc.)

### 2. **Automatic Session Extension**
- Any authenticated API call automatically extends the session by 10 minutes
- As long as you're actively using the application, you won't be logged out
- Inactive tabs will expire after 10 minutes

### 3. **Auto-Redirect on Expiration**
- When your session expires, you'll automatically be redirected to the login page
- You'll see a brief message: "Session expired. Please login again."
- No more confusing "Unauthorized" errors on the dashboard

### 4. **All API Calls Now Authenticated**
- All data fetches include session cookies automatically
- Downloads (Excel exports, etc.) properly handle authentication
- Charts and graphs maintain session state

## User Experience

### Before (Old Behavior):
❌ Session lasted 8 hours (security risk)
❌ "Unauthorized" errors appeared on dashboard
❌ Users had to manually navigate to login
❌ Download buttons would fail silently

### After (New Behavior):
✅ Session lasts 10 minutes of inactivity
✅ Automatic redirect to login page on expiration
✅ Clear error messages
✅ All features properly handle authentication

## Technical Implementation

### Backend (`app.py`)
```python
# Session timeout: 10 minutes
app.config['PERMANENT_SESSION_LIFETIME'] = 600

# Session auto-extension on any authenticated request
@login_required decorator updates session.modified = True
```

### Frontend (`utils/api.ts`)
```typescript
// Centralized authenticated fetch
authenticatedFetch() - handles 401 and redirects
apiFetch() - for JSON APIs
downloadFile() - for file downloads
```

## How It Works

1. **User logs in** → Session created (10 min lifetime)
2. **User browses dashboard** → API calls extend session
3. **User inactive for 10 min** → Session expires
4. **Next API call** → Returns 401 Unauthorized
5. **Frontend detects 401** → Auto-redirect to `/login`
6. **User sees login page** → Can log back in

## For Developers

### Using Authenticated Fetch

Instead of:
```typescript
const response = await fetch('http://localhost:5000/api/data');
```

Use:
```typescript
import { apiFetch } from '@/utils/api';
const data = await apiFetch('/api/data');
```

### Benefits:
- ✅ Automatic credentials inclusion
- ✅ Automatic 401 handling
- ✅ Consistent error handling
- ✅ Session expiration redirect

### For Downloads:
```typescript
import { downloadFile } from '@/utils/api';
await downloadFile('/api/download-calculated-data', 'myfile.xlsx');
```

## Security Benefits

1. **Reduced Attack Window**: 10-minute sessions vs 8-hour sessions
2. **Auto-Logout**: Inactive users automatically logged out
3. **No Stale Sessions**: Old sessions can't be reused
4. **Secure Cookies**: HttpOnly, SameSite=Lax cookies

## Customization

### Change Timeout Duration

Edit `app.py`:
```python
# For 30 minutes:
app.config['PERMANENT_SESSION_LIFETIME'] = 1800

# For 1 hour:
app.config['PERMANENT_SESSION_LIFETIME'] = 3600
```

### Disable Auto-Redirect (Not Recommended)

Edit `frontend/src/utils/api.ts`:
```typescript
// Comment out the redirect line
// window.location.href = '/login';
```

## Troubleshooting

### "I keep getting logged out!"
- This is normal after 10 minutes of inactivity
- Stay active in the app to keep session alive
- Each page load/click extends the session

### "Downloads show 'Unauthorized'"
- Your session has expired
- Click OK and log back in
- Try the download again

### "Session seems too short"
- Current setting: 10 minutes (security best practice)
- Admin can adjust in `app.py` if needed
- Consider if you need longer sessions for your use case

## Best Practices

1. ✅ **Don't leave app open in background** for extended periods
2. ✅ **Save work frequently** (though data persists in database)
3. ✅ **Log out when done** for security
4. ✅ **Use a password manager** for quick re-login

## Future Enhancements

Potential improvements:
- [ ] "Remember Me" option for longer sessions
- [ ] Session expiration warning (30 seconds before timeout)
- [ ] "Keep me logged in" refresh button
- [ ] Activity tracking dashboard for admins
