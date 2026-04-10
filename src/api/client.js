/**
 * Centralized API Service
 * Single endpoint for all application operations
 * Aggregates auth, firestore, and storage services
 */

import { signInGoogle, logout } from '../services/authService.js';
import {
  saveTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
  getPrediction,
  saveLiability,
  listLiabilities,
  updateLiability,
  deleteLiability,
} from '../services/firestoreService.js';
import {
  uploadReceipt,
  deleteReceiptByUrl,
} from '../services/storageService.js';

/**
 * API Client - Single central point for all API operations
 */
const API = {
  // Auth endpoints
  auth: {
    signInGoogle,
    logout,
  },

  // Transaction endpoints
  transactions: {
    save: saveTransaction,
    list: listTransactions,
    update: updateTransaction,
    delete: deleteTransaction,
  },

  // Prediction endpoints
  predictions: {
    get: getPrediction,
  },

  // Liability endpoints
  liabilities: {
    save: saveLiability,
    list: listLiabilities,
    update: updateLiability,
    delete: deleteLiability,
  },

  // Storage/Receipt endpoints
  storage: {
    uploadReceipt,
    deleteReceiptByUrl,
  },
};

export default API;
