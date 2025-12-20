import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTransactions, deleteTransaction } from '../services/firestoreService.js';

export default function TransactionList() {
  const navigate = useNavigate();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setTxs(await listTransactions({})); } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!window.confirm('Delete transaction?')) return;
    await deleteTransaction(id);
    setTxs(txs.filter(t => t.id !== id));
  }

  if (loading) return <div style={{padding:'1rem'}}>Loading...</div>;
  return (
    <div style={{padding:'1rem'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Transactions</h2>
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
      {txs.map(t => (
        <div key={t.id} style={{background:'#fff',marginBottom:'0.5rem',padding:'0.5rem',borderRadius:'6px',display:'flex',justifyContent:'space-between'}}>
          <div>
            <strong>{t.category}</strong> — {t.merchant || 'N/A'}<br />
            <small>{new Date(t.date).toLocaleDateString()}</small>
          </div>
          <div>
            <span style={{fontWeight:'bold'}}>{t.currency} {t.amount}</span><br />
            <button onClick={() => remove(t.id)} style={{fontSize:'0.7rem'}}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
