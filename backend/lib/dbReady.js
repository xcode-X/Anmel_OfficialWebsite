import { getFirebaseApp } from '../config/firebase.js';

let ready = false;

export function isDbConnected() {
  return ready;
}

export function setDbConnected(value) {
  ready = Boolean(value);
}

export async function initDatabase() {
  try {
    getFirebaseApp();
    ready = true;
    return true;
  } catch (e) {
    ready = false;
    throw e;
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
