# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Code Organization

### API Client Pattern

All communication with backend services goes through the centralized API client:

```javascript
// src/api/client.js
import API from './api/client.js';

// Use it in components like:
const result = await API.auth.signInGoogle();
const transactions = await API.transactions.list();
```

This provides a single, clean interface for all operations.

### Service Layer

Each service handles one domain:

- `authService.js` - User authentication
- `firestoreService.js` - Database operations
- `storageService.js` - File uploads/downloads

### Hooks

Custom React hooks encapsulate state logic:

- `useAuth.js` - Authentication state and initialization

## Adding New Features

### 1. Add Service Function

```javascript
// src/services/newService.js
export async function newOperation(data) {
  // Implementation
}
```

### 2. Add to API Client

```javascript
// src/api/client.js
import { newOperation } from '../services/newService.js';

const API = {
  // ... existing code
  newDomain: {
    operation: newOperation,
  }
};
```

### 3. Use in Components

```javascript
import API from './api/client.js';

const result = await API.newDomain.operation(data);
```

## Common Tasks

### Add a New Page Component

1. Create component in `src/components/NewPage.jsx`
2. Import necessary APIs: `import API from './api/client.js'`
3. Add route in `src/routes.jsx`
4. Add navigation link in `src/components/Navbar.jsx`

### Add Custom Expense Category

Categories are stored per-user in Firestore under `userSettings`.

```javascript
const updatedCategories = [...categories, 'NewCategory'];
await saveUserCategories(user.uid, updatedCategories);
```

### Handle Authentication Flow

```javascript
import { useCurrentUser } from './hooks/useAuth.js';

function MyComponent() {
  const user = useCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // User is authenticated
}
```

## Component Patterns

### Protected Component

```javascript
import { useCurrentUser } from '../hooks/useAuth.js';
import { Navigate } from 'react-router-dom';

export default function ProtectedComponent() {
  const user = useCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <div>Content for authenticated users</div>;
}
```

### Data Loading

```javascript
import { useEffect, useState } from 'react';
import API from '../api/client.js';

export default function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function load() {
      try {
        const result = await API.domain.operation();
        setData(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

## Performance Optimization

1. **Code Splitting**: Vite automatically splits vendor/framework code
2. **Image Optimization**: Use appropriate image formats
3. **Lazy Loading**: Use React.lazy for route components
4. **Memoization**: Use useMemo/useCallback for expensive operations

## Debugging

### Browser DevTools

1. React DevTools extension - Inspect component tree
2. Network tab - Monitor Firebase API calls
3. Console - View logs and errors
4. Application tab - Check local storage/cookies

### Firebase Console

1. Monitor real-time database operations
2. Check security rules violations
3. Review authentication logs
4. Monitor storage usage

## Testing in Development

### Test Authentication Flow

```javascript
// In console
import { signInGoogle } from './src/services/authService.js';
await signInGoogle();
```

### Test Database Operations

```javascript
// Check user doc exists
import { db } from './src/config/firebase.js';
import { getDoc, doc } from 'firebase/firestore';
const user = getDoc(doc(db, 'users', 'uid'));
```

## Deployment Checklist

- [ ] Update version in package.json
- [ ] Test build locally: `npm run build`
- [ ] Test preview: `npm run preview`
- [ ] Update Firebase rules if changed
- [ ] Deploy to Netlify: `netlify deploy --prod`
- [ ] Verify live site works
- [ ] Test authentication on live site

## Environment Configuration

For Netlify, set environment variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
```

These can be managed in Netlify Site Settings > Build & Deploy > Environment.

## Troubleshooting Development

### Port Already in Use

```bash
# Change dev server port
npm run dev -- --port 3001
```

### Module Not Found

1. Check import path is correct
2. Ensure file extensions are included
3. Clear node_modules: `rm -rf node_modules && npm install`

### Firebase Connection Issues

1. Verify internet connection
2. Check Firebase project is active
3. Verify credentials in `src/config/firebase.js`
4. Check browser console for specific errors

---

For more information, see [PROJECT_SETUP.md](./PROJECT_SETUP.md)
