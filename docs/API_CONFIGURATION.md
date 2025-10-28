# API Configuration Guide

**Last Updated**: October 23, 2025

## Overview

The FitnessTracker app uses **environment variables** for API configuration, making it easy to switch between different backend environments (development, staging, production).

---

## Configuration Files

### 1. `.env` (Gitignored - Not committed to repository)

Contains the actual API URL used by the application:

```bash
EXPO_PUBLIC_API_URL=https://fitness-tracker-api.fitness-tracker.workers.dev
```

**Important**: This file is automatically ignored by git and should not be committed to version control.

### 2. `.env.example` (Committed to repository)

Template file showing required environment variables:

```bash
# Copy this file to .env and update with your values
EXPO_PUBLIC_API_URL=https://fitness-tracker-api.fitness-tracker.workers.dev
```

**Usage**: New developers should copy this file to `.env` when setting up the project.

### 3. `src/app/config/cloudflare.js`

Main configuration file that reads from environment variables:

```javascript
// Export API Base URL for easy access
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  'https://fitness-tracker-api.fitness-tracker.workers.dev';
```

**Features**:
- ✅ Reads from `process.env.EXPO_PUBLIC_API_URL`
- ✅ Falls back to hardcoded URL if environment variable is not set
- ✅ Exports `API_BASE_URL` for use in other modules

---

## Current Backend URLs

### Production

```
https://fitness-tracker-api.fitness-tracker.workers.dev
```

**Endpoints**:
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/logout` - User logout
- `/auth/refresh` - Refresh authentication token
- `/auth/profile` - Get user profile
- `/auth/update-profile` - Update user profile
- `/data/sync` - Sync workout data
- `/data/get` - Retrieve workout data

---

## Setup Instructions

### For New Developers

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FitnessTrackerRefactored
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` if needed**
   - Open `.env` file
   - Verify the `EXPO_PUBLIC_API_URL` value
   - Update if you're using a different backend

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start the app**
   ```bash
   npm start
   ```

### For Different Environments

#### Development (Local Backend)
```bash
# .env
EXPO_PUBLIC_API_URL=http://localhost:8787
```

#### Staging
```bash
# .env
EXPO_PUBLIC_API_URL=https://fitness-tracker-api-staging.fitness-tracker.workers.dev
```

#### Production (Current)
```bash
# .env
EXPO_PUBLIC_API_URL=https://fitness-tracker-api.fitness-tracker.workers.dev
```

---

## How It Works

### Expo Environment Variables

Expo automatically loads environment variables from `.env` files:

1. **Variable Naming**: Must start with `EXPO_PUBLIC_`
   - ✅ `EXPO_PUBLIC_API_URL` - Accessible in code
   - ❌ `API_URL` - Not accessible

2. **Access in Code**: Use `process.env.EXPO_PUBLIC_*`
   ```javascript
   const apiUrl = process.env.EXPO_PUBLIC_API_URL;
   ```

3. **Build Time**: Environment variables are bundled at build time
   - Changing `.env` requires restarting Expo
   - No hot reload for environment variable changes

### Fallback Mechanism

The configuration includes a fallback to ensure the app works even if `.env` is missing:

```javascript
API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 
  'https://fitness-tracker-api.fitness-tracker.workers.dev'
```

**Benefits**:
- ✅ App works without `.env` file (uses default)
- ✅ Prevents "undefined" API URL errors
- ✅ Easier for quick testing

---

## OAuth Configuration

### Google Cloud Console Setup

**Required Updates After Changing Backend URL**:

1. **Log into Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)

2. **Navigate to OAuth Settings**
   - APIs & Services → Credentials
   - Select your OAuth 2.0 Client ID

3. **Update Authorized Redirect URIs**
   Add your backend URL callback:
   ```
   https://fitness-tracker-api.fitness-tracker.workers.dev/auth/google/callback
   ```

4. **Update Authorized JavaScript Origins**
   ```
   https://fitness-tracker-api.fitness-tracker.workers.dev
   ```

5. **Save Changes**

### Backend Configuration

Ensure your Cloudflare Worker has the correct OAuth credentials:

```javascript
// In cloudflare-worker-simple.js
const GOOGLE_CLIENT_ID = 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = 'your-google-client-secret';
const REDIRECT_URI = 'https://fitness-tracker-api.fitness-tracker.workers.dev/auth/google/callback';
```

---

## Troubleshooting

### Issue: API calls return 404

**Solution**: Verify your `.env` file has the correct URL:
```bash
cat .env
# Should show: EXPO_PUBLIC_API_URL=https://fitness-tracker-api.fitness-tracker.workers.dev
```

### Issue: Environment variable not updating

**Solution**: Restart Expo development server:
```bash
# Stop Expo (Ctrl+C)
# Clear cache and restart
npm start --reset-cache
```

### Issue: OAuth login fails

**Checklist**:
- ✅ Google Cloud Console redirect URI matches backend URL
- ✅ Backend URL in `.env` is correct
- ✅ Cloudflare Worker is deployed and running
- ✅ Worker has correct OAuth credentials

---

## Security Notes

### DO ✅

- Keep `.env` file in `.gitignore`
- Use environment variables for all URLs
- Use HTTPS for production APIs
- Commit `.env.example` with safe defaults

### DON'T ❌

- Commit `.env` file to git
- Hardcode API keys in source code
- Use HTTP in production
- Share `.env` files with sensitive data

---

## Verification Commands

### Check Environment File
```bash
cat .env
```

### Check Configuration in Code
```bash
head -10 src/app/config/cloudflare.js
```

### Test API Connection
```bash
curl https://fitness-tracker-api.fitness-tracker.workers.dev
```

---

## Related Files

- `/.env` - Environment variables (gitignored)
- `/.env.example` - Environment template
- `/src/app/config/cloudflare.js` - Configuration module
- `/cloudflare-worker-simple.js` - Backend worker code
- `/wrangler.toml` - Cloudflare Worker configuration

---

## Summary

✅ **Environment variable based configuration**  
✅ **Secure (`.env` not committed)**  
✅ **Flexible (easy to switch environments)**  
✅ **Fallback mechanism (app works without `.env`)**  
✅ **Well documented**  

The app is now properly configured to use `https://fitness-tracker-api.fitness-tracker.workers.dev` as the backend API endpoint, with the flexibility to change it via environment variables when needed.


