# Build Android APK - Money Manager App

## ✅ Setup Complete!

Your app is now configured to build as an Android APK. Here's how to generate the APK:

## Prerequisites

1. **Install Android Studio**: Download from https://developer.android.com/studio
2. **Install Java JDK 17**: Required for Android development

## Method 1: Build APK using Android Studio (Recommended)

1. **Open Android Studio**

2. **Open the Android project**:
   - In Android Studio, click "Open an Existing Project"
   - Navigate to: `C:\Users\Dinushi Hansani\Desktop\Moneymanagement\MoneyManagementApp\android`
   - Click "OK"

3. **Wait for Gradle Sync**:
   - Android Studio will automatically sync Gradle (this may take a few minutes the first time)
   - Wait until you see "Gradle build finished" in the bottom status bar

4. **Build the APK**:
   - Go to `Build` menu → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait for the build to complete
   - Click "locate" in the notification that appears
   - The APK will be in: `android\app\build\outputs\apk\debug\app-debug.apk`

5. **Install on your phone**:
   - Transfer `app-debug.apk` to your phone
   - Enable "Install from Unknown Sources" in phone settings
   - Open the APK file and install

## Method 2: Build from Command Line (Advanced)

If you have Android SDK installed and configured:

```bash
# Make sure web assets are up to date
npm run build

# Copy web assets to Android
npx cap sync android

# Build the APK (must be in the android directory)
cd android
./gradlew assembleDebug

# APK will be in: android/app/build/outputs/apk/debug/app-debug.apk
```

## Updating the App

Whenever you make changes to your web app:

```bash
# 1. Build the web app
npm run build

# 2. Sync changes to Android
npx cap sync android

# 3. Rebuild the APK in Android Studio or use gradlew
```

## Important Notes

### App Permissions
The app will need these permissions (already configured):
- Internet access (to connect to Firebase)
- Network state access

### Firebase Configuration
- Your Firebase config is already in the app
- The APK will use the same Firebase project
- All data is synced between web and mobile app

### Testing
- The first build creates a **debug APK** (for testing only)
- For production (Google Play Store), you'll need to build a **release APK** with signing

### App Icon
To change the app icon:
1. Replace icon files in `android/app/src/main/res/` folders
2. Use Android Studio's Image Asset Studio: `Right-click res → New → Image Asset`

## Quick Start Commands

```bash
# Update web code and sync to Android
npm run build && npx cap sync android

# Open in Android Studio
npx cap open android
```

## File Locations

- **Web Source**: `src/` folder
- **Android Project**: `android/` folder
- **Built Web Assets**: `dist/` folder
- **APK Output**: `android/app/build/outputs/apk/debug/app-debug.apk`

## Troubleshooting

### "Android Studio not found"
- Download and install Android Studio from the official website
- Make sure Android SDK is installed through Android Studio

### "Gradle build failed"
- Open Android Studio and let it download necessary components
- Check if Java JDK 17 is installed

### "App crashes on phone"
- Make sure you built the app after the latest web changes
- Check browser console for errors when testing on web first
- Enable USB debugging and check Android logcat for errors

## Next Steps

1. Install Android Studio (if not installed)
2. Open the `android` folder in Android Studio
3. Wait for Gradle sync
4. Build APK
5. Install on your phone and test!

## Production Release

For publishing to Google Play Store:
1. Build a release APK with signing
2. Follow Google Play Console guidelines
3. Create app listing and submit for review

---

Your Money Manager app is ready to be built as an Android APK! 📱✨
