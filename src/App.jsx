import React from 'react';
import Dashboard from './components/Dashboard.jsx';
import { useAuthInit } from './services/authService.js';

export default function App() {
  useAuthInit();
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Dashboard />
    </div>
  );
}
