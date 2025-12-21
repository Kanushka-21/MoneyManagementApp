# Fix Authentication White Screen Error

## Problem
After selecting a Google account, you see a white screen with the error:
> "Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared."

## Root Causes
1. ❌ Using `signInWithRedirect` instead of `signInWithPopup`
2. ❌ Missing or incorrect authorized domains in Firebase
3. ❌ Third-party cookies blocked in browser
4. ❌ Incorrect OAuth 2.0 Client configuration
5. ❌ Browser storage restrictions

## ✅ Solutions Applied

### 1. Code Changes (Already Done)
- ✅ Changed to use `signInWithPopup` exclusively (never `signInWithRedirect`)
- ✅ Added proper Google Auth Provider configuration
- ✅ Improved error handling with specific messages
- ✅ Added auth state clearing before new sign-in attempts

### 2. Firebase Console Configuration (DO THIS NOW)

#### Step A: Add Authorized Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **moneymanagementapp-cfc44**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Make sure these domains are added:
   - `localhost` (for local development)
   - `127.0.0.1` (for local development)
   - Your production domain (if deployed)
   - `moneymanagementapp-cfc44.firebaseapp.com`
   - `moneymanagementapp-cfc44.web.app`

#### Step B: Verify Google Sign-In is Enabled
1. In Firebase Console → **Authentication** → **Sign-in method**
2. Make sure **Google** is **Enabled**
3. Click **Google** and verify:
   - Project support email is set
   - Web client ID is configured

#### Step C: Check OAuth Consent Screen (Google Cloud Console)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **moneymanagementapp-cfc44**
3. Go to **APIs & Services** → **OAuth consent screen**
4. Under **Authorized domains**, add:
   - `firebaseapp.com`
   - `localhost` (if available)
5. Under **Authorized redirect URIs** (in Credentials section):
   - Go to **APIs & Services** → **Credentials**
   - Find your **Web client (auto created by Google Service)**
   - Add these Authorized redirect URIs:
     ```
     http://localhost
     http://localhost:5173
     http://127.0.0.1:5173
     https://moneymanagementapp-cfc44.firebaseapp.com/__/auth/handler
     https://moneymanagementapp-cfc44.web.app/__/auth/handler
     ```

### 3. Browser Settings

#### Clear Browser Data
1. Open Chrome DevTools (F12)
2. Go to **Application** tab → **Storage**
3. Click **Clear site data**
4. Close and reopen the browser

#### Enable Third-Party Cookies (if needed)
Chrome:
1. Settings → Privacy and security → Third-party cookies
2. Select "Allow third-party cookies"
   
   OR
   
3. Add exception for `firebaseapp.com` and `googleapis.com`

#### Allow Popups
1. Click the icon in address bar (to the right)
2. Allow popups for localhost
3. Refresh the page

### 4. Testing Steps

1. **Clear everything first:**
   ```powershell
   # Stop the dev server if running (Ctrl+C)
   
   # Clear node_modules cache
   Remove-Item -Recurse -Force node_modules/.vite
   
   # Restart dev server
   npm run dev
   ```

2. **Open in incognito/private window** to test without cached data

3. **Check console for errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any red errors
   - Take a screenshot if errors appear

4. **Test the flow:**
   - Click "Sign in with Google"
   - Should see a Google popup (NOT a redirect)
   - Select your account
   - Should be signed in immediately

## Common Issues & Solutions

### Issue: "Popup was blocked"
**Solution:** Click the blocked popup icon in address bar and allow popups

### Issue: "This domain is not authorized"
**Solution:** Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Issue: Still getting white screen
**Solutions:**
1. Try a different browser (Firefox, Edge)
2. Disable browser extensions (especially ad blockers)
3. Check if you're using the correct Google account
4. Make sure Firebase Auth is not in sandbox mode

### Issue: Works on localhost but not on deployed app
**Solution:** Add your deployed domain to:
- Firebase Console → Authorized domains
- Google Cloud Console → OAuth consent screen → Authorized domains
- Google Cloud Console → Credentials → Authorized redirect URIs

## For Mobile App (Capacitor)

The native app uses `@codetrix-studio/capacitor-google-auth` which doesn't have this issue because it uses native Google Sign-In.

If you're seeing this error in the mobile app:
1. Make sure you've built the app with latest changes:
   ```bash
   npm run build
   npx cap sync
   ```
2. The error might be happening in a WebView redirect - the native plugin should handle it

## Verification Checklist

- [ ] Firebase Console → Authentication → Google is enabled
- [ ] Firebase Console → Authorized domains includes localhost and your domain
- [ ] Google Cloud Console → OAuth consent screen configured
- [ ] Google Cloud Console → Credentials → Redirect URIs added
- [ ] Browser allows popups for localhost
- [ ] Browser has third-party cookies enabled (or exception added)
- [ ] Tested in incognito/private window
- [ ] Cleared browser cache and cookies
- [ ] Dev server restarted after code changes

## Still Not Working?

If you're still experiencing issues:

1. **Share your console logs:**
   - Open DevTools (F12) → Console
   - Try signing in
   - Copy all red errors
   - Share them for further debugging

2. **Check Network tab:**
   - DevTools (F12) → Network
   - Try signing in
   - Look for failed requests (red)
   - Check the response of failed requests

3. **Verify domain:**
   - What URL are you using? (localhost:5173, or deployed URL?)
   - Make sure this exact URL is in Firebase authorized domains

4. **Try this test:**
   ```javascript
   // Open browser console and run:
   console.log(window.sessionStorage);
   console.log(window.localStorage);
   // Should not be null or throw errors
   ```

## Contact Support

If none of the above works, you might need to:
1. Create a new OAuth 2.0 client ID in Google Cloud Console
2. Update the client ID in your Firebase config
3. Contact Firebase Support
