import { subscribeContentStream as subscribeFirestore } from './firestoreRealtime';

/**
 * Real-time CMS updates via Firestore only.
 * (SSE /api/content/stream is not used — it 503s when Firebase Admin is offline.)
 */
export function subscribeContentStream(onResource) {
  try {
    return subscribeFirestore(onResource);
  } catch {
    return () => {};
  }
}
