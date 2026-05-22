import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

let app = null;

function loadServiceAccount() {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (jsonPath) {
    const resolved = resolve(jsonPath);
    if (existsSync(resolved)) {
      return JSON.parse(readFileSync(resolved, 'utf8'));
    }
  }
  const defaultPath = resolve(process.cwd(), 'firebase-service-account.json');
  if (existsSync(defaultPath)) {
    return JSON.parse(readFileSync(defaultPath, 'utf8'));
  }
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    return JSON.parse(inline);
  }
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (privateKey?.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }
  return null;
}

export function initFirebase() {
  if (app) return app;
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
    );
  }
  const projectId =
    serviceAccount.project_id ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    'anmelwebsitpro';
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    `${projectId}.firebasestorage.app`;

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
    storageBucket,
  });
  return app;
}

export function getFirebaseApp() {
  if (!app) initFirebase();
  return app;
}

export function getAuth() {
  return getFirebaseApp().auth();
}

export function getFirestore() {
  return getFirebaseApp().firestore();
}

export function getBucket() {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucket) return null;
  return getFirebaseApp().storage().bucket(bucket);
}
