# Money Management App

**A modern web-based personal finance management application**

Track your expenses, manage future payments, and gain insights into your spending patterns with an intuitive dashboard powered by React, Firebase, and Netlify.

## ✨ Key Features

- 👤 **Secure Authentication**: Google Sign-in powered by Firebase
- 📊 **Smart Dashboard**: Visual analytics with pie and bar charts
- 💰 **Expense Tracking**: Categorize, edit, and delete transactions
- 📅 **Future Payments**: Track and manage upcoming liabilities
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile browsers
- 🔄 **Real-time Sync**: Changes sync instantly across all devices
- 🗂️ **Receipt Storage**: Upload and store receipt images
- 🎤 **Voice Input**: Add transactions via voice (optional feature)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (Required)
Update your Firebase credentials in `src/config/firebase.js`

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

## 📚 Documentation

- **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Complete setup and configuration guide
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow and best practices

## 🏗️ Project Structure

```
src/
├── api/              # Centralized API client for all operations
├── components/       # React page components
├── config/          # Firebase and app configuration
├── constants/       # App constants (categories, etc.)
├── hooks/           # Custom React hooks
├── services/        # Business logic services
├── utils/           # Utility functions
└── App.jsx          # Root component
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Firebase (Auth, Firestore, Storage) |
| UI | Material-UI (MUI), Chart.js |
| Hosting | Netlify |
| Styling | Emotion (CSS-in-JS) |

## 📊 Database Overview

Three main collections in Firestore:

- **transactions**: User expenses and income
- **liabilities**: Future payments and commitments
- **users**: User profile information
- **userSettings**: Custom categories and preferences

## 🔐 Security

- ✅ Google OAuth 2.0 authentication
- ✅ User-based Firestore security rules
- ✅ Per-user file uploads in Storage
- ✅ HTTPS everywhere
- ✅ Content Security Policy headers

## 📝 API Usage

All operations go through a single, clean API:

```javascript
import API from './api/client.js';

// Authentication
await API.auth.signInGoogle();
await API.auth.logout();

// Transactions
await API.transactions.save(transaction);
const transactions = await API.transactions.list();
await API.transactions.delete(id);

// And more...
```

## 🐛 Troubleshooting

### Login Not Working?
- Ensure your domain is authorized in Firebase Console
- Enable third-party cookies in your browser
- Clear cache and restart browser

### Database Errors?
- Verify user is authenticated
- Check Firestore security rules in Firebase Console
- Ensure you have proper permissions

### Deployment Issues?
- Run `npm run build` locally to verify build succeeds
- Check Netlify build logs
- Verify Firebase rules are deployed

For more detailed help, see [PROJECT_SETUP.md](./PROJECT_SETUP.md)

## 📋 Requirements

- Node.js 16+
- Modern web browser with JavaScript enabled
- Active Firebase project
- Netlify account (for hosting)

## 🔄 Deployment Pipeline

```
Local Development → npm run build → Dist Folder → Netlify Deploy
```

## 📞 Support

Check these resources in order:

1. [PROJECT_SETUP.md](./PROJECT_SETUP.md) - Setup and configuration
2. [DEVELOPMENT.md](./DEVELOPMENT.md) - Development patterns
3. Firebase Console - Authentication and database logs
4. Browser DevTools - Network and Console tabs

## 📄 License

MIT

## 🎯 Version

**v1.0.0** - Web-only version (April 2024)

---

**Ready to get started?** Run `npm install && npm run dev` to begin!
