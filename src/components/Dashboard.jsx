import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { auth, googleProvider, db } from '../firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';

ChartJS.register(ArcElement, Tooltip, Legend);

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [period, setPeriod] = useState('month');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserCategories(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to real-time transaction updates
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(txs);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading transactions:', error);
        alert('Error loading transactions: ' + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  async function loadUserCategories(uid) {
    try {
      const docRef = doc(db, 'userSettings', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function saveUserCategories(uid, newCategories) {
    try {
      const docRef = doc(db, 'userSettings', uid);
      await setDoc(docRef, { categories: newCategories }, { merge: true });
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      alert('Please enter a category name');
      return;
    }
    if (categories.includes(trimmed)) {
      alert('Category already exists');
      return;
    }
    const updatedCategories = [...categories, trimmed];
    setCategories(updatedCategories);
    await saveUserCategories(user.uid, updatedCategories);
    setCategory(trimmed);
    setNewCategoryName('');
    setShowAddCategory(false);
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!category) {
      alert('Please select a category');
      return;
    }
    
    try {
      console.log('Adding expense...', { amount, category, note });
      
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(amount),
        category,
        note,
        date: new Date().toISOString().split('T')[0],
        currency: 'LKR',
        createdAt: serverTimestamp()
      });
      
      console.log('Expense added successfully!');
      setAmount('');
      setNote('');
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + error.message + '\n\nMake sure Firestore is enabled in Firebase Console!');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  // Filter transactions by period
  const now = new Date();
  const filteredTxs = transactions.filter(tx => {
    if (!tx.date) return false;
    const txDate = new Date(tx.date);
    if (period === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else {
      return txDate.getFullYear() === now.getFullYear();
    }
  });

  // Calculate totals and percentages
  const total = filteredTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const byCategory = filteredTxs.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const categoryPercentages = Object.entries(byCategory).map(([cat, amt]) => ({
    category: cat,
    amount: amt,
    percentage: total > 0 ? ((amt / total) * 100).toFixed(1) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Pie chart data
  const pieColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'];
  const pieData = {
    labels: categoryPercentages.map(c => c.category),
    datasets: [{
      data: categoryPercentages.map(c => c.amount),
      backgroundColor: pieColors,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: LKR ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>💰 Money Manager</h1>
        <p style={{ marginBottom: '30px', color: '#666', textAlign: 'center' }}>
          Track your expenses across all devices
        </p>
        <button 
          onClick={handleLogin}
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span>Sign in with Google</span>
        </button>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
          Your data syncs across all devices in real-time
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>💰 Money Manager</h1>
          <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
            {user.displayName || user.email}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Total Display - BIG */}
      <div style={{
        backgroundColor: '#4CAF50',
        padding: '25px 20px',
        borderRadius: '15px',
        marginBottom: '15px',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#fff', opacity: 0.9, marginBottom: '5px' }}>
          Total Spent
        </div>
        <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#fff', letterSpacing: '-1px' }}>
          LKR {total.toFixed(2)}
        </div>
        <div style={{ marginTop: '10px' }}>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Pie Chart */}
      {categoryPercentages.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
            Spending Breakdown
          </h3>
          <div style={{ height: '250px' }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      )}

      {/* Add Expense Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '16px', color: '#333', marginBottom: '15px' }}>➕ Add Expense</h2>
        <form onSubmit={handleAddExpense}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (LKR)"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {!showAddCategory ? (
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                backgroundColor: '#f8f9fa',
                color: '#495057',
                border: '1px dashed #ced4da',
                borderRadius: '5px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              + Add New Category
            </button>
          ) : (
            <div style={{ marginBottom: '12px', display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  border: '2px solid #007bff',
                  borderRadius: '5px'
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 Save Expense
          </button>
        </form>
      </div>

      {/* Transaction List */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '16px', color: '#333', marginBottom: '15px' }}>
          📋 Transactions ({filteredTxs.length})
        </h2>
        
        {filteredTxs.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '30px 20px', fontSize: '14px' }}>
            No expenses yet. Add your first expense above! 👆
          </p>
        ) : (
          <div>
            {filteredTxs.map((tx) => (
              <div
                key={tx.id}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  padding: '12px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#222', 
                    marginBottom: '4px' 
                  }}>
                    {tx.category}
                  </div>
                  {tx.note && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {tx.note}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'flex-end', 
                  gap: '6px' 
                }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#e74c3c', 
                    whiteSpace: 'nowrap' 
                  }}>
                    LKR {tx.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
