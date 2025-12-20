import React, { useEffect, useState } from 'react';
import { listLiabilities, deleteLiability, updateLiability } from '../services/firestoreService.js';

export default function LiabilityList() {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, overdue

  async function loadLiabilities() {
    setLoading(true);
    try {
      const data = await listLiabilities();
      setLiabilities(data);
    } catch (e) {
      alert('Error loading liabilities: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLiabilities();
  }, []);

  async function removeLiability(id) {
    if (!window.confirm('Are you sure you want to delete this liability?')) return;
    try {
      await deleteLiability(id);
      setLiabilities(liabilities.filter(l => l.id !== id));
    } catch (e) {
      alert('Error deleting liability: ' + e.message);
    }
  }

  async function togglePaid(liability) {
    try {
      await updateLiability(liability.id, { isPaid: !liability.isPaid });
      setLiabilities(liabilities.map(l => 
        l.id === liability.id ? { ...l, isPaid: !l.isPaid } : l
      ));
    } catch (e) {
      alert('Error updating liability: ' + e.message);
    }
  }

  function isOverdue(dueDate, isPaid) {
    if (isPaid) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const due = new Date(dueDate).setHours(0, 0, 0, 0);
    return due < today;
  }

  function getDaysUntilDue(dueDate) {
    const today = new Date().setHours(0, 0, 0, 0);
    const due = new Date(dueDate).setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const filteredLiabilities = liabilities.filter(liability => {
    if (filter === 'all') return true;
    if (filter === 'paid') return liability.isPaid;
    if (filter === 'pending') return !liability.isPaid && !isOverdue(liability.dueDate, liability.isPaid);
    if (filter === 'overdue') return isOverdue(liability.dueDate, liability.isPaid);
    return true;
  }).sort((a, b) => {
    // Sort by due date (earliest first) for unpaid, then by paid status
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const totalPending = liabilities
    .filter(l => !l.isPaid)
    .reduce((sum, l) => sum + l.amount, 0);

  const overdueCount = liabilities.filter(l => isOverdue(l.dueDate, l.isPaid)).length;

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading liabilities...</div>;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Liabilities</h2>
        <button
          onClick={() => window.location.href = '/add-liability'}
          style={{
            padding: '0.5rem 1rem',
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add Liability
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Total Pending</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>
            LKR {totalPending.toFixed(2)}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Total Liabilities</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
            {liabilities.length}
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Overdue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: overdueCount > 0 ? '#ff5722' : '#4CAF50' }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
        {['all', 'pending', 'overdue', 'paid'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === f ? '#2196F3' : 'transparent',
              color: filter === f ? '#fff' : '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liabilities List */}
      {filteredLiabilities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
          No liabilities found. Add your first liability to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredLiabilities.map(liability => {
            const overdue = isOverdue(liability.dueDate, liability.isPaid);
            const daysUntil = getDaysUntilDue(liability.dueDate);
            
            return (
              <div
                key={liability.id}
                style={{
                  background: '#fff',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${liability.isPaid ? '#4CAF50' : overdue ? '#ff5722' : '#FFC107'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: liability.isPaid ? 0.7 : 1
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: liability.isPaid ? '#4CAF50' : overdue ? '#ff5722' : '#FFC107',
                        color: '#fff',
                        fontSize: '0.7rem',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                      }}
                    >
                      {liability.isPaid ? 'PAID' : overdue ? 'OVERDUE' : 'PENDING'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>
                      {liability.category}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0.3rem 0', fontSize: '1rem', color: '#333' }}>
                    {liability.description}
                  </h3>
                  
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>
                    <strong>Due:</strong> {new Date(liability.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {!liability.isPaid && !overdue && daysUntil >= 0 && (
                      <span style={{ marginLeft: '0.5rem', color: daysUntil <= 7 ? '#ff5722' : '#666' }}>
                        ({daysUntil === 0 ? 'Due today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} remaining`})
                      </span>
                    )}
                    {overdue && (
                      <span style={{ marginLeft: '0.5rem', color: '#ff5722', fontWeight: 'bold' }}>
                        ({Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} overdue)
                      </span>
                    )}
                  </div>
                  
                  {liability.note && (
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem', fontStyle: 'italic' }}>
                      {liability.note}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: liability.isPaid ? '#4CAF50' : '#f44336' }}>
                    {liability.currency} {liability.amount.toFixed(2)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => togglePaid(liability)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: liability.isPaid ? '#ff9800' : '#4CAF50',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {liability.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                    </button>
                    <button
                      onClick={() => removeLiability(liability.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        background: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
