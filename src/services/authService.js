import { useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

let GoogleAuth;
let isGoogleAuthAvailable = false;

// Initialize GoogleAuth for Capacitor (only if available)
if (Capacitor.isNativePlatform()) {
  try {
    import('@codetrix-studio/capacitor-google-auth').then(module => {
      GoogleAuth = module.GoogleAuth;
      GoogleAuth.initialize({
        clientId: '698654609012-3rtpod17gvkv41c75rkngng24rdf17kv.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      isGoogleAuthAvailable = true;
      console.log('Native Google Auth initialized successfully');
    }).catch(err => {
      console.warn('Native Google Auth not available, falling back to web auth:', err);
    });
  } catch (err) {
    console.warn('Failed to load native Google Auth:', err);
  }
}

export async function signInGoogle() {
  try {
    if (Capacitor.isNativePlatform() && isGoogleAuthAvailable && GoogleAuth) {
      try {
        console.log('Attempting native Google Sign-In...');
        // Use native Google Sign-In for mobile
        const googleUser = await GoogleAuth.signIn();
        
        // Create Firebase credential from Google token
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        
        // Sign in to Firebase with the credential
        await signInWithCredential(auth, credential);
        console.log('Native Google Sign-In successful');
        return;
      } catch (nativeError) {
        console.warn('Native auth failed, falling back to popup:', nativeError);
        // Fall through to popup method
      }
    }
    
    // Use popup for web or as fallback
    console.log('Using popup authentication...');
    await signInWithPopup(auth, googleProvider);
    console.log('Popup authentication successful');
  } catch (error) {
    console.error('Sign-in error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this app.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.message && error.message.includes('missing initial state')) {
      throw new Error('Authentication error. Please clear your app data and try again.');
    }
    
    throw error;
  }
}

export async function logout() { await signOut(auth); }

async function ensureUserDoc(user) {
  if (!user) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      role: 'user',
      createdAt: serverTimestamp()
    });
  }
}

export function useAuthInit() {
  const [, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await ensureUserDoc(u);
    });
    return () => unsub();
  }, []);
}

export function useCurrentUser() {
  const [user, setUser] = useState(auth.currentUser);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  return user;
}
