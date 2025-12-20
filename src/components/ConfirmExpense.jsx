import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveTransaction } from '../services/firestoreService.js';

export default function ConfirmExpense() {
  const location = useLocation();
  const navigate = useNavigate();
  const { transcript, parsed } = location.state || {};
  const [form, setForm] = useState(parsed || {});
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);
      await saveTransaction({
        amount: form.amount || 0,
        currency: form.currency || 'LKR',
        category: form.category || 'Other',
        merchant: form.merchant || null,
        note: form.note || transcript,
        date: new Date(form.date || new Date()).toISOString(),
        source: 'voice'
      });
      navigate('/');
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  }

  if (!transcript) return <div style={{padding:'1rem'}}>No data to confirm.</div>;

  return (
    <div style={{padding:'1rem',maxWidth:500,margin:'0 auto'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Confirm Expense</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Dashboard
        </button>
      </div>
      {['amount','currency','category','merchant','date','note'].map(field => (
        <div key={field} style={{marginBottom:'0.5rem'}}>
          <label style={{display:'block',fontSize:'0.75rem',opacity:0.7}}>{field}</label>
          <input value={form[field]||''} onChange={e=>setForm({...form,[field]:e.target.value})} />
        </div>
      ))}
      <button onClick={handleSave} disabled={loading}>{loading?'Saving...':'Save Transaction'}</button>
    </div>
  );
}
