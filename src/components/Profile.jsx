import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../services/authService.js';

export default function Profile() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  if (!user) return <div style={{padding:'1rem'}}>Not logged in.</div>;
  return (
    <div style={{padding:'1rem',maxWidth:500,margin:'0 auto'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Profile</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            background: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
      <p><strong>Name:</strong> {user.displayName}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}
