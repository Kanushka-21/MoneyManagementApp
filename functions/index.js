// Cloud Functions: parseText & predictExpenses
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenAI } = require('openai');

admin.initializeApp();
const db = admin.firestore();

function openAIClient() {
  const key = functions.config().openai?.key;
  if (!key) throw new Error('OpenAI key not set. Use: firebase functions:config:set openai.key="YOUR_KEY"');
  return new OpenAI({ apiKey: key });
}

// HTTPS function for parsing transcript into structured expense JSON
exports.parseText = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { transcript } = req.body || {};
  if (!transcript) return res.status(400).json({ error: 'Missing transcript' });
  try {
    const client = openAIClient();
    const prompt = `Extract an expense record from the user speech. Return JSON with keys amount (number), currency, category, merchant, date (YYYY-MM-DD), note. If unsure set null. Speech: ${transcript}`;
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You convert natural language expense descriptions into strict JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    });
    const text = completion.choices[0].message.content.trim();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      // fallback: attempt to extract JSON substring
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { error: 'Parse failure' };
    }
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Callable function to predict next months expenses.
exports.predictExpenses = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const uid = context.auth.uid;
  try {
    // Load user transactions (limit for cost control)
    const txSnap = await db.collection('transactions').where('uid','==',uid).orderBy('date','desc').limit(500).get();
    const monthly = {}; // { 'YYYY-MM': total }
    txSnap.forEach(doc => {
      const d = doc.data();
      const dt = d.date ? new Date(d.date) : d.createdAt?.toDate() || new Date();
      const key = dt.toISOString().slice(0,7);
      monthly[key] = (monthly[key] || 0) + (d.amount || 0);
    });

    // Prepare prompt for forecasting next 6 months
    const client = openAIClient();
    const prompt = `Given this JSON of monthly expense totals by YYYY-MM: ${JSON.stringify(monthly)}\nForecast the next 6 months totals in same JSON shape. Only output JSON.`;
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages:[
        { role:'system', content:'You are a forecasting assistant. Return ONLY JSON.' },
        { role:'user', content: prompt }
      ],
      temperature:0.3
    });
    const raw = completion.choices[0].message.content.trim();
    let forecast = {};
    try { forecast = JSON.parse(raw); } catch(e) {
      const m = raw.match(/\{[\s\S]*\}/); if (m) forecast = JSON.parse(m[0]);
    }

    // Persist prediction
    await db.collection('predictions').doc(uid).set({
      uid,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      forecast,
      method: 'llm-v1'
    }, { merge: true });

    return { forecast };
  } catch (err) {
    console.error(err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});

// Admin utility: set a user's role claim to admin. Callable.
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Login required');
  const caller = context.auth;
  if (caller.token.role !== 'admin') throw new functions.https.HttpsError('permission-denied','Admin only');
  const { targetUid } = data;
  if (!targetUid) throw new functions.https.HttpsError('invalid-argument','targetUid required');
  await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });
  return { success: true };
});
