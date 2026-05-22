import 'dotenv/config';
import { initDatabase } from '../lib/dbReady.js';
import { listAll, COLLECTIONS } from '../lib/firestoreDb.js';

try {
  await initDatabase();
  const counts = await Promise.all([
    listAll(COLLECTIONS.users).then((r) => r.length),
    listAll(COLLECTIONS.courses).then((r) => r.length),
    listAll(COLLECTIONS.testimonials).then((r) => r.length),
  ]);
  console.log('Firebase OK — users:', counts[0], 'courses:', counts[1], 'testimonials:', counts[2]);
  process.exit(0);
} catch (e) {
  console.error('Firebase check failed:', e.message);
  console.error('Add backend/firebase-service-account.json from Firebase Console → Service accounts');
  process.exit(1);
}
