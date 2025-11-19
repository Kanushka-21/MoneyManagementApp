# Cloud Functions (Voice Money Manager)

Functions provided:
- parseText (HTTP POST): transcript → structured JSON
- predictExpenses (callable): aggregates monthly totals → 6 month forecast
- setAdminClaim (callable): admin-only utility to assign admin role

## Local Emulation
```powershell
firebase emulators:start --only functions,firestore,auth,storage
```

## Config
```powershell
firebase functions:config:set openai.key="YOUR_OPENAI_KEY"
```

## Deploy
```powershell
firebase deploy --only functions
```
