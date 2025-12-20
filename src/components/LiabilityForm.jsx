import React, { useState } from 'react';
import { saveLiability } from '../services/firestoreService.js';

const LIABILITY_CATEGORIES = [
  'Credit Card Payment',
  'Loan Payment',
  'Mortgage Payment',
  'Utility Bill',
  'Insurance Premium',
  'Subscription',
  'Tax Payment',
  'Rent',
  'Other'
];

export default function LiabilityForm() {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    currency: 'LKR',
    category: 'Credit Card Payment',
    dueDate: new Date().toISOString().substring(0, 10),
    note: '',
    isPaid: false
  });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveLiability({
        ...form,
        amount: parseFloat(form.amount)
      });
      setForm({
        description: '',
        amount: '',
        currency: 'LKR',
        category: 'Credit Card Payment',
        dueDate: new Date().toISOString().substring(0, 10),
        note: '',
        isPaid: false
      });
      alert('Liability added successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Add Liability</h2>
      <form onSubmit={submit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
            Description *
          </label>
          <input
            type="text"
            required
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="e.g., Chase Credit Card - January"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
            Category *
          </label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
          >
            {LIABILITY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
              Amount *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
              Currency
            </label>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
            >
              <option value="LKR">LKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
            Due Date *
          </label>
          <input
            type="date"
            required
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.3rem', color: '#555' }}>
            Notes (Optional)
          </label>
          <textarea
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="Additional details about this payment..."
            rows="3"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: loading ? '#ccc' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Saving...' : 'Add Liability'}
        </button>
      </form>
    </div>
  );
}
