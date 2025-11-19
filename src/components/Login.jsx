import React from 'react';
import { signInGoogle } from '../services/authService.js';

export default function Login() {
  return (
    <div style={{padding:'2rem'}}>
      <h2>Login</h2>
      <button onClick={signInGoogle}>Sign in with Google</button>
    </div>
  );
}
