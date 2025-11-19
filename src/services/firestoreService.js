import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase.js';

export async function saveTransaction(tx) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  const ref = await addDoc(collection(db, 'transactions'), {
    ...tx,
    uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listTransactions({ month } = {}) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  let q = query(collection(db, 'transactions'), where('uid', '==', uid), orderBy('date', 'desc'));
  // Month filter could be implemented client-side after fetch due to Firestore limitations (requires composite index for date range)
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTransaction(id, updates) {
  const d = doc(db, 'transactions', id);
  await updateDoc(d, updates);
}

export async function deleteTransaction(id) {
  const d = doc(db, 'transactions', id);
  await deleteDoc(d);
}

export async function getPrediction() {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const d = doc(db, 'predictions', uid);
  const snap = await getDoc(d);
  return snap.exists() ? snap.data() : null;
}
