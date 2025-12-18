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
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('month');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });

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
        showToast('Error loading transactions: ' + error.message, 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  }

  function showConfirm(message, onConfirm) {
    setConfirmDialog({ show: true, message, onConfirm });
  }

  function handleConfirmClose(confirmed) {
    if (confirmed && confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog({ show: false, message: '', onConfirm: null });
  }

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
      showToast('Login failed: ' + error.message, 'error');
      setLoading(false);
    }
  }

  async function handleLogout() {
    showConfirm('Are you sure you want to logout?', async () => {
      try {
        await signOut(auth);
      } catch (error) {
        showToast('Logout failed: ' + error.message, 'error');
      }
    });
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showToast('Please enter a category name', 'error');
      return;
    }
    if (categories.includes(trimmed)) {
      showToast('Category already exists', 'error');
      return;
    }
    const updatedCategories = [...categories, trimmed];
    setCategories(updatedCategories);
    await saveUserCategories(user.uid, updatedCategories);
    setCategory(trimmed);
    setNewCategoryName('');
    setShowAddCategory(false);
    showToast('Category added successfully!', 'success');
  }

  async function handleRemoveCategory(categoryToRemove) {
    if (categories.length <= 1) {
      showToast('You must have at least one category!', 'error');
      return;
    }
    
    showConfirm(`Remove category "${categoryToRemove}"?`, async () => {
      const updatedCategories = categories.filter(cat => cat !== categoryToRemove);
      setCategories(updatedCategories);
      await saveUserCategories(user.uid, updatedCategories);
      
      // If current selected category is being removed, clear it
      if (category === categoryToRemove) {
        setCategory('');
      }
      showToast('Category removed successfully!', 'success');
    });
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }
    
    try {
      console.log('Adding expense...', { amount, category, note, date });
      
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(amount),
        category,
        note,
        date: date,
        currency: 'LKR',
        createdAt: serverTimestamp()
      });
      
      console.log('Expense added successfully!');
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      showToast('Expense added successfully! 💰', 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Error adding expense: ' + error.message, 'error');
    }
  }

  async function handleDelete(id) {
    showConfirm('Delete this expense?', async () => {
      try {
        await deleteDoc(doc(db, 'transactions', id));
        showToast('Expense deleted successfully!', 'success');
      } catch (error) {
        showToast('Error deleting: ' + error.message, 'error');
      }
    });
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
  
  // Calculate today's expenses
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = transactions
    .filter(tx => tx.date === today)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
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
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#28a745' : '#dc3545',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontSize: '15px',
          fontWeight: '500',
          maxWidth: '90%',
          textAlign: 'center',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#4CAF50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            💰
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Money Manager</h1>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
              {user.displayName || user.email}
            </p>
          </div>
          
          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '5px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                  setShowProfileMenu(false);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#dc3545',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <span>🚪</span>
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
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
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '3px' }}>
            Today
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            LKR {todayTotal.toFixed(2)}
          </div>
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

          <div style={{ marginBottom: '12px' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
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
            />
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

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>⚙️ Manage Categories</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '5px 10px',
                  fontSize: '18px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Your custom categories:
              </p>
              {categories.map(cat => (
                <div
                  key={cat}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    marginBottom: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6'
                  }}
                >
                  <span style={{ fontSize: '15px', color: '#333' }}>{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory(e);
                  }
                }}
              />
            </div>

            <button
              onClick={handleAddCategory}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ➕ Add Category
            </button>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                backgroundColor: '#f8f9fa',
                color: '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '20px',
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              ⚠️
            </div>
            <div style={{
              fontSize: '16px',
              color: '#333',
              marginBottom: '25px',
              textAlign: 'center',
              lineHeight: '1.5'
            }}>
              {confirmDialog.message}
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleConfirmClose(false)}
                style={{
                  padding: '10px 24px',
                  fontSize: '15px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  minWidth: '100px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmClose(true)}
                style={{
                  padding: '10px 24px',
                  fontSize: '15px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  minWidth: '100px'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
