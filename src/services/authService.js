import { useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Initialize GoogleAuth for Capacitor
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '698654609012-3rtpod17gvkv41c75rkngng24rdf17kv.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
}

export async function signInGoogle() {
  try {
    if (Capacitor.isNativePlatform()) {
      // Use native Google Sign-In for mobile
      const googleUser = await GoogleAuth.signIn();
      
      // Create Firebase credential from Google token
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      
      // Sign in to Firebase with the credential
      await signInWithCredential(auth, credential);
    } else {
      // Use popup for web
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this app.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
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
