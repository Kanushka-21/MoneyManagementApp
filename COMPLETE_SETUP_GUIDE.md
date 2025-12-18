# 🚀 Complete Setup Guide - Money Manager App

## Your app now uses **Firebase (online database)** + **Netlify (auto-deployment)**!

---

## STEP 1: Set Up Firebase (Online Database)

### 1.1 Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it: `money-manager-app`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 1.2 Enable Google Authentication
1. In Firebase Console → **Authentication** → **Get Started**
2. Click **"Sign-in method"** tab
3. Enable **Google** provider
4. Click **Save**

### 1.3 Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in production mode"** (we'll add rules)
3. Choose a location (closest to you)
4. Click **Enable**

### 1.4 Set Firestore Security Rules
1. In Firestore Database → **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    
    // Users can read/write their own settings
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

### 1.5 Get Firebase Configuration
1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll to **"Your apps"** → Click the **Web** icon `</>`
3. Register app: Name it "money-manager-web"
4. Copy the `firebaseConfig` object

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 1.6 Update Your Code with Firebase Config
1. Open: `src/firebase.js`
2. **Replace the placeholder config** with YOUR config from above
3. Save the file

---

## STEP 2: Push Code to GitHub

### 2.1 Create GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `MoneyManagementApp`
3. Keep it **Public** (or Private - your choice)
4. **Do NOT** initialize with README
5. Click **"Create repository"**

### 2.2 Push Your Code
Run these commands in PowerShell (in your project folder):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/MoneyManagementApp.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username!

---

## STEP 3: Deploy to Netlify (Auto-Deploy)

### 3.1 Connect to Netlify
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Sign up with **GitHub** (easiest)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub**
5. Select your repository: `MoneyManagementApp`

### 3.2 Configure Build Settings
Netlify should auto-detect settings, but verify:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Click **"Deploy site"**

### 3.3 Get Your Live URL
- After 1-2 minutes, you'll get a URL like: `https://random-name-123.netlify.app`
- You can customize it: **Site settings** → **Change site name**

---

## ✅ YOU'RE DONE!

### What You Have Now:

✅ **Online Database** - All data stored in Firebase (not your device)  
✅ **Real-time Sync** - Updates appear instantly across all devices  
✅ **Google Login** - Secure authentication  
✅ **Auto-Deploy** - Every Git push updates your live website automatically  
✅ **100% FREE** - Firebase free tier + Netlify free tier  
✅ **Works on Any Device** - Phone, tablet, computer  

---

## 📱 How to Use

1. **Open the Netlify URL** on any device
2. **Sign in with Google**
3. **Add expenses** - they save to Firebase instantly
4. **Open on another device** - same data appears!
5. **Updates sync in real-time** across all devices

---

## 🔄 How to Update Your App

Whenever you make code changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

**Netlify automatically deploys** your changes in 1-2 minutes!

---

## 🔒 Security Features

- ✅ Only you can see your transactions (Firebase rules)
- ✅ Secure Google authentication
- ✅ Data encrypted in transit (HTTPS)
- ✅ Each user's data is completely isolated

---

## 📊 Firebase Free Tier Limits

- **50,000 reads/day** - ~1,600/hour
- **20,000 writes/day** - ~650/hour  
- **10 GB storage** - thousands of transactions
- **More than enough for personal use!**

---

## Need Help?

If something doesn't work:
1. Check Firebase config in `src/firebase.js`
2. Verify Firestore rules are published
3. Check browser console for errors (F12)
4. Make sure Google sign-in is enabled in Firebase

---

**Your Money Manager is now fully online and auto-deploying! 🎉**
