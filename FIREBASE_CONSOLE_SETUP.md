# 🔥 FIREBASE CONSOLE CONFIGURATION CHECKLIST

## ⚠️ DO THIS FIRST - Critical for All Platforms!

This configuration is **required** for the app to work on:
- ✅ localhost (development)
- ✅ Firebase Hosting
- ✅ Netlify
- ✅ Android APK

---

## Step 1: Add Authorized Domains (5 minutes)

### Where to Go:
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project: **moneymanagementapp-cfc44**
3. Click **Authentication** in left sidebar
4. Click **Settings** tab
5. Scroll to **Authorized domains** section

### What to Add:
Click **Add domain** for each of these:

```
localhost
127.0.0.1
moneymanagementapp-cfc44.firebaseapp.com
moneymanagementapp-cfc44.web.app
```

**If using Netlify:**
```
your-app-name.netlify.app
```
(Replace with your actual Netlify domain)

**If using custom domain:**
```
yourdomain.com
```

### Screenshot Reference:
It should look like this:
```
Authorized domains (6 domains)
  localhost
  127.0.0.1  
  moneymanagementapp-cfc44.firebaseapp.com
  moneymanagementapp-cfc44.web.app
  your-app-name.netlify.app
  yourdomain.com
```

---

## Step 2: Google Cloud Console OAuth Setup (10 minutes)

### Where to Go:
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Make sure project **moneymanagementapp-cfc44** is selected (top left)
3. Click hamburger menu (☰) → **APIs & Services** → **Credentials**

### Find Web Client:
Look for: **Web client (auto created by Google Service)**
- Should have ID: `698654609012-3rtpod17gvkv41c75rkngng24rdf17kv.apps.googleusercontent.com`
- Click the pencil icon (✏️) to edit

### Add Authorized JavaScript Origins:
Scroll to **Authorized JavaScript origins**
Click **+ ADD URI** for each:

```
http://localhost:5173
http://127.0.0.1:5173
https://moneymanagementapp-cfc44.firebaseapp.com
https://moneymanagementapp-cfc44.web.app
https://your-app-name.netlify.app (if using Netlify)
```

### Add Authorized Redirect URIs:
Scroll to **Authorized redirect URIs**  
Click **+ ADD URI** for each:

```
http://localhost:5173/__/auth/handler
http://localhost:5173
https://moneymanagementapp-cfc44.firebaseapp.com/__/auth/handler
https://moneymanagementapp-cfc44.web.app/__/auth/handler
https://your-app-name.netlify.app/__/auth/handler (if using Netlify)
```

### Save Changes:
Click **SAVE** at the bottom

---

## Step 3: OAuth Consent Screen (5 minutes)

### Where to Go:
Still in [Google Cloud Console](https://console.cloud.google.com)
1. Click hamburger menu (☰) → **APIs & Services** → **OAuth consent screen**

### Verify Settings:
- **User type:** External (or Internal if workspace)
- **App name:** Money Manager
- **User support email:** Your email
- **Developer contact email:** Your email

### Add Authorized Domains:
Scroll to **Authorized domains**
Click **+ ADD DOMAIN** for each:

```
firebaseapp.com
web.app
netlify.app (if using Netlify)
```

**Note:** Do NOT include `https://` or `www.`

### Save Changes:
Click **SAVE AND CONTINUE** at the bottom

---

## ✅ Verification Steps

### Test Each Platform:

#### 1. Test Localhost
```powershell
npm run dev
```
- Open http://localhost:5173
- Click "Sign in with Google"
- Should see popup (not redirect)
- Should sign in successfully

#### 2. Deploy & Test Firebase Hosting
```powershell
firebase deploy --only hosting
```
- Open https://moneymanagementapp-cfc44.web.app
- Click "Sign in with Google"
- Should work without errors

#### 3. Deploy & Test Netlify
```powershell
netlify deploy --prod --dir=dist
```
- Open your Netlify URL
- Click "Sign in with Google"
- Should work without errors

#### 4. Build & Test Android APK
```powershell
npx cap sync android
cd android
.\gradlew assembleDebug
cd ..
adb install android\app\build\outputs\apk\debug\app-debug.apk
```
- Open app on device
- Click "Sign in with Google"
- Should show native Google picker
- Should sign in successfully

---

## 🚨 Common Errors After Configuration

### Error: "This domain is not authorized"
**Fix:** 
- Wait 5-10 minutes after adding domains
- Clear browser cache
- Try incognito/private window

### Error: "Popup blocked"
**Fix:**
- Allow popups in browser settings
- Click the popup icon in address bar

### Error: "redirect_uri_mismatch"
**Fix:**
- Check the exact URI in the error message
- Add that exact URI to Google Cloud Console → Credentials → Redirect URIs
- Make sure to include `/__/auth/handler` at the end

---

## 📋 Quick Configuration Summary

| Platform | What to Configure |
|----------|------------------|
| Firebase Console | Authorized domains |
| Google Cloud Console | JavaScript origins + Redirect URIs |
| OAuth Consent Screen | Authorized domains |

**Time Required:** ~20 minutes
**Difficulty:** Easy (just copy-paste URLs)

---

## 🆘 Need Help?

If you see errors after configuration:

1. **Check browser console** (F12) for specific error messages
2. **Verify exact URLs** - must match exactly (including https://)
3. **Wait 10 minutes** - changes can take time to propagate
4. **Clear cache** - old auth state can cause issues
5. **Try incognito** - eliminates cache/cookie issues

---

## ✅ Configuration Complete Checklist

Before testing, make sure you've:

- [ ] Added all domains to Firebase Console → Authorized domains
- [ ] Added all JavaScript origins to Google Cloud Console
- [ ] Added all redirect URIs to Google Cloud Console
- [ ] Added authorized domains to OAuth consent screen
- [ ] Saved all changes
- [ ] Waited 5-10 minutes for propagation
- [ ] Rebuilt app: `npm run build`
- [ ] Synced Android: `npx cap sync android`
- [ ] Cleared browser cache

**All set?** Run tests for each platform! 🚀
