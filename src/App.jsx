import React from 'react';
import Navbar from './components/Navbar.jsx';
import MicButton from './components/MicButton.jsx';
import AppRoutes from './routes.jsx';
import { useAuthInit } from './services/authService.js';

export default function App() {
  useAuthInit();
  return (
    <>
      <Navbar />
      <AppRoutes />
      <MicButton />
    </>
  );
}
