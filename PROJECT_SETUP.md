# Money Management App - Web Version

A modern, web-based personal finance management application built with React, Vite, and Firebase. Track expenses, manage future payments, and analyze spending patterns with an intuitive dashboard.

## 🚀 Features

- **User Authentication**: Secure Google Sign-in via Firebase
- **Transaction Management**: Add, edit, delete expenses and income
- **Dashboard Analytics**: Visualize spending patterns with charts
- **Liability Management**: Track future payments and commitments
- **Receipt Upload**: Store receipt images in Firebase Storage
- **Voice Input**: (Optional) Add transactions via voice input
- **Responsive Design**: Works seamlessly on desktop and mobile browsers
- **Real-time Sync**: Live updates across devices using Firestore

## 📁 Project Structure

```
src/
├── api/                   # Centralized API client
│   └── client.js         # Single endpoint for all operations
├── components/           # React components
│   ├── Dashboard.jsx     # Main dashboard page
│   ├── Login.jsx         # Authentication page
│   ├── TransactionList.jsx
│   ├── ExpenseForm.jsx
│   ├── LiabilityList.jsx
│   ├── LiabilityForm.jsx
│   ├── Profile.jsx
│   ├── Navbar.jsx
│   ├── MicButton.jsx     # Voice input component
│   ├── ConfirmExpense.jsx
│   └── VoicePreview.jsx
├── config/              # Configuration files
│   └── firebase.js      # Firebase initialization
├── constants/           # App constants
│   └── categories.js    # Expense categories
├── hooks/               # Custom React hooks
│   └── useAuth.js       # Authentication hooks
├── services/            # Business logic services
│   ├── authService.js   # Auth operations
│   ├── firestoreService.js  # Firestore operations
│   └── storageService.js    # Storage operations
├── utils/               # Utility functions
│   ├── categories.js    # Category utilities
│   └── parseLocal.js    # Local parsing utilities
├── App.jsx              # Root component
├── index.jsx            # Entry point
├── routes.jsx           # Route definitions
└── index.css            # Global styles
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Firebase account and project

### 1. Clone and Install

```bash
cd MoneyManagementApp
npm install
```

### 2. Configure Firebase

Update `src/config/firebase.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 3. Configure Firestore Rules

Deploy Firestore security rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

### 4. Configure Storage Rules

Deploy Storage rules from `storage.rules`:

```bash
firebase deploy --only storage
```

## 🎯 Using the Centralized API

All operations go through a single API client (`src/api/client.js`):

```javascript
import API from './api/client.js';

// Authentication
await API.auth.signInGoogle();
await API.auth.logout();

// Transactions
await API.transactions.save(transaction);
const txs = await API.transactions.list({ month: '2024-01' });
await API.transactions.update(id, updates);
await API.transactions.delete(id);

// Liabilities
await API.liabilities.save(liability);
const liabilities = await API.liabilities.list();
await API.liabilities.update(id, updates);
await API.liabilities.delete(id);

// Predictions
const prediction = await API.predictions.get();

// Storage
const url = await API.storage.uploadReceipt(file);
await API.storage.deleteReceiptByUrl(url);
```

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output: `dist/` folder ready for deployment

### Preview Production Build

```bash
npm run preview
```

## 📦 Deployment

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

Or use Netlify's GitHub integration for automatic deploys.

### Deploy Firebase Functions

```bash
firebase deploy --only functions
```

### Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

## 📊 Database Schema

### Collections

#### transactions
```javascript
{
  uid: string,           // User ID
  amount: number,        // Transaction amount
  currency: string,      // Currency code (e.g., 'LKR')
  category: string,      // Category name
  merchant: string,      // Merchant/shop name
  date: string,          // ISO date string
  type: 'expense'|'income',
  note: string,          // Optional notes
  receiptUrl: string,    // Optional receipt image URL
  source: 'manual'|'voice'|'api',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### liabilities
```javascript
{
  uid: string,
  name: string,
  amount: number,
  dueDate: string,       // ISO date string
  description: string,
  status: 'pending'|'paid'|'overdue',
  createdAt: timestamp
}
```

#### users
```javascript
{
  displayName: string,
  email: string,
  role: 'user'|'admin',
  createdAt: timestamp
}
```

#### userSettings
```javascript
{
  categories: array,     // Custom expense categories
  preferences: object    // User preferences
}
```

## 🔒 Security

- **Firebase Authentication**: Google Sign-in only
- **Firestore Security Rules**: User-based access control
- **Storage Rules**: Private file uploads per user
- **CORS**: Properly configured for secure cross-origin requests

## 🐛 Troubleshooting

### Login Issues
- Ensure domain is added to Firebase Console > Authentication > Settings
- Clear browser cache and cookies
- Enable third-party cookies in browser

### Firestore Errors
- Check user is authenticated (`auth.currentUser` exists)
- Verify Firestore security rules in Firebase Console
- Check composite indexes if querying multiple fields

### Storage Issues
- Verify Firebase Storage bucket is created
- Check Storage security rules allow uploads
- Ensure sufficient storage quota

## 📝 Environment Variables

Create a `.env.local` file (optional for local development):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

Update `src/config/firebase.js` to use these if needed.

## 📚 Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Backend/Database**: Firebase (Auth, Firestore, Storage)
- **UI Components**: Material-UI (MUI)
- **Charts**: Chart.js with React wrapper
- **Styling**: CSS-in-JS (Emotion)
- **Hosting**: Netlify

## 📄 License

MIT

## 💬 Support

For issues or questions:
1. Check Firestore rules in Firebase Console
2. Review browser console for error messages
3. Check Firebase Functions logs for backend errors
4. Verify network requests in browser DevTools

---

**Last Updated**: April 2024
**Version**: 1.0.0
**Status**: Production Ready
