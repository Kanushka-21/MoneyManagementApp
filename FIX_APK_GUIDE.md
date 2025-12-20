# 🔧 Fix APK Loading Issue - Complete Guide

## 🎯 Issues to Fix
1. ❌ APK stuck on loading screen, not connecting to Firebase
2. ❌ App needs custom logo/icon

## ✅ What We've Done

### 1. Updated Android Manifest
Added Firebase intent filter and network permission to [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml):
- Added intent filter for Firebase OAuth redirect
- Added `ACCESS_NETWORK_STATE` permission

### 2. Updated Capacitor Config
Modified [capacitor.config.json](capacitor.config.json) with:
- `androidScheme: "https"` - Use HTTPS scheme for better Firebase compatibility
- `allowMixedContent: true` - Allow Firebase connections
- `cleartext: true` - Allow network traffic

### 3. Installed Required Plugins
```bash
npm install @capacitor/browser@6 @capacitor/app@6
```
These plugins are needed for Firebase OAuth in Android.

### 4. Generated App Icon
Created `app-icon.svg` with green gradient and $ symbol matching your web app design.

## 🚀 Steps to Complete the Fix

### Step 1: Get SHA-1 Fingerprint (CRITICAL for Firebase)

The APK won't connect to Firebase without this! You need to:

**Option A: Using Gradlew (Recommended)**
```bash
cd android
./gradlew signingReport
```
Look for the debug SHA-1 fingerprint in the output.

**Option B: Using Keytool**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Step 2: Add SHA-1 to Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **moneymanagementapp-cfc44**
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** section
5. Click **Add app** → **Android** (📱 icon)
6. Fill in:
   - **Android package name**: `com.moneymanager.app` (MUST match exactly!)
   - **App nickname**: Money Manager
   - **Debug signing certificate SHA-1**: Paste your SHA-1 from Step 1
7. Click **Register app**
8. **Download google-services.json**
9. Save it to: `android/app/google-services.json`

### Step 3: Add Custom App Icon

**Option A: Online Generator (Easiest)**
1. Visit: https://icon.kitchen/
2. Upload `app-icon.svg` (already created in your project root)
3. Select "Android"
4. Download the icon pack
5. Extract and copy all folders (mipmap-hdpi, mipmap-mdpi, etc.) to:
   `android/app/src/main/res/`
6. Overwrite existing files

**Option B: Android Asset Studio**
1. Visit: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Click "Image" tab
3. Upload `app-icon.svg`
4. Adjust padding if needed (recommended: 10-15%)
5. Download ZIP
6. Extract and copy to `android/app/src/main/res/`

### Step 4: Sync and Rebuild

```bash
# Sync Capacitor with Android project
npx cap sync android

# Commit and push changes
git add .
git commit -m "Add Firebase Android config and custom app icon"
git push origin main
```

GitHub Actions will automatically build the APK with your changes.

### Step 5: Download and Install New APK

1. Go to GitHub Actions tab in your repository
2. Find the latest workflow run
3. Download "app-debug.apk" artifact
4. Transfer to your Android device
5. Install (enable "Install from unknown sources" if needed)
6. Open the app

## ✅ Expected Results

After following these steps, your app should:
- ✅ Show custom green $ icon on home screen
- ✅ Load without getting stuck
- ✅ Show Google Sign-in screen
- ✅ Connect to Firebase after authentication
- ✅ Display all your existing transactions, expenses, and liabilities
- ✅ Work exactly like the web version

## 🐛 Troubleshooting

### Still stuck on loading?
- **Check**: Did you add SHA-1 to Firebase Console?
- **Check**: Is `google-services.json` in `android/app/` folder?
- **Check**: Does package name match exactly: `com.moneymanager.app`?
- **Try**: Enable USB debugging and check logs:
  ```bash
  npx cap open android
  # In Chrome, visit chrome://inspect to see console logs
  ```

### Google Sign-in not working?
- **Firebase Console** → Authentication → Sign-in method → Ensure "Google" is enabled
- **Verify**: SHA-1 fingerprint is correct and added
- **Check**: Firebase OAuth redirect URI includes your app package

### App crashes on startup?
- **Check**: Is internet connection available?
- **Verify**: All permissions granted in Android Settings → Apps → Money Manager
- **Try**: Clear app data and reinstall

### Icon not showing?
- **Check**: Did you copy icons to all mipmap-* folders?
- **Run**: `npx cap sync android` after adding icons
- **Verify**: AndroidManifest.xml has `android:icon="@mipmap/ic_launcher"`

## 📝 Important Notes

1. **SHA-1 Required**: Without adding SHA-1 to Firebase, Google Sign-in will NEVER work in Android
2. **Debug vs Release**: You'll need a different SHA-1 for production release builds
3. **google-services.json**: This file is auto-detected by build.gradle and enables Firebase
4. **Package Name**: Must match exactly in Firebase Console, AndroidManifest.xml, and capacitor.config.json

## 🔗 Helpful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Icon Kitchen - Icon Generator](https://icon.kitchen/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)

## 📞 Next Steps After Fix

Once the app is working:
1. Test all features (transactions, liabilities, categories)
2. Verify data syncs with web app
3. Test offline behavior
4. Share the APK with others (they'll see your custom icon!)

## 🎉 Success Checklist

- [ ] SHA-1 fingerprint obtained
- [ ] SHA-1 added to Firebase Console
- [ ] google-services.json downloaded and placed in android/app/
- [ ] Custom app icon generated and copied to mipmap folders
- [ ] `npx cap sync android` executed
- [ ] Changes committed and pushed to GitHub
- [ ] New APK downloaded from GitHub Actions
- [ ] APK installed on device
- [ ] App loads successfully
- [ ] Google Sign-in works
- [ ] Data appears correctly
- [ ] Custom icon visible on home screen
