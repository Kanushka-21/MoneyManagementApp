import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      alert('Future payment added successfully!');
      navigate('/future-payments');
    } catch (err) {
      console.error('Error adding future payment:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Add Future Payment</h2>
        <button
          onClick={() => navigate('/future-payments')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
      </div>
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
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#555' }}>
            Category *
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
            gap: '10px'
          }}>
            {LIABILITY_CATEGORIES.map(cat => (
              <div
                key={cat}
                onClick={() => setForm({ ...form, category: cat })}
                style={{
                  padding: '12px',
                  border: form.category === cat ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: form.category === cat ? '600' : '500',
                  backgroundColor: form.category === cat ? '#f0f9f4' : 'white',
                  color: form.category === cat ? '#2d7a4d' : '#555',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={e => {
                  if (form.category !== cat) {
                    e.currentTarget.style.borderColor = '#aaa';
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={e => {
                  if (form.category !== cat) {
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/liabilities')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 2,
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
            {loading ? 'Saving...' : 'Add Future Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
