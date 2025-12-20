# Firebase Android Setup Guide

## Problem
The APK loads but gets stuck on the loading screen without connecting to Firebase authentication and database.

## Solution
The Android app needs proper Firebase configuration to work with Google Sign-in.

## Steps to Fix

### 1. Get Android SHA-1 Fingerprint

Run this command to generate a debug keystore (if it doesn't exist):
```bash
cd android
./gradlew signingReport
```

This will show SHA-1 and SHA-256 fingerprints. Copy the **debug SHA-1** fingerprint.

Alternatively, if you have the debug keystore at `~/.android/debug.keystore`:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 2. Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **moneymanagementapp-cfc44**
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click **Add app** → Select **Android**
6. Fill in:
   - **Android package name**: `com.moneymanager.app`
   - **App nickname**: Money Manager (optional)
   - **Debug signing certificate SHA-1**: Paste the SHA-1 from step 1
7. Click **Register app**
8. Download the **google-services.json** file
9. Place it in: `android/app/google-services.json`

### 3. Update Android Build Configuration

The `android/app/build.gradle` file needs the Google Services plugin. Check if this line exists:

```gradle
apply plugin: 'com.google.gms.google-services'
```

If not, add it at the **bottom** of `android/app/build.gradle`.

Also check `android/build.gradle` has the Google Services classpath:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 4. Sync and Rebuild

```bash
# Sync Capacitor with Android project
npx cap sync android

# Rebuild the APK (if building locally)
cd android
./gradlew assembleDebug

# Or push to GitHub to trigger GitHub Actions build
git add .
git commit -m "Add Firebase Android configuration"
git push origin main
```

### 5. Install and Test

Download the new APK from GitHub Actions artifacts and install on your device. The app should now:
- Load properly without getting stuck
- Allow Google Sign-in
- Connect to Firestore database
- Show all your existing data

## Troubleshooting

### If still stuck on loading:

1. **Check internet connection** on the device
2. **Check Firebase console** → Authentication → Sign-in method → Google is enabled
3. **Check Firestore rules** are allowing authenticated reads/writes
4. **Check browser console logs** by enabling USB debugging:
   ```bash
   npx cap open android
   ```
   Then use Chrome DevTools → `chrome://inspect` to view logs

### If Google Sign-in fails:

- Make sure SHA-1 fingerprint is added to Firebase
- Verify `google-services.json` is in the correct location
- Check package name matches in Firebase Console and `capacitor.config.json`

### If data doesn't load:

- Verify user is authenticated (check Firebase Console → Authentication → Users)
- Check Firestore rules allow authenticated access
- Test the web app to confirm Firebase connection works there

## Notes

- The web app uses OAuth redirect which works fine in browsers
- Android apps need SHA-1 fingerprint for Google Sign-in
- Debug and release builds have different SHA-1 fingerprints
- For production (release APK), you'll need to add the release SHA-1 too
