# Build APK Without Android Studio

## ✅ Easiest Method: Use EAS Build (Expo Application Services)

You can build your APK online without installing Android Studio!

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo (Create free account if needed)
```bash
eas login
```

### Step 3: Configure your project
```bash
eas build:configure
```

### Step 4: Build APK Online
```bash
eas build --platform android --profile preview
```

The APK will be built on Expo's servers and you'll get a download link!

---

## Alternative: Use GitHub Actions (Completely Free)

I can set up automated APK building using GitHub Actions that will:
- Build your APK automatically when you push code
- Store the APK file in GitHub releases
- No local installation needed!

Would you like me to set this up?

---

## Option 3: Online APK Builder Services

You can also use online services like:
1. **AppGyver** - Free online builder
2. **Appetize.io** - Test and build online
3. **BitRise** - CI/CD with free tier

---

## Quick Fix: Install Just Android SDK (Lighter than Android Studio)

Download Android Command Line Tools only:
https://developer.android.com/studio#command-line-tools-only

Then set ANDROID_HOME environment variable to the SDK location.

---

**Recommendation:** Use EAS Build - it's the easiest way to get your APK without any local installation!

Would you like me to set up any of these methods?
