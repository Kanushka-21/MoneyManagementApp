// Firebase client initialization - REPLACE WITH YOUR ACTUAL CONFIG
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDU2epDZL_pduvxDdsLumGRjhaeTlMZFpc",
  authDomain: "moneymanagementapp-cfc44.firebaseapp.com",
  projectId: "moneymanagementapp-cfc44",
  storageBucket: "moneymanagementapp-cfc44.firebasestorage.app",
  messagingSenderId: "698654609012",
  appId: "1:698654609012:web:ab672168093971af1e4b21",
  measurementId: "G-0EZB76PLZE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Provider with proper settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // This helps avoid the "missing initial state" error
  access_type: 'offline'
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
