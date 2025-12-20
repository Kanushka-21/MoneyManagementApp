# Google Sign-In White Screen Fix

## Issue
After installing the Android APK, users could select their Google account but then saw a white screen. Upon reload, they received the error:
```
Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared.
```

## Root Cause
Firebase Authentication's `signInWithRedirect` doesn't work properly in Capacitor/Cordova apps due to the webview context and sessionStorage limitations.

## Solution Applied

### 1. Updated Authentication Service
- **File**: `src/services/authService.js`
- Changed to use `signInWithPopup` consistently for both web and mobile
- Added proper error handling for popup-related issues
- Removed conditional mobile/web logic that was causing issues

### 2. Updated Capacitor Configuration
- **File**: `capacitor.config.json`
- Enabled web contents debugging for easier troubleshooting
- Added Browser plugin configuration for better popup handling
- Settings:
  ```json
  "android": {
    "allowMixedContent": true,
    "webContentsDebuggingEnabled": true
  },
  "plugins": {
    "Browser": {
      "presentationStyle": "popover"
    }
  }
  ```

### 3. Enhanced Android Manifest
- **File**: `android/app/src/main/AndroidManifest.xml`
- Added OAuth callback intent filter to properly handle Firebase Auth redirects
- Configured the app to handle `https://moneymanagementapp-cfc44.firebaseapp.com/__/auth/handler` URLs

## Testing Steps

1. **Build the new APK**:
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```

2. **Install the APK** on your Android device

3. **Test Google Sign-In**:
   - Open the app
   - Click "Sign in with Google"
   - Select your Google account
   - You should now be signed in successfully without a white screen

4. **Verify persistence**:
   - Close the app completely
   - Reopen it
   - You should remain signed in

## Alternative: If Issues Persist

If you still experience issues, you may need to use the Google Sign-In plugin for Capacitor:

1. Install the plugin:
   ```bash
   npm install @codetrix-studio/capacitor-google-auth
   npx cap sync
   ```

2. Update the auth service to use native Google Sign-In instead of Firebase popup

## Build Status
The GitHub Actions workflow (build #20+) will now automatically build an APK with these fixes applied.

## Notes
- The `signInWithPopup` method works well in Capacitor's webview
- The OAuth intent filter ensures the app can receive authentication callbacks
- Web debugging is enabled to help troubleshoot any future issues
