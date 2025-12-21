# Complete Deployment Checklist for All Platforms

## 🎯 Problem: "Missing Initial State" Error on All Platforms

This error occurs when Firebase Auth cannot access browser sessionStorage. The fixes need to be applied to **Firebase Console**, **code**, and **deployment configurations**.

---

## ✅ Step 1: Firebase Console Configuration (CRITICAL!)

### A. Add ALL Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **moneymanagementapp-cfc44**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add:

```
localhost
127.0.0.1
moneymanagementapp-cfc44.firebaseapp.com
moneymanagementapp-cfc44.web.app
YOUR-NETLIFY-SUBDOMAIN.netlify.app
YOUR-CUSTOM-DOMAIN.com (if you have one)
```

**Note:** Replace `YOUR-NETLIFY-SUBDOMAIN` with your actual Netlify subdomain (e.g., `money-manager-app.netlify.app`)

### B. Google Cloud Console OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project: **moneymanagementapp-cfc44**
3. Go to **APIs & Services** → **Credentials**
4. Find **Web client (auto created by Google Service)** 
5. Click to edit
6. Under **Authorized JavaScript origins**, add:

```
http://localhost:5173
http://127.0.0.1:5173
https://moneymanagementapp-cfc44.firebaseapp.com
https://moneymanagementapp-cfc44.web.app
https://YOUR-NETLIFY-SUBDOMAIN.netlify.app
https://YOUR-CUSTOM-DOMAIN.com
```

7. Under **Authorized redirect URIs**, add:

```
http://localhost:5173/__/auth/handler
http://localhost:5173
http://127.0.0.1:5173/__/auth/handler
https://moneymanagementapp-cfc44.firebaseapp.com/__/auth/handler
https://moneymanagementapp-cfc44.web.app/__/auth/handler
https://YOUR-NETLIFY-SUBDOMAIN.netlify.app/__/auth/handler
```

8. Click **Save**

### C. OAuth Consent Screen

1. Still in Google Cloud Console
2. Go to **APIs & Services** → **OAuth consent screen**
3. Under **Authorized domains**, add:

```
firebaseapp.com
web.app
netlify.app
YOUR-CUSTOM-DOMAIN.com (if applicable)
```

---

## ✅ Step 2: Deploy to Firebase Hosting

### Build and Deploy

```powershell
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# If you haven't initialized Firebase CLI:
npm install -g firebase-tools
firebase login
firebase init hosting
# Select existing project: moneymanagementapp-cfc44
# Set public directory to: dist
# Configure as single-page app: Yes
# Set up automatic builds: No
firebase deploy --only hosting
```

### Your Firebase URL will be:
- `https://moneymanagementapp-cfc44.firebaseapp.com`
- `https://moneymanagementapp-cfc44.web.app`

---

## ✅ Step 3: Deploy to Netlify

### Option A: Manual Deploy

```powershell
# Build the app
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Option B: Connect GitHub Repository

1. Go to [Netlify](https://netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect your GitHub repository
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**

### Get Your Netlify URL

After deployment, copy your Netlify URL (e.g., `https://your-app-name.netlify.app`)

**IMPORTANT:** Add this URL to Firebase Console authorized domains (see Step 1A)

---

## ✅ Step 4: Build Android APK

### Prerequisites

```powershell
# Sync Capacitor
npm run build
npx cap sync android
```

### Update Android Configuration

Check that [android/app/src/main/res/values/strings.xml](android/app/src/main/res/values/strings.xml) contains:

```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Money Manager</string>
    <string name="title_activity_main">Money Manager</string>
    <string name="package_name">com.moneymanager.app</string>
    <string name="custom_url_scheme">com.moneymanager.app</string>
    
    <!-- Google Sign-In -->
    <string name="server_client_id">698654609012-3rtpod17gvkv41c75rkngng24rdf17kv.apps.googleusercontent.com</string>
</resources>
```

### Build APK

#### Option 1: Using Android Studio
1. Open `android` folder in Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option 2: Command Line
```powershell
cd android
.\gradlew assembleDebug
cd ..
```

### Test APK

```powershell
# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Step 5: Verification Checklist

### For Web (localhost)
- [ ] Navigate to `http://localhost:5173`
- [ ] Click "Sign in with Google"
- [ ] Should see Google popup (NOT redirect)
- [ ] Should sign in successfully without white screen

### For Firebase Hosting
- [ ] Navigate to `https://moneymanagementapp-cfc44.web.app`
- [ ] Click "Sign in with Google"
- [ ] Should see Google popup
- [ ] Should sign in successfully
- [ ] Check browser console (F12) for any errors

### For Netlify
- [ ] Navigate to your Netlify URL
- [ ] Click "Sign in with Google"
- [ ] Should see Google popup
- [ ] Should sign in successfully
- [ ] Verify the URL is added to Firebase authorized domains

### For Android APK
- [ ] Install APK on Android device
- [ ] Open app
- [ ] Click "Sign in with Google"
- [ ] Should see native Google account picker
- [ ] Should sign in successfully
- [ ] App should work without white screens

---

## 🔧 Common Issues & Solutions

### Issue: "This domain is not authorized"

**Solution:**
1. Check Firebase Console → Authorized domains
2. Make sure your exact domain is listed
3. Wait 5-10 minutes after adding for changes to propagate
4. Clear browser cache and try again

### Issue: "Popup blocked"

**Solution:**
1. Click the blocked popup icon in browser address bar
2. Select "Always allow popups from this site"
3. Refresh and try again

### Issue: Works on localhost but not on deployed site

**Solutions:**
1. Verify the deployed URL is in Firebase authorized domains
2. Check Google Cloud Console OAuth settings
3. Make sure you're using `https://` for deployed sites
4. Check browser console for CORS errors
5. Try in incognito/private window

### Issue: APK shows white screen after sign-in

**Solutions:**
1. Make sure you ran `npx cap sync android` after building
2. Verify `google-services.json` is in `android/app/` folder
3. Check that native Google Auth plugin is properly installed
4. Rebuild APK after any configuration changes
5. Clear app data on device: Settings → Apps → Money Manager → Clear Data

### Issue: "auth/unauthorized-domain" error

**Solution:**
```
This error occurs when your domain is not in the authorized domains list.
Go to Firebase Console → Authentication → Settings → Authorized domains
Add your domain and wait a few minutes for propagation.
```

---

## 📱 Testing Workflow

### Test Locally First
```powershell
npm run dev
# Open http://localhost:5173
# Test sign-in
```

### Test Firebase Hosting
```powershell
npm run build
firebase deploy --only hosting
# Open https://moneymanagementapp-cfc44.web.app
# Test sign-in
```

### Test Netlify
```powershell
npm run build
netlify deploy --prod
# Open your Netlify URL
# Test sign-in
```

### Test Android APK
```powershell
npm run build
npx cap sync android
cd android && .\gradlew assembleDebug && cd ..
adb install android/app/build/outputs/apk/debug/app-debug.apk
# Open app on device
# Test sign-in
```

---

## 🎯 Quick Deploy Commands

### Deploy Everything

```powershell
# 1. Build web app
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# 3. Deploy to Netlify
netlify deploy --prod --dir=dist

# 4. Sync and build Android
npx cap sync android
cd android
.\gradlew assembleDebug
cd ..

# Done! Test all platforms
```

---

## 📞 Still Having Issues?

If you're still seeing the "missing initial state" error after following all steps:

1. **Open Browser Console (F12)**
   - Go to Console tab
   - Copy all red errors
   - Check if sessionStorage is accessible: `console.log(sessionStorage)`

2. **Test sessionStorage Access**
   ```javascript
   // Run in browser console:
   try {
     sessionStorage.setItem('test', 'value');
     console.log('sessionStorage works:', sessionStorage.getItem('test'));
     sessionStorage.removeItem('test');
   } catch (e) {
     console.error('sessionStorage blocked:', e);
   }
   ```

3. **Browser-Specific Fixes**
   - **Chrome:** Settings → Privacy → Third-party cookies → Allow
   - **Firefox:** Settings → Privacy → Custom → Uncheck "Block cookies"
   - **Safari:** Preferences → Privacy → Uncheck "Prevent cross-site tracking"

4. **Check Network Tab**
   - F12 → Network tab
   - Try signing in
   - Look for failed requests (red)
   - Check request/response details

5. **Verify Firebase Configuration**
   - Check [src/firebase.js](src/firebase.js) has correct config
   - Verify API key matches Firebase Console
   - Confirm authDomain is correct

---

## ✨ Success Criteria

Your app should work when:
- ✅ Local dev server (`localhost:5173`)
- ✅ Firebase Hosting (`.firebaseapp.com` and `.web.app`)
- ✅ Netlify (`.netlify.app`)
- ✅ Android APK (native app)

All platforms should:
- ✅ Show Google sign-in button
- ✅ Open popup/native picker on click
- ✅ Successfully authenticate without white screens
- ✅ Load dashboard after sign-in
- ✅ Maintain session on refresh
