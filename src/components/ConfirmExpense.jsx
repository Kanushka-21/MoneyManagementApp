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
      navigate('/transactions');
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  }

  if (!transcript) return <div style={{padding:'1rem'}}>No data to confirm.</div>;

  return (
    <div style={{padding:'1rem'}}>
      <h2>Confirm Expense</h2>
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
