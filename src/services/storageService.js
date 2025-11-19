import { storage, auth } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadReceipt(file) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  const pathRef = ref(storage, `receipts/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(pathRef, file);
  return await getDownloadURL(pathRef);
}

export async function deleteReceiptByUrl(url) {
  if (!url) return;
  const objRef = ref(storage, url);
  await deleteObject(objRef);
}
