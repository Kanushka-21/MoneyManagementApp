import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser, logout } from '../services/authService.js';

export default function Navbar() {
  const user = useCurrentUser();
  return (
    <nav style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.75rem 1rem',background:'#1e293b',color:'#fff'}}>
      <strong>Voice Money Manager</strong>
      <Link to='/' style={{color:'#fff'}}>Dashboard</Link>
      <Link to='/add' style={{color:'#fff'}}>Add</Link>
      <Link to='/transactions' style={{color:'#fff'}}>Transactions</Link>
      <span style={{marginLeft:'auto'}}>
        {user ? (
          <>
            <span style={{marginRight:'0.5rem'}}>{user.displayName}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : <Link to='/login' style={{color:'#fff'}}>Login</Link>}
      </span>
    </nav>
  );
}
