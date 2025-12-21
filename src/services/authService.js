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
    // Check if running on native platform
    if (Capacitor.isNativePlatform() && isGoogleAuthAvailable && GoogleAuth) {
      try {
        console.log('Attempting native Google Sign-In...');
        // Use native Google Sign-In for mobile
        const googleUser = await GoogleAuth.signIn();
        
        // Create Firebase credential from Google token
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        
        // Sign in to Firebase with the credential
        const result = await signInWithCredential(auth, credential);
        console.log('Native Google Sign-In successful');
        return result;
      } catch (nativeError) {
        console.warn('Native auth failed, falling back to popup:', nativeError);
        // Fall through to popup method
      }
    }
    
    // For web platform, always use popup (NOT redirect)
    console.log('Using popup authentication...');
    console.log('Auth domain:', auth.config.authDomain);
    console.log('Current user before sign-in:', auth.currentUser);
    
    // Use popup with the properly configured provider
    // Note: This MUST open in a popup window, not a redirect
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Popup authentication successful', result);
    return result;
    
  } catch (error) {
    console.error('Sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site and try again.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Only one popup request is allowed at a time. Please try again.');
      throw new Error('Only one popup request is allowed at a time. Please try again.');
    } else if (error.message && error.message.includes('missing initial state')) {
      throw new Error('Authentication state error. This usually happens when using third-party cookies blocking. Please:\n1. Enable third-party cookies in your browser\n2. Try in a different browser\n3. Clear browser cache and cookies\n4. Make sure you\'re accessing the app from the correct domain');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for OAuth operations. Please add your domain to Firebase Console.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console.');
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
