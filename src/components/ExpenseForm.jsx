import React, { useState } from 'react';
import { saveTransaction } from '../services/firestoreService.js';
import { uploadReceipt } from '../services/storageService.js';
import { CATEGORIES } from '../utils/categories.js';

export default function ExpenseForm() {
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
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} style={{padding:'1rem',maxWidth:400}}>
      <h2>Manual Expense</h2>
      {['amount','merchant','note'].map(k => (
        <div key={k} style={{marginBottom:'0.5rem'}}>
          <label style={{display:'block',fontSize:'0.75rem'}}>{k}</label>
          <input required={k==='amount'} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
        </div>
      ))}
      <div style={{marginBottom:'0.5rem'}}>
        <label style={{display:'block',fontSize:'0.75rem'}}>category</label>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
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
