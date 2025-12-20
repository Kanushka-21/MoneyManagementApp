import { useEffect, useState } from 'react';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithCredential, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export async function signInGoogle() {
  // For mobile, use Browser plugin with custom redirect
  if (Capacitor.isNativePlatform()) {
    try {
      // For now, fall back to web-based auth in app browser
      const { signInWithPopup } = await import('firebase/auth');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Mobile sign-in error:', error);
      throw error;
    }
  } else {
    // Use popup for web
    const { signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, googleProvider);
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
