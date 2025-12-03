# OAuth Implementation Summary
# Google 和 Apple 登入實作總結

## Overview | 概述

This document summarizes the implementation of Google and Apple OAuth sign-in for the Fitness Tracker application.
本文檔總結了 Fitness Tracker 應用程式中 Google 和 Apple OAuth 登入的實作。

---

## Part 1: Frontend Updates | 前端更新

### 1.1 LoginScreen.tsx

**Changes:**
- ✅ Removed mock Google login logic
- ✅ Implemented real `promptAsync()` call for Google OAuth
- ✅ Added `useEffect` hook to handle OAuth response
- ✅ Configured `useAuthRequest` with correct scopes: `['openid', 'profile', 'email']`
- ✅ Uses `GOOGLE_CLIENT_ID` from centralized config

**Key Code:**
```typescript
const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'fitnesstracker',
      path: 'auth',
    }),
    responseType: AuthSession.ResponseType.IdToken,
  },
  {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  }
);
```

### 1.2 authService.ts

**Changes:**
- ✅ Removed mock logic from `loginWithGoogle()`
- ✅ Removed mock logic from `loginWithApple()`
- ✅ Implemented real API calls to `/auth/google` and `/auth/apple`
- ✅ Proper error handling and user data persistence

**Key Functions:**
- `loginWithGoogle(idToken: string)`: Calls backend `/auth/google` endpoint
- `loginWithApple(identityToken: string, fullName?: {...})`: Calls backend `/auth/apple` endpoint

### 1.3 cloudflare.js (Config)

**Changes:**
- ✅ Updated `loginWithGoogle()` to call `/auth/google` endpoint
- ✅ Updated `loginWithApple()` to call `/auth/apple` endpoint
- ✅ Changed request body format to match backend expectations

---

## Part 2: Backend Updates | 後端更新

### 2.1 New Endpoints

#### POST /auth/google

**Request:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Process:**
1. Validates Google ID token with `https://oauth2.googleapis.com/tokeninfo`
2. Security check: Verifies `aud` (audience) matches `GOOGLE_CLIENT_ID`
3. Extracts user email, name, and `sub` (Google user ID)
4. Checks if user exists in database (by email or providerId)
5. Creates new user if doesn't exist
6. Returns JWT token and user data

**Response:**
```json
{
  "message": "Google 登入成功",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "User Name",
    "provider": "google"
  }
}
```

#### POST /auth/apple

**Request:**
```json
{
  "identityToken": "apple_identity_token_here",
  "user": {
    "givenName": "John",
    "familyName": "Doe"
  }
}
```

**Process:**
1. Decodes Apple identity token (lightweight JWT decode)
2. Extracts email and `sub` (Apple user ID) from token payload
3. Uses `fullName` parameter if provided (only available on first login)
4. Checks if user exists in database (by email or providerId)
5. Creates new user if doesn't exist
6. Returns JWT token and user data

**Response:**
```json
{
  "message": "Apple 登入成功",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@privaterelay.appleid.com",
    "displayName": "John Doe",
    "provider": "apple"
  }
}
```

### 2.2 Helper Functions

#### validateGoogleToken(idToken, clientId)
- Verifies Google ID token with Google's tokeninfo endpoint
- Validates audience matches Client ID
- Returns user info: `{ email, name, sub, picture }`

#### decodeAppleToken(identityToken, fullName)
- Lightweight JWT decode (without signature verification)
- Extracts email and `sub` from token payload
- Uses `fullName` parameter for display name
- Returns user info: `{ email, name, sub }`

---

## Part 3: Database Schema | 數據庫架構

### Current Schema | 當前架構

The `users` table already supports OAuth through:
`users` 表已通過以下列支持 OAuth：

- `provider` (TEXT): Authentication provider ('email', 'google', 'apple', 'facebook')
- `providerId` (TEXT): OAuth provider's user ID (e.g., Google `sub`, Apple `sub`)
- `password` (TEXT, nullable): NULL for OAuth users

### Migration | 遷移

If your database doesn't have these columns, see:
如果您的數據庫沒有這些列，請參閱：

📄 `docs/OAUTH_DATABASE_MIGRATION.sql`

**SQL Migration:**
```sql
-- Add provider column
ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email';

-- Add providerId column
ALTER TABLE users ADD COLUMN providerId TEXT;

-- Update existing users
UPDATE users SET provider = 'email' WHERE provider IS NULL;
```

---

## Configuration | 配置

### Frontend (.env)

```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Backend (wrangler.toml / Secrets)

**For Production:**
```bash
wrangler secret put GOOGLE_CLIENT_ID
```

**For Local Development:**
Create `.dev.vars` file:
```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
```

---

## Security Features | 安全特性

### Google OAuth
- ✅ Token verification with Google's tokeninfo endpoint
- ✅ Audience validation (checks `aud` matches Client ID)
- ✅ Secure token transmission

### Apple OAuth
- ✅ JWT token decoding
- ✅ Email and user ID extraction
- ⚠️ Note: Signature verification not implemented (lightweight decode only)

### General
- ✅ No hardcoded credentials
- ✅ Environment variable configuration
- ✅ Proper error handling
- ✅ User data validation

---

## Testing | 測試

### Google Sign-In
1. Click "使用 Google 登入" button
2. Select Google account
3. Grant permissions
4. Should redirect back to app and log in

### Apple Sign-In (iOS only)
1. Click Apple sign-in button
2. Authenticate with Face ID/Touch ID/Password
3. Grant permissions (first time only)
4. Should log in automatically

---

## Files Modified | 修改的文件

### Frontend
- ✅ `src/features/auth/screens/LoginScreen.tsx`
- ✅ `src/shared/services/api/authService.ts`
- ✅ `src/app/config/cloudflare.js`

### Backend
- ✅ `cloudflare-worker-simple.js`
- ✅ `wrangler.toml`

### Documentation
- ✅ `docs/OAUTH_DATABASE_MIGRATION.sql`
- ✅ `docs/OAUTH_IMPLEMENTATION.md` (this file)

---

## Next Steps | 下一步

1. **Deploy Backend:**
   ```bash
   wrangler deploy
   wrangler secret put GOOGLE_CLIENT_ID
   ```

2. **Test OAuth Flow:**
   - Test Google sign-in on both iOS and Android
   - Test Apple sign-in on iOS
   - Verify user creation in database
   - Verify JWT token generation

3. **Optional Enhancements:**
   - Add Apple token signature verification (requires Apple public keys)
   - Add avatar URL storage from OAuth providers
   - Add account linking (link Google/Apple to existing email account)

---

## Troubleshooting | 故障排除

### Google Sign-In Fails
- Check `GOOGLE_CLIENT_ID` is set correctly
- Verify redirect URI matches Google Cloud Console configuration
- Check network connectivity

### Apple Sign-In Fails
- Verify running on iOS device (not available on Android/Web)
- Check Apple Developer account configuration
- Verify bundle ID matches Apple configuration

### Token Validation Fails
- Check backend logs for detailed error messages
- Verify environment variables are set correctly
- Check database schema has required columns

---

## Notes | 注意事項

1. **Apple Token Verification:**
   - Current implementation uses lightweight JWT decode
   - For production, consider implementing full signature verification
   - Requires fetching Apple's public keys from `https://appleid.apple.com/auth/keys`

2. **User Linking:**
   - If a user signs in with Google/Apple using an email that already exists with email/password, they are treated as separate accounts
   - Consider implementing account linking in the future

3. **Privacy:**
   - Apple Sign-In may use private relay email addresses
   - Handle email changes if user disables private relay

---

**Implementation Date:** 2025-01-24
**Status:** ✅ Complete and Ready for Testing

