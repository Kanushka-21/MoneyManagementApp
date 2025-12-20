import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
  getDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { listLiabilities } from '../services/firestoreService.js';
import LiabilityList from './LiabilityList.jsx';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels);

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('expense');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [liabilities, setLiabilities] = useState([]);
  const [showTransactionPopup, setShowTransactionPopup] = useState(null);
  const [showPeriodPopup, setShowPeriodPopup] = useState(false);
  const [showLiabilitiesModal, setShowLiabilitiesModal] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadUserCategories(currentUser.uid);
      }
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
      },
      (error) => {
        console.error('Error loading transactions:', error);
        showToast('Error loading transactions: ' + error.message, 'error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load liabilities
  useEffect(() => {
    if (!user) {
      setLiabilities([]);
      return;
    }

    async function loadLiabilitiesData() {
      try {
        const data = await listLiabilities();
        setLiabilities(data);
      } catch (error) {
        console.error('Error loading liabilities:', error);
      }
    }

    loadLiabilitiesData();
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
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed: ' + error.message, 'error');
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

  async function handleEditCategory(oldName, newName) {
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Please enter a category name', 'error');
      return;
    }
    if (oldName === trimmed) {
      setEditingCategory(null);
      setEditCategoryName('');
      return;
    }
    if (categories.includes(trimmed)) {
      showToast('Category already exists', 'error');
      return;
    }
    
    try {
      // Update category list
      const updatedCategories = categories.map(cat => cat === oldName ? trimmed : cat);
      setCategories(updatedCategories);
      await saveUserCategories(user.uid, updatedCategories);
      
      // Update all transactions with old category name
      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', user.uid),
        where('category', '==', oldName)
      );
      
      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(docSnapshot => 
        updateDoc(doc(db, 'transactions', docSnapshot.id), {
          category: trimmed
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update current selected category if it was edited
      if (category === oldName) {
        setCategory(trimmed);
      }
      
      setEditingCategory(null);
      setEditCategoryName('');
      showToast(`Category updated! ${snapshot.docs.length} transaction(s) updated.`, 'success');
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('Error updating category: ' + error.message, 'error');
    }
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
      console.log('Adding transaction...', { amount, category, note, date, type });
      
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(amount),
        category,
        note,
        date: date,
        type: type,
        currency: 'LKR',
        createdAt: serverTimestamp()
      });
      
      console.log('Transaction added successfully!');
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully! 💰`, 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Error adding expense: ' + error.message, 'error');
    }
  }

  async function handleDelete(id) {
    showConfirm('Delete this transaction?', async () => {
      try {
        await deleteDoc(doc(db, 'transactions', id));
        showToast('Transaction deleted successfully!', 'success');
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
    
    if (period === 'custom') {
      if (!startDate || !endDate) return false;
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return txDate >= start && txDate <= end;
    } else if (period === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    } else {
      return txDate.getFullYear() === now.getFullYear();
    }
  });

  // Calculate totals and percentages
  const expenses = filteredTxs.filter(tx => tx.type !== 'income');
  const incomes = filteredTxs.filter(tx => tx.type === 'income');
  
  const totalExpenses = expenses.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalIncome = incomes.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const balance = totalIncome - totalExpenses;
  
  // Calculate today's transactions
  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = transactions
    .filter(tx => tx.date === today && tx.type !== 'income')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const todayIncome = transactions
    .filter(tx => tx.date === today && tx.type === 'income')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Calculate category-wise income
  const byCategoryIncome = incomes.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  // Combine all categories from both income and expenses
  const allCategoriesSet = new Set([...Object.keys(byCategory), ...Object.keys(byCategoryIncome)]);
  const categoryBreakdown = Array.from(allCategoriesSet).map(cat => ({
    category: cat,
    income: byCategoryIncome[cat] || 0,
    expense: byCategory[cat] || 0
  })).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));

  const categoryPercentages = Object.entries(byCategory).map(([cat, amt]) => ({
    category: cat,
    amount: amt,
    percentage: totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Daily breakdown
  const dailyBreakdown = filteredTxs.reduce((acc, tx) => {
    const date = tx.date;
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0, transactions: [] };
    }
    if (tx.type === 'income') {
      acc[date].income += tx.amount;
    } else {
      acc[date].expense += tx.amount;
    }
    acc[date].transactions.push(tx);
    return acc;
  }, {});

  const dailyBreakdownArray = Object.values(dailyBreakdown)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
      datalabels: {
        display: false
      },
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
            const percentage = ((value / totalExpenses) * 100).toFixed(1);
            return `${label}: LKR ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          💰
        </div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#333', fontWeight: '600' }}>Money Manager</h1>
        <p style={{ marginBottom: '30px', color: '#666', textAlign: 'center', fontSize: '14px' }}>
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
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
          Balance
        </div>
        <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#fff', letterSpacing: '-1px' }}>
          LKR {balance.toFixed(2)}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <div 
            onClick={() => setShowTransactionPopup('income')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '3px' }}>
              Income 👆
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
              +{totalIncome.toFixed(2)}
            </div>
          </div>
          <div 
            onClick={() => setShowTransactionPopup('expense')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ fontSize: '11px', color: '#fff', opacity: 0.8, marginBottom: '3px' }}>
              Expenses 👆
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
              -{totalExpenses.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '14px', color: '#fff', opacity: 0.9, marginBottom: '3px', fontWeight: '500' }}>
            Today: Income +{todayIncome.toFixed(2)} | Expenses -{todayExpenses.toFixed(2)}
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setShowPeriodPopup(true)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#2c3e50',
              cursor: 'pointer',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
          >
            {period === 'month' && 'This Month'}
            {period === 'year' && 'This Year'}
            {period === 'custom' && 'Custom Range'} 📅
          </button>

          {/* Date Range Display */}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '11px', 
            color: '#fff', 
            opacity: 0.9,
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {period === 'month' && (
              <span>
                {new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA')} - {new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA')}
              </span>
            )}
            {period === 'year' && (
              <span>
                {now.getFullYear()}.01.01 - {now.getFullYear()}.12.31
              </span>
            )}
            {period === 'custom' && startDate && endDate && (
              <span>
                {startDate} - {endDate}
              </span>
            )}
          </div>
          
          {period === 'custom' && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', color: '#fff', opacity: 0.8 }}>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10px', color: '#fff', opacity: 0.8 }}>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '5px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Type Popup */}
      {showTransactionPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowTransactionPopup(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '400px',
              width: '100%',
              maxHeight: '70vh',
              overflow: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                {showTransactionPopup === 'income' ? '💵 Income Details' : '💸 Expense Details'}
              </h3>
              <button
                onClick={() => setShowTransactionPopup(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              backgroundColor: showTransactionPopup === 'income' ? '#e8f5e9' : '#ffebee',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                Total {showTransactionPopup === 'income' ? 'Income' : 'Expenses'}
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: showTransactionPopup === 'income' ? '#2e7d32' : '#c62828' 
              }}>
                LKR {(showTransactionPopup === 'income' ? totalIncome : totalExpenses).toFixed(2)}
              </div>
            </div>

            {(() => {
              const filteredTransactions = filteredTxs.filter(tx => tx.type === showTransactionPopup);
              
              if (filteredTransactions.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>
                    No {showTransactionPopup} transactions found
                  </div>
                );
              }

              // Group by category and sum amounts
              const categoryTotals = filteredTransactions.reduce((acc, tx) => {
                if (!acc[tx.category]) {
                  acc[tx.category] = 0;
                }
                acc[tx.category] += tx.amount;
                return acc;
              }, {});

              // Convert to array and sort by amount
              const sortedCategories = Object.entries(categoryTotals)
                .map(([category, amount]) => ({ category, amount }))
                .sort((a, b) => b.amount - a.amount);

              return (
                <div>
                  {sortedCategories.map(({ category, amount }) => (
                    <div
                      key={category}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        padding: '12px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                          {category}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: showTransactionPopup === 'income' ? '#2e7d32' : '#c62828',
                        whiteSpace: 'nowrap',
                        marginLeft: '10px'
                      }}>
                        {showTransactionPopup === 'income' ? '+' : '-'}LKR {amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Period Selection Popup */}
      {showPeriodPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowPeriodPopup(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                📅 Select Period
              </h3>
              <button
                onClick={() => setShowPeriodPopup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  setPeriod('month');
                  setShowPeriodPopup(false);
                }}
                style={{
                  padding: '15px',
                  fontSize: '15px',
                  backgroundColor: period === 'month' ? '#4CAF50' : '#f8f9fa',
                  color: period === 'month' ? 'white' : '#333',
                  border: period === 'month' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                📆 This Month
              </button>

              <button
                onClick={() => {
                  setPeriod('year');
                  setShowPeriodPopup(false);
                }}
                style={{
                  padding: '15px',
                  fontSize: '15px',
                  backgroundColor: period === 'year' ? '#4CAF50' : '#f8f9fa',
                  color: period === 'year' ? 'white' : '#333',
                  border: period === 'year' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                📅 This Year
              </button>

              <button
                onClick={() => {
                  setPeriod('custom');
                  if (!startDate) {
                    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    setStartDate(firstDay.toISOString().split('T')[0]);
                  }
                }}
                style={{
                  padding: '15px',
                  fontSize: '15px',
                  backgroundColor: period === 'custom' ? '#4CAF50' : '#f8f9fa',
                  color: period === 'custom' ? 'white' : '#333',
                  border: period === 'custom' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                🗓️ Custom Range
              </button>
            </div>

            {period === 'custom' && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowPeriodPopup(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Apply Custom Range
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Add Transaction Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
      }}>
        <h2 style={{ marginTop: 0, fontSize: '16px', color: '#333', marginBottom: '15px' }}>
          {type === 'income' ? '💵 Add Income' : '➕ Add Expense'}
        </h2>
        <form onSubmit={handleAddExpense}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '15px',
                  backgroundColor: type === 'expense' ? '#dc3545' : '#f8f9fa',
                  color: type === 'expense' ? 'white' : '#495057',
                  border: type === 'expense' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '15px',
                  backgroundColor: type === 'income' ? '#28a745' : '#f8f9fa',
                  color: type === 'income' ? 'white' : '#495057',
                  border: type === 'income' ? 'none' : '1px solid #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Income
              </button>
            </div>
          </div>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#2c3e50', marginBottom: '6px' }}>
              Category *
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', 
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '2px'
            }}>
              {categories.map(cat => (
                <div
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '8px',
                    border: category === cat ? '2px solid #4CAF50' : '1px solid #ddd',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: category === cat ? '600' : '500',
                    backgroundColor: category === cat ? '#f0f9f4' : 'white',
                    color: category === cat ? '#2d7a4d' : '#555',
                    transition: 'all 0.15s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={e => {
                    if (category !== cat) {
                      e.currentTarget.style.borderColor = '#aaa';
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={e => {
                    if (category !== cat) {
                      e.currentTarget.style.borderColor = '#ddd';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {cat}
                </div>
              ))}
            </div>
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
              backgroundColor: type === 'income' ? '#28a745' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 Save {type === 'income' ? 'Income' : 'Expense'}
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
            No transactions yet. Add your first transaction above! 👆
          </p>
        ) : (
          <div>
            {(showAllTransactions ? filteredTxs : filteredTxs.slice(0, 5)).map((tx) => (
              <div
                key={tx.id}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  padding: '12px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  backgroundColor: tx.type === 'income' ? 'rgba(40, 167, 69, 0.05)' : 'transparent'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#222', 
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {tx.type === 'income' ? '💵' : '💸'}
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
                    color: tx.type === 'income' ? '#28a745' : '#e74c3c', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {tx.type === 'income' ? '+' : '-'}LKR {tx.amount.toFixed(2)}
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
            
            {filteredTxs.length > 5 && (
              <button
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                style={{
                  width: '100%',
                  marginTop: '15px',
                  padding: '10px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                {showAllTransactions ? (
                  <>
                    <span>↑</span>
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <span>↓</span>
                    <span>Show All ({filteredTxs.length} transactions)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Future Payments Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
            📅 Future Payments
          </h2>
          <button
            onClick={() => setShowLiabilitiesModal(true)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            View All
          </button>
        </div>
          
          {(() => {
            const today = new Date().setHours(0, 0, 0, 0);
            const upcomingLiabilities = liabilities
              .filter(l => !l.isPaid)
              .map(l => ({
                ...l,
                daysUntilDue: Math.ceil((new Date(l.dueDate).setHours(0, 0, 0, 0) - today) / (1000 * 60 * 60 * 24))
              }))
              .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
              .slice(0, 3);
            
            const totalPending = liabilities.filter(l => !l.isPaid).reduce((sum, l) => sum + l.amount, 0);
            
            return (
              <>
                <div style={{
                  backgroundColor: '#fff3cd',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  borderLeft: '4px solid #ffc107'
                }}>
                  <div style={{ fontSize: '12px', color: '#856404', marginBottom: '3px' }}>
                    Total Pending Payments
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#856404' }}>
                    LKR {totalPending.toFixed(2)}
                  </div>
                </div>
                
                {upcomingLiabilities.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '20px', fontSize: '14px' }}>
                    No pending liabilities! 🎉
                  </p>
                ) : (
                  upcomingLiabilities.map(liability => {
                    const isOverdue = liability.daysUntilDue < 0;
                    const isDueSoon = liability.daysUntilDue >= 0 && liability.daysUntilDue <= 7;
                    
                    return (
                      <div
                        key={liability.id}
                        style={{
                          borderLeft: `4px solid ${isOverdue ? '#ff5722' : isDueSoon ? '#FFC107' : '#4CAF50'}`,
                          padding: '12px',
                          marginBottom: '10px',
                          backgroundColor: isOverdue ? '#ffebee' : isDueSoon ? '#fff8e1' : '#f5f5f5',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '700', 
                              color: '#222',
                              marginBottom: '4px'
                            }}>
                              {liability.description}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              {liability.category}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: isOverdue ? '#ff5722' : isDueSoon ? '#f57c00' : '#666',
                              fontWeight: isOverdue || isDueSoon ? '600' : '400'
                            }}>
                              Due: {new Date(liability.dueDate).toLocaleDateString()}
                              {isOverdue && ` (${Math.abs(liability.daysUntilDue)} days overdue!)`}
                              {isDueSoon && !isOverdue && ` (${liability.daysUntilDue === 0 ? 'Today' : `${liability.daysUntilDue} days`})`}
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            color: isOverdue ? '#ff5722' : '#f44336',
                            whiteSpace: 'nowrap',
                            marginLeft: '10px'
                          }}>
                            {liability.currency} {liability.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                <button
                  onClick={() => navigate('/add-future-payment')}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '10px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    border: '1px dashed #ced4da',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  + Add Future Payment
                </button>
              </>
            );
          })()}
      </div>

      {/* Category Breakdown Chart */}
      {categoryBreakdown.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
            📊 Category Breakdown
          </h3>
          <div style={{ height: Math.max(300, categoryBreakdown.length * 50) + 'px' }}>
            <Bar 
              data={{
                labels: categoryBreakdown.map(c => c.category),
                datasets: [
                  {
                    label: 'Income',
                    data: categoryBreakdown.map(c => c.income),
                    backgroundColor: '#28a745',
                    borderRadius: 5
                  },
                  {
                    label: 'Expenses',
                    data: categoryBreakdown.map(c => c.expense),
                    backgroundColor: '#dc3545',
                    borderRadius: 5
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      padding: 10,
                      font: { size: 12 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.x || 0;
                        const total = context.dataset.label === 'Income' ? totalIncome : totalExpenses;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: LKR ${value.toFixed(2)} (${percentage}%)`;
                      }
                    }
                  },
                  datalabels: {
                    display: true,
                    color: 'white',
                    font: {
                      weight: 'bold',
                      size: 10
                    },
                    formatter: (value, context) => {
                      const total = context.dataset.label === 'Income' ? totalIncome : totalExpenses;
                      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                      return value > 0 ? `${value.toFixed(0)} (${percentage}%)` : '';
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'LKR ' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
            {categoryBreakdown.map((cat, idx) => (
              <div 
                key={cat.category}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                  borderRadius: '4px',
                  marginBottom: '4px'
                }}
              >
                <span style={{ fontWeight: '600', color: '#333' }}>{cat.category}</span>
                <span>
                  <span style={{ color: '#28a745', marginRight: '10px' }}>
                    +{cat.income.toFixed(2)}
                  </span>
                  <span style={{ color: '#dc3545' }}>
                    -{cat.expense.toFixed(2)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown */}
      {dailyBreakdownArray.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
            📅 Daily Breakdown
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {dailyBreakdownArray.map((day, idx) => {
              const dayDate = new Date(day.date);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dateStr = dayDate.toLocaleDateString('en-CA');
              const netAmount = day.income - day.expense;
              
              return (
                <div
                  key={day.date}
                  style={{
                    padding: '12px',
                    backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                        {dayName}, {dateStr}
                      </span>
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#6c757d',
                        backgroundColor: '#e9ecef',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {day.transactions.length} transaction{day.transactions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '15px',
                      color: netAmount >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {netAmount >= 0 ? '+' : ''}{netAmount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    fontSize: '13px',
                    paddingTop: '6px',
                    borderTop: '1px solid #e9ecef'
                  }}>
                    {day.income > 0 && (
                      <span style={{ color: '#28a745' }}>
                        Income: <strong>+{day.income.toFixed(2)}</strong>
                      </span>
                    )}
                    {day.expense > 0 && (
                      <span style={{ color: '#dc3545' }}>
                        Expenses: <strong>-{day.expense.toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                    backgroundColor: editingCategory === cat ? '#e7f3ff' : '#f8f9fa',
                    borderRadius: '5px',
                    border: editingCategory === cat ? '2px solid #007bff' : '1px solid #dee2e6'
                  }}
                >
                  {editingCategory === cat ? (
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditCategory(cat, editCategoryName);
                        }
                      }}
                      onBlur={() => {
                        setEditingCategory(null);
                        setEditCategoryName('');
                      }}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        fontSize: '15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        color: '#333'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '15px', color: '#333' }}>{cat}</span>
                  )}
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {editingCategory === cat ? (
                      <>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleEditCategory(cat, editCategoryName);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCategoryName(cat);
                          }}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
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
                      </>
                    )}
                  </div>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
              <button
                onClick={() => handleConfirmClose(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: '0',
                  lineHeight: '1'
                }}
                title="Close"
              >
                ×
              </button>
            </div>
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

      {/* Future Payments Modal */}
      {showLiabilitiesModal && (
        <LiabilityList 
          onClose={() => setShowLiabilitiesModal(false)} 
          asModal={true} 
        />
      )}
    </div>
  );
}
