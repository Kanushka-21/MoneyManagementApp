# Quick Deployment Guide

## 🚀 Deploy to Netlify in 3 Steps

### Step 1: Link Your Repository
```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project to Netlify
netlify link
```

### Step 2: Test Build Locally
```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

### Step 3: Deploy
```bash
# Deploy to production
netlify deploy --prod --dir=dist
```

Your app is now live! 🎉

## 📋 Before Deployment Checklist

- [ ] **Firebase Configured**
  - [ ] Update `src/config/firebase.js` with your credentials
  - [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
  - [ ] Deploy Storage rules: `firebase deploy --only storage`
  - [ ] Add your domain to Firebase Auth authorized domains

- [ ] **Environment Variables** (if using)
  - [ ] Create Netlify environment variables for sensitive data
  - [ ] Update references in code if needed

- [ ] **Testing**
  - [ ] Test login functionality
  - [ ] Add a test transaction
  - [ ] Verify data saves to Firestore
  - [ ] Test receipt upload to Storage

- [ ] **Performance**
  - [ ] Run Lighthouse audit
  - [ ] Check bundle size
  - [ ] Test on mobile device

## 🔑 Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create new project
3. Enable Authentication (Google sign-in)
4. Enable Firestore Database
5. Enable Cloud Storage

### 2. Configure Authentication
1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized redirect URIs:
   - `https://yourdomain.com`
   - `https://yourdomain.netlify.app`

### 3. Set Security Rules

**Firestore Rules** (`firestore.rules`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /{document=**} {
      allow read, write: if request.auth.uid == resource.data.uid || 
                            request.auth.uid == document["uid"];
    }
    
    // Allow creating user docs
    match /users/{uid} {
      allow create: if request.auth.uid == uid;
      allow read, update: if request.auth.uid == uid;
    }
  }
}
```

**Storage Rules** (`storage.rules`)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### 4. Deploy Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules,storage
```

## 🌐 Set Up Custom Domain (Optional)

### With Netlify
1. Go to Site Settings > Domain management
2. Add custom domain
3. Update DNS records per Netlify instructions
4. SSL certificate auto-provisioned

### With Firebase Hosting (Alternative)
```bash
firebase init hosting
firebase deploy --only hosting
```

## 📧 Enable Email Notifications

Set up Firebase email notifications:
1. Firebase Console > Project Settings
2. Service Account tab
3. Create new service account key
4. Store securely and use in Cloud Functions

## 🔒 Security Checklist

- [ ] Firestore rules restrict to authenticated users only
- [ ] Storage rules restrict to user's own files
- [ ] Firebase domain authorization includes your domain
- [ ] Environment variables don't contain secrets in code
- [ ] CSP headers configured in Netlify
- [ ] HTTPS enforced (automatic with Netlify)

## 📊 Monitor Your App

### Netlify
- Analytics dashboard: https://app.netlify.com/sites/[your-site]
- Build logs
- Function logs

### Firebase
- Firestore usage and quotas
- Authentication logs
- Storage usage
- Real-time database monitoring

## 🆘 Common Deployment Issues

### "Domain not authorized"
→ Add domain to Firebase Console > Authentication > Settings

### "CORS errors"
→ Check Netlify security headers in `netlify.toml`

### "Firestore permission denied"
→ Check security rules and user authentication status

### "Large build size warning"
→ Normal for now; implement code-splitting later

### "Build fails on Netlify but works locally"
→ Check Node version in Netlify settings matches local version

## 📞 Debug Mode

### Enable Debug Logging
```javascript
// In src/config/firebase.js, add:
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

### Check Browser Console
- Tab: Console
- Tab: Network (to see API calls)
- Tab: Application > Cookies/Storage

### Check Netlify Logs
```bash
# View build logs
netlify deploy

# View function logs
netlify functions:invoke
```

## 🎯 Performance Goals

- First Contentful Paint: < 3s
- Lighthouse Score: > 80
- Bundle Size: < 500KB (gzipped)

## 📈 Monitoring & Analytics

### Google Analytics (Optional)
Add to `src/App.jsx`:
```javascript
import { analytics } from './config/firebase.js';
// Analytics automatically tracks page views
```

### Error Tracking
Monitor errors in Firebase Console and browser console

## 🔄 Continuous Deployment

### GitHub Integration
1. Push code to GitHub
2. Connect Netlify to GitHub
3. Auto-deploy on every push
4. Preview branches automatically

### Git Commands
```bash
git add .
git commit -m "Deploy Money Management App"
git push origin main
```

## 📞 Deployment Support

- **Netlify Docs**: https://docs.netlify.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Vite Docs**: https://vitejs.dev

---

**Need help?** Check the [PROJECT_SETUP.md](./PROJECT_SETUP.md) for detailed setup instructions.

Good luck with your deployment! 🚀
