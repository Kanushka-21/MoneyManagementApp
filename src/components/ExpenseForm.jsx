import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveTransaction } from '../services/firestoreService.js';
import { uploadReceipt } from '../services/storageService.js';
import { CATEGORIES } from '../utils/categories.js';

export default function ExpenseForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount:'', currency:'LKR', category:'Food', merchant:'', date:new Date().toISOString().substring(0,10), note:'' });
  const [file, setFile] = useState(null);
  const [loading,setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let receiptUrl = null;
      if (file) receiptUrl = await uploadReceipt(file);
      await saveTransaction({ ...form, amount: parseFloat(form.amount), source: 'manual', receiptUrl });
      setForm({ amount:'', currency:'LKR', category:'Food', merchant:'', date:new Date().toISOString().substring(0,10), note:'' });
      setFile(null);
      alert('Saved');
      navigate('/');
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} style={{padding:'1rem',maxWidth:400,margin:'0 auto'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Manual Expense</h2>
        <button
          type="button"
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
      {['amount','merchant','note'].map(k => (
        <div key={k} style={{marginBottom:'0.5rem'}}>
          <label style={{display:'block',fontSize:'0.75rem'}}>{k}</label>
          <input required={k==='amount'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
        </div>
      ))}
      <div style={{marginBottom:'1rem'}}>
        <label style={{display:'block',fontSize:'0.85rem',fontWeight:'600',marginBottom:'0.5rem',color:'#555'}}>Category</label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
          gap: '8px'
        }}>
          {CATEGORIES.map(c => (
            <div
              key={c}
              onClick={() => setForm({...form, category: c})}
              style={{
                padding: '10px',
                border: form.category === c ? '2px solid #4CAF50' : '1px solid #ddd',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: form.category === c ? '600' : '500',
                backgroundColor: form.category === c ? '#f0f9f4' : 'white',
                color: form.category === c ? '#2d7a4d' : '#555',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
              onMouseEnter={e => {
                if (form.category !== c) {
                  e.currentTarget.style.borderColor = '#aaa';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={e => {
                if (form.category !== c) {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:'0.5rem'}}>
        <label style={{display:'block',fontSize:'0.75rem'}}>date</label>
        <input type='date' value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
      </div>
      <div style={{marginBottom:'0.5rem'}}>
        <label style={{display:'block',fontSize:'0.75rem'}}>Receipt</label>
        <input type='file' onChange={e=>setFile(e.target.files[0])} />
      </div>
      <button disabled={loading}>{loading?'Saving...':'Save'}</button>
    </form>
  );
}
