import { existsSync } from 'fs';
import { resolve } from 'path';
import { logWarn } from './logger.js';

export function validateEnvironment() {
  const warnings = [];

  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  const hasSaFile = saPath && existsSync(resolve(saPath));
  const hasFirebase =
    hasSaFile ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
  if (!hasFirebase) {
    warnings.push(
      'Firebase Admin key missing — save service account JSON as backend/firebase-service-account.json (see docs/FIREBASE-SETUP.md).',
    );
  }
  if (!process.env.FIREBASE_WEB_API_KEY && !process.env.FIREBASE_PROJECT_ID) {
    warnings.push('FIREBASE_WEB_API_KEY / FIREBASE_PROJECT_ID not set.');
  }

  if (!process.env.CLIENT_URL) {
    warnings.push('CLIENT_URL is not set — defaulting to http://localhost:5173 for CORS/links.');
  }

  for (const w of warnings) {
    logWarn('env', w);
  }

  return { ok: warnings.length === 0, warnings };
}
