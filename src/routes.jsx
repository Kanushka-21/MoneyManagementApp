import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import TransactionList from './components/TransactionList.jsx';
import ConfirmExpense from './components/ConfirmExpense.jsx';
import ExpenseForm from './components/ExpenseForm.jsx';
import Profile from './components/Profile.jsx';
import LiabilityForm from './components/LiabilityForm.jsx';
import LiabilityList from './components/LiabilityList.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/login' element={<Login />} />
      <Route path='/transactions' element={<TransactionList />} />
      <Route path='/add' element={<ExpenseForm />} />
      <Route path='/confirm' element={<ConfirmExpense />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/liabilities' element={<LiabilityList />} />
      <Route path='/add-liability' element={<LiabilityForm />} />
    </Routes>
  );
}
