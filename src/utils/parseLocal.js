// Enhanced parser for natural speech extraction
// Input: transcript string. Output: { amount, currency, category, merchant, date, note }
import { CATEGORIES } from './categories.js';

// Merchant patterns - common expense keywords
const merchantKeywords = {
  'kfc': 'KFC',
  'mcdonalds': "McDonald's",
  'burger king': 'Burger King',
  'pizza hut': 'Pizza Hut',
  'cargills': 'Cargills',
  'keells': 'Keells',
  'arpico': 'Arpico',
  'uber': 'Uber',
  'pickme': 'PickMe',
  'dialog': 'Dialog',
  'mobitel': 'Mobitel'
};

// Category indicators - phrases that suggest categories
const categoryIndicators = {
  'food': ['lunch', 'dinner', 'breakfast', 'meal', 'snack', 'ate', 'eating'],
  'transport': ['taxi', 'bus', 'train', 'uber', 'pickme', 'ride', 'fuel', 'petrol'],
  'groceries': ['groceries', 'vegetables', 'fruits', 'supermarket', 'market'],
  'bills': ['bill', 'electricity', 'water', 'internet', 'phone', 'mobile'],
  'entertainment': ['movie', 'cinema', 'game', 'concert', 'show'],
  'health': ['medicine', 'doctor', 'hospital', 'pharmacy', 'medical'],
  'shopping': ['bought', 'purchase', 'shopping', 'clothes', 'shoes']
};

export function parseLocal(transcript) {
  if (!transcript) return {};
  const lower = transcript.toLowerCase();
  
  // Extract amount - look for numbers with optional currency
  const amountPattern = /(\d+(?:[,\.]\d+)?)\s*(?:lkr|rs|rupees|usd|dollars)?/i;
  const amountMatch = transcript.match(amountPattern);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;
  
  // Extract currency
  const currencyPattern = /(lkr|rs|rupees|usd|dollars)/i;
  const currencyMatch = lower.match(currencyPattern);
  let currency = 'LKR';
  if (currencyMatch) {
    const curr = currencyMatch[1].toUpperCase();
    currency = curr === 'RUPEES' || curr === 'RS' ? 'LKR' : curr === 'DOLLARS' ? 'USD' : curr;
  }
  
  // Extract merchant - check common merchants or word after "at/from/in"
  let merchant = null;
  for (const [key, name] of Object.entries(merchantKeywords)) {
    if (lower.includes(key)) {
      merchant = name;
      break;
    }
  }
  if (!merchant) {
    const atMatch = lower.match(/(?:at|from|in)\s+([a-z]+)/i);
    if (atMatch) {
      merchant = atMatch[1].charAt(0).toUpperCase() + atMatch[1].slice(1);
    }
  }
  
  // Smart category detection
  let category = null;
  
  // First check explicit category names
  for (const cat of CATEGORIES) {
    if (lower.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }
  
  // If not found, check indicators
  if (!category) {
    for (const [cat, indicators] of Object.entries(categoryIndicators)) {
      if (indicators.some(ind => lower.includes(ind))) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }
  }
  
  // Default to 'Other' if still not found
  if (!category) {
    category = 'Other';
  }
  
  // Date extraction (default to now, could parse "yesterday", "last week" etc)
  const date = new Date();
  
  return {
    amount,
    currency,
    category,
    merchant,
    date: date.toISOString().split('T')[0],
    note: transcript
  };
}
