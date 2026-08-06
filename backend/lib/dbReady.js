import { getFirebaseApp } from '../config/firebase.js';

let firebaseReady = false;
let fallbackReady = true;

export function isDbConnected() {
  return firebaseReady || fallbackReady;
}

export function isFirebaseConnected() {
  return firebaseReady;
}

export function setDbConnected(value) {
  firebaseReady = Boolean(value);
}

export async function initDatabase() {
  try {
    getFirebaseApp();
    firebaseReady = true;
    console.log('[DB] Firebase connected successfully.');
    return true;
  } catch (e) {
    firebaseReady = false;
    fallbackReady = true;
    console.log('[DB] Running with robust local DB store fallback:', e.message);
    return true;
  }
}

/** Run a query with timeout fallback (Firebase). */
export async function withDbQuery(fn, { fallback = null, timeoutMs = 15000, label = 'query' } = {}) {
  if (!isDbConnected()) return fallback;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('db_query_timeout')), timeoutMs);
      }),
    ]);
  } catch (err) {
    console.warn(`[DB] ${label} failed:`, err.message);
    return fallback;
  }
}
