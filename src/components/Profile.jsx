import React from 'react';
import { useCurrentUser } from '../services/authService.js';

export default function Profile() {
  const user = useCurrentUser();
  if (!user) return <div style={{padding:'1rem'}}>Not logged in.</div>;
  return (
    <div style={{padding:'1rem'}}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.displayName}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
}
