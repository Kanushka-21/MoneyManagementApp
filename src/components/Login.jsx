import React, { useState } from 'react';
import { signInGoogle } from '../services/authService.js';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signInGoogle();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:'2rem', maxWidth: '400px', margin: '0 auto'}}>
      <h2>Login</h2>
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Sign-in Error:</div>
          <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
        </div>
      )}
      <button 
        onClick={handleSignIn}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          background: loading ? '#ccc' : '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%'
        }}
      >
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '0.85rem',
        lineHeight: '1.6'
      }}>
        <strong>Troubleshooting Tips:</strong>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Make sure popups are enabled in your browser</li>
          <li>Try using Chrome or Firefox if you're having issues</li>
          <li>Clear your browser cache and cookies</li>
          <li>If using mobile app, make sure you have Google Play Services installed</li>
        </ul>
      </div>
    </div>
  );
}
