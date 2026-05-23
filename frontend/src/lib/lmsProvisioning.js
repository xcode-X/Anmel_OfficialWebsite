/**
 * LMS Provisioning — Firestore-first implementation.
 * Works fully without the backend Express server.
 * When the backend IS available it delegates to it; otherwise
 * provisions the account directly in Firestore (users + studentRegistrations).
 */
import {
  collection, doc, addDoc, getDoc, getDocs,
  setDoc, updateDoc, query, where, serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';
import { bumpRealtime } from './firestoreClient';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return (
    localStorage.getItem('intelera_admin_token') ||
    localStorage.getItem('admin_token') ||
    ''
  );
}

function randomPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  let p = 'Stu!';
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

async function tryBackendProvision(registrationId) {
  const url = `${API_BASE}/student-registrations/${registrationId}/provision-lms`;
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: 'POST', headers, body: '{}' });
  const text = await res.text();

  // Vite SPA fallback returns HTML — treat as backend-down
  if (text.trim().startsWith('<')) throw new Error('backend_unavailable');

  let data = {};
  try { data = JSON.parse(text); } catch { throw new Error('backend_unavailable'); }

  if (res.status === 503 || res.status === 502) throw new Error('backend_unavailable');
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  if (!data.provisioned) throw new Error('backend_unavailable');
  return data;
}

async function firestoreProvision(registrationId) {
  const db = getFirebaseDb();

  // 1. Fetch the student registration
  const regRef = doc(db, 'studentRegistrations', registrationId);
  const regSnap = await getDoc(regRef);
  if (!regSnap.exists()) throw new Error('Application not found in database.');

  const reg = { id: regSnap.id, ...regSnap.data() };
  if (reg.lmsProvisioned) {
    // Already provisioned — return existing data
    return {
      provisioned: true,
      email: reg.email,
      existing: true,
      alreadyProvisioned: true,
      notification: { emailResult: { dryRun: true } },
    };
  }

  const email = String(reg.email || '').trim().toLowerCase();
  if (!email) throw new Error('Student email is missing from the application.');

  const tempPassword = randomPassword();
  const now = new Date().toISOString();

  // 2. Check if user already exists in Firestore users collection
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const existing = await getDocs(q);

  let userId;
  let isExisting = false;

  if (!existing.empty) {
    const userDoc = existing.docs[0];
    const userData = userDoc.data();
    if (userData.role && userData.role !== 'student') {
      throw new Error(`This email belongs to a ${userData.role} account and cannot be used for LMS access.`);
    }
    // Update existing user
    await updateDoc(userDoc.ref, {
      name: reg.fullName || userData.name,
      tempPassword,
      role: 'student',
      lmsEnabled: true,
      updatedAt: serverTimestamp(),
    });
    userId = userDoc.id;
    isExisting = true;
  } else {
    // Create new user in Firestore
    const newUserRef = await addDoc(usersRef, {
      email,
      name: reg.fullName || email.split('@')[0],
      tempPassword,
      role: 'student',
      lmsEnabled: true,
      registrationId,
      courseSlug: reg.courseSlug || 'general',
      course: reg.course || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    userId = newUserRef.id;
  }

  // 3. Mark the registration as provisioned
  await updateDoc(regRef, {
    lmsProvisioned: true,
    lmsProvisionedAt: now,
    lmsUserId: userId,
    status: 'provisioned',
    updatedAt: serverTimestamp(),
  });

  // 4. Bump realtime so all dashboards update instantly
  await bumpRealtime('student-registrations');
  await bumpRealtime('users');

  return {
    provisioned: true,
    email,
    password: tempPassword,
    existing: isExisting,
    userId,
    notification: { emailResult: { dryRun: true, note: 'Backend offline — share credentials manually.' } },
  };
}

/**
 * Main entry point.
 * Tries backend first; falls back to Firestore if backend is unavailable.
 */
export async function provisionLmsAccount(registrationId) {
  try {
    return await tryBackendProvision(registrationId);
  } catch (err) {
    if (err.message !== 'backend_unavailable' && !err.message.includes('fetch') && !err.message.includes('unavailable')) {
      throw err; // Real error (e.g. wrong role) — surface it
    }
    // Backend down — use Firestore directly
    return await firestoreProvision(registrationId);
  }
}
