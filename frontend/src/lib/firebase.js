import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

/** Firebase Web SDK config — project: anmelwebsitpro */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCa3YI0R2o1DzQFpucYj6xW55d-x4lqBOU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'anmelwebsitpro.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'anmelwebsitpro',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'anmelwebsitpro.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '664787621148',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:664787621148:web:72a00ac632acb25614d6d9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5SJ8MRM4ZR',
};

let app = null;
let analytics = null;

export function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}

/** Google Analytics (browser only). */
export async function getFirebaseAnalytics() {
  if (analytics) return analytics;
  if (typeof window === 'undefined') return null;
  const supported = await isSupported();
  if (!supported) return null;
  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}
