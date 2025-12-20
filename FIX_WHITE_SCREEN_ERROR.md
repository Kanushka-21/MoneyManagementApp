# Fix for "Missing Initial State" Error in Current APK

## Problem
The installed APK shows a white screen after selecting Google account, then displays:
```
Unable to process request due to missing initial state. This may happen if browser sessionStorage is inaccessible or accidentally cleared.
```

## Quick Fix (For Current APK Users)

### Method 1: Clear App Data (Recommended)
1. Go to **Settings** on your Android device
2. Navigate to **Apps** or **Applications**
3. Find **Money Manager**
4. Tap on **Storage**
5. Click **Clear Data** or **Clear Storage**
6. Reopen the app and try signing in again

### Method 2: Reinstall the App
1. Uninstall the Money Manager app
2. Restart your device
3. Download and install build #22 or later from GitHub Actions
4. Try signing in

## Root Cause
The current APK uses web-based Firebase authentication which doesn't work properly in Android WebView due to sessionStorage restrictions.

## Permanent Solution (New APK - Build #22+)

The new builds (starting from #22) include:

### 1. Native Google Sign-In
- Uses native Android Google account picker
- No webview issues
- Works like other Android apps

### 2. Intelligent Fallback
- If native auth fails, automatically tries popup method
- Better error messages
- Instructs users how to fix issues

### 3. Improved Error Handling
- Shows clear error messages
- Provides step-by-step fix instructions
- Logs detailed information for debugging

## How to Get the Fixed APK

### Option 1: GitHub Actions (Easiest)
1. Go to: https://github.com/Kanushka-21/MoneyManagementApp/actions
2. Click on the latest **successful** build (Build #22 or higher)
3. Scroll down to **Artifacts**
4. Download **money-manager-debug-apk**
5. Install the APK

### Option 2: Build Locally
If you have Android Studio or Android SDK installed:

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Wait for Web Deploy
The web version at https://moneymanagementapp-cfc44.web.app already has the fixes and works perfectly!

## Testing the Fix

1. Install the new APK (build #22+)
2. Open the app
3. Click "Sign in with Google"
4. **You should see**: Native Android account picker (looks like system dialog)
5. Select your account
6. Done! No white screen, no errors ✅

## Comparison

| Feature | Old APK (Build #1-21) | New APK (Build #22+) |
|---------|----------------------|---------------------|
| Auth Method | WebView popup | Native + Fallback |
| White Screen | ❌ Yes | ✅ No |
| SessionStorage Error | ❌ Yes | ✅ No |
| Account Picker | Web-based | Native Android |
| Error Messages | Generic | Detailed with fixes |
| Reliability | Low | High |

## Still Having Issues?

If you're still seeing the error with build #22+:

1. **Clear app data** (see Method 1 above)
2. Check that you're using **build #22 or later**
3. Ensure you have **Google Play Services** installed
4. Try signing in with a **different Google account**
5. Check the logs in the app for detailed error info

## For Developers

The fix includes:
- `@codetrix-studio/capacitor-google-auth` plugin for native auth
- Dynamic import to handle plugin availability gracefully
- Fallback to popup auth if native fails
- Better error messages in [Login.jsx](src/components/Login.jsx)
- Improved auth flow in [authService.js](src/services/authService.js)

## Build Status

✅ Build #22 and later include the fix
❌ Build #1-21 have the sessionStorage issue
🚀 GitHub Actions will automatically build new APKs with every commit
