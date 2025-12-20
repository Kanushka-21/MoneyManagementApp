# Native Google Sign-In Setup for Android

## Problem
Firebase Auth's web-based Google Sign-In doesn't work in Android WebView, causing white screen and "missing initial state" errors.

## Solution
We've installed `@codetrix-studio/capacitor-google-auth` for native Google Sign-In.

## Setup Steps

### 1. Get Your Web Client ID from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **moneymanagementapp-cfc44**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Find your Web app
6. Copy the **Web client ID** (looks like: `698654609012-xxxxxxxxx.apps.googleusercontent.com`)

### 2. Update capacitor.config.json

Replace `YOUR_SERVER_CLIENT_ID` in `capacitor.config.json` with your **Web Client ID**:

```json
"GoogleAuth": {
  "scopes": ["profile", "email"],
  "serverClientId": "698654609012-YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com",
  "forceCodeForRefreshToken": true
}
```

### 3. Update authService.js

Replace `YOUR_WEB_CLIENT_ID` in `src/services/authService.js` with your **Web Client ID**:

```javascript
GoogleAuth.initialize({
  clientId: '698654609012-YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  grantOfflineAccess: true,
});
```

### 4. Verify SHA-1 Fingerprint in Firebase (IMPORTANT!)

Your Android app needs to be registered with the correct SHA-1 fingerprint:

1. Go to Firebase Console → Project Settings → Your Apps
2. Find your Android app `com.moneymanager.app`
3. Make sure your **debug/release SHA-1 fingerprint** is added

To get your SHA-1:
```bash
cd android
./gradlew signingReport
```

Look for the SHA-1 under `Variant: debug` and add it to Firebase.

### 5. Download Updated google-services.json

After adding SHA-1:
1. Download the new `google-services.json` from Firebase Console
2. Replace `android/app/google-services.json` with the new file

### 6. Sync and Build

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

## How It Works

- **On Android (Native)**: Uses native Google Sign-In dialog (no webview issues!)
- **On Web**: Uses Firebase popup (works fine in browsers)

## Testing

1. Install the new APK on your Android device
2. Click "Sign in with Google"
3. You should see the native Google account picker (not a webview!)
4. Select your account → Done!

## Troubleshooting

### Still seeing white screen?
- Make sure you updated BOTH config files with the actual Web Client ID
- Verify SHA-1 fingerprint is added to Firebase
- Download and replace google-services.json

### "Sign-in failed" error?
- Check that the Web Client ID is correct (copy it exactly from Firebase Console)
- Ensure the SHA-1 fingerprint matches your build

### Need to find your Web Client ID?
Run this command to see it in your google-services.json:
```bash
cat android/app/google-services.json | grep client_id
```

Look for the one with `client_type: 3` (that's the Web Client ID).
