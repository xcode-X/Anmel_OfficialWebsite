import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let adminSdkReady = null;

function loadServiceAccount() {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (jsonPath && existsSync(resolve(jsonPath))) {
    return JSON.parse(readFileSync(resolve(jsonPath), 'utf8'));
  }
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) return JSON.parse(inline);
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (privateKey?.includes('\\n')) privateKey = privateKey.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }
  return null;
}

export function isFirebaseAdminSdkAvailable() {
  if (adminSdkReady !== null) return adminSdkReady;
  adminSdkReady = !!loadServiceAccount();
  return adminSdkReady;
}

function decodeJwtPayload(idToken) {
  try {
    const part = idToken.split('.')[1];
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/** Verify ID token via Identity Toolkit (no service account required). */
export async function verifyIdTokenViaRest(idToken) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error('FIREBASE_WEB_API_KEY is required');
    err.code = 'auth/config-missing';
    throw err;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || 'Invalid or expired token';
    const err = new Error(msg);
    if (/EXPIRED|expired/i.test(msg)) err.code = 'auth/id-token-expired';
    throw err;
  }

  const account = data.users?.[0];
  if (!account) {
    const err = new Error('Invalid or expired token');
    err.code = 'auth/invalid-id-token';
    throw err;
  }

  const claims = decodeJwtPayload(idToken);
  return {
    uid: account.localId,
    email: account.email || claims.email,
    role: claims.role,
    admin: claims.admin === true || claims.role === 'admin',
    agent: claims.agent === true || claims.role === 'agent',
    name: claims.name || account.displayName,
  };
}

const WHITELIST = () =>
  (process.env.ADMIN_EMAIL_WHITELIST ||
    'demo.admin@anmelinc.com,admin@anmelinc.com,admin@intelera.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function isWhitelistedAdminEmail(email) {
  if (!email) return false;
  return WHITELIST().includes(String(email).toLowerCase());
}

/** Read users/{uid} via Firestore REST using the caller's ID token. */
export async function fetchUserProfileViaRest(uid, idToken) {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || 'anmelwebsitpro';
  const url =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents/users/${encodeURIComponent(uid)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;

  const doc = await res.json().catch(() => null);
  const fields = doc?.fields;
  if (!fields) return null;

  const pick = (key) => {
    const f = fields[key];
    if (!f) return undefined;
    if (f.stringValue !== undefined) return f.stringValue;
    if (f.booleanValue !== undefined) return f.booleanValue;
    return undefined;
  };

  return {
    email: pick('email'),
    name: pick('name'),
    role: pick('role'),
  };
}
