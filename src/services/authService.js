import { auth, googleProvider } from '../config/firebase.js';
import { signOut, signInWithPopup } from 'firebase/auth';

/**
 * Sign in with Google using popup method
 * @returns {Promise<Object>} Firebase auth result
 */
export async function signInGoogle() {
  try {
    // Use popup for web platform
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    
    // Handle specific error cases
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Only one popup request is allowed at a time. Please try again.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for OAuth operations.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled in Firebase Console.');
    }
    
    throw error;
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function logout() {
  await signOut(auth);
}
