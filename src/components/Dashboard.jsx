import React, { useEffect, useState } from 'react';
import { listTransactions } from '../services/firestoreService.js';
import { predictExpensesFn } from '../firebase.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [txs,setTxs] = useState([]);
  const [forecast,setForecast] = useState(null);
  const [loading,setLoading] = useState(false);

  useEffect(()=>{ (async()=>{ try { setTxs(await listTransactions({})); } catch(e){ console.error(e);} })(); }, []);

  const total = txs.reduce((sum,t)=>sum + (t.amount||0),0);
  const byCategory = txs.reduce((acc,t)=>{ acc[t.category]= (acc[t.category]||0)+t.amount; return acc;},{});

  const pieData = {
    labels:Object.keys(byCategory),
    datasets:[{ data:Object.values(byCategory), backgroundColor:['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0d9488','#64748b','#f43f5e','#9333ea'] }]
  };

  const lineMockLabels = ['May','Jun','Jul','Aug','Sep','Oct'];
  const lineMockData = [12000,14000,13500,15000,16000,17000];
  const lineData = { labels: lineMockLabels, datasets:[{ label:'Monthly Total', data: lineMockData, borderColor:'#2563eb' }] };

  async function predict() {
    setLoading(true);
    try {
      const res = await predictExpensesFn({});
      setForecast(res.data.forecast);
    } catch (e) { alert(e.message); } finally { setLoading(false); }
  }

  return (
    <div style={{padding:'1rem'}}>
      <h2>Dashboard</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
        <div style={{background:'#fff',padding:'1rem',borderRadius:'8px',minWidth:200}}>
          <h4>This Month Total</h4>
          <p style={{fontSize:'1.5rem',margin:0}}>LKR {total.toFixed(2)}</p>
        </div>
        <div style={{background:'#fff',padding:'1rem',borderRadius:'8px',minWidth:220}}>
          <h4>Category Split</h4>
          <Pie data={pieData} />
        </div>
        <div style={{background:'#fff',padding:'1rem',borderRadius:'8px',flexGrow:1,minWidth:320}}>
          <h4>Last 6 Months</h4>
          <Line data={lineData} />
        </div>
        <div style={{background:'#fff',padding:'1rem',borderRadius:'8px',minWidth:220}}>
          <h4>Prediction</h4>
          {forecast ? (
            <ul style={{listStyle:'none',padding:0,margin:0}}>
              {Object.entries(forecast).map(([m,v])=> <li key={m}>{m}: LKR {v}</li>)}
            </ul>
          ) : <p>No forecast yet.</p>}
          <button onClick={predict} disabled={loading}>{loading?'Loading...':'See predicted expenses'}</button>
        </div>
      </div>
    </div>
  );
}
