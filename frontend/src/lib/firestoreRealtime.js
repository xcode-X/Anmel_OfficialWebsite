import { collection, doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { mapFirestoreDoc } from './firestoreClient';

/** Live updates for a single Firestore document (e.g. one university). */
export function subscribeFirestoreDocument(collectionName, docId, callback) {
  if (!docId) return () => {};
  try {
    const ref = doc(getFirebaseDb(), collectionName, String(docId));
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        callback(mapFirestoreDoc(snap));
      },
      (err) => console.warn(`[firestore] ${collectionName}/${docId}:`, err.message),
    );
  } catch (e) {
    console.warn(`[firestore] subscribe doc ${collectionName} failed:`, e.message);
    return () => {};
  }
}

const META_COLLECTION = 'meta';
const REALTIME_DOC = 'realtime';

function sortByCreatedAt(rows) {
  return [...rows].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

/**
 * Subscribe to CMS changes via Firestore (replaces SSE /api/content/stream).
 */
export function subscribeContentStream(callback) {
  try {
    const ref = doc(getFirebaseDb(), META_COLLECTION, REALTIME_DOC);
    let lastTs = null;
    return onSnapshot(
      ref,
      (snap) => {
        const data = snap.data();
        if (!data?.resource) return;
        const ts = data.ts?.toMillis?.() ?? data.ts ?? null;
        if (ts && ts === lastTs) return;
        lastTs = ts;
        const { resource, ...meta } = data;
        callback(resource, meta);
      },
      (err) => console.warn('[firestore] content stream:', err.message),
    );
  } catch (e) {
    console.warn('[firestore] subscribeContentStream failed:', e.message);
    return () => {};
  }
}

/** Live updates for published-only rows (public blog, case studies, etc.). */
export function subscribePublishedCollection(
  collectionName,
  callback,
  { publishedField = 'published', category = '' } = {},
) {
  return subscribeFirestoreCollection(collectionName, (rows) => {
    let filtered = rows.filter((r) => r[publishedField] === true);
    if (category) filtered = filtered.filter((r) => r.category === category);
    callback(filtered);
  });
}

/** Live updates for scholarship application file attachments (subcollection). */
export function subscribeScholarshipApplicationFiles(appId, callback) {
  if (!appId) return () => {};
  try {
    const collRef = collection(getFirebaseDb(), 'scholarshipApplications', String(appId), 'files');
    return onSnapshot(
      collRef,
      (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn(`[firestore] scholarshipApplications/${appId}/files:`, err.message),
    );
  } catch (e) {
    console.warn('[firestore] subscribe application files failed:', e.message);
    return () => {};
  }
}

/** Live updates for a collection (admin dashboards). Sorts client-side so missing indexes/fields still work. */
export function subscribeFirestoreCollection(collectionName, callback) {
  try {
    const collRef = collection(getFirebaseDb(), collectionName);
    return onSnapshot(
      collRef,
      (snap) => {
        const rows = snap.docs.map((d) => mapFirestoreDoc(d)).filter(Boolean);
        callback(sortByCreatedAt(rows));
      },
      (err) => console.warn(`[firestore] ${collectionName}:`, err.message),
    );
  } catch (e) {
    console.warn(`[firestore] subscribe ${collectionName} failed:`, e.message);
    return () => {};
  }
}
