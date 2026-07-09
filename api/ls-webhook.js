// Lemon Squeezy webhook → extends the paying gym's subscription in Firestore.
// Deployed by Vercel as a serverless function at /api/ls-webhook.
//
// Required environment variables (Vercel → Project → Settings → Env Vars):
//   LS_WEBHOOK_SECRET        — the same signing secret entered in Lemon Squeezy
//   FIREBASE_SERVICE_ACCOUNT — full JSON of a Firebase service-account key

import crypto from 'node:crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// keep the raw body: the HMAC signature is computed over the exact bytes
export const config = { api: { bodyParser: false } };

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const secret = process.env.LS_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'LS_WEBHOOK_SECRET not configured' });

  const raw = await readRaw(req);

  // verify Lemon Squeezy signature (X-Signature: hex HMAC-SHA256 of the body)
  const given = String(req.headers['x-signature'] || '');
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  let ok = false;
  try {
    ok = given.length === expected.length
      && crypto.timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'));
  } catch { ok = false; }
  if (!ok) return res.status(401).json({ error: 'invalid signature' });

  let payload;
  try { payload = JSON.parse(raw.toString('utf8')); }
  catch { return res.status(400).json({ error: 'invalid json' }); }

  const event = payload?.meta?.event_name;
  const RENEWING_EVENTS = ['subscription_created', 'subscription_payment_success', 'subscription_resumed', 'subscription_unpaused'];
  if (!RENEWING_EVENTS.includes(event)) {
    return res.status(200).json({ skipped: event || 'unknown event' });
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  const db = getFirestore();

  // match the gym: uid passed via checkout[custom][uid], else fall back to e-mail
  const uid = payload?.meta?.custom_data?.uid;
  const email = String(payload?.data?.attributes?.user_email || '').toLowerCase();
  let ref = null;
  if (uid) {
    ref = db.collection('users').doc(uid);
    if (!(await ref.get()).exists) ref = null;
  }
  if (!ref && email) {
    const q = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!q.empty) ref = q.docs[0].ref;
  }
  if (!ref) return res.status(200).json({ warning: 'no matching user', uid: uid || null, email });

  // period end straight from Lemon Squeezy; fallback: ~1 month from now
  const renewsAt = payload?.data?.attributes?.renews_at;
  const end = renewsAt ? new Date(renewsAt) : new Date(Date.now() + 32 * 864e5);
  const endDate = end.toISOString().slice(0, 10);

  await ref.set({
    subscription: { status: 'active', endDate, plan: 'monthly', priceUsd: 19.99 },
  }, { merge: true });

  return res.status(200).json({ ok: true, event, endDate });
}
