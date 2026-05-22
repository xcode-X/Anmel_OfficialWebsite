import 'dotenv/config';
import { initDatabase } from '../lib/dbReady.js';
import { getAuth } from '../config/firebase.js';
import { createDoc, COLLECTIONS } from '../lib/firestoreDb.js';

const demoEmail = (process.env.DEMO_ADMIN_EMAIL || 'demo.admin@anmelinc.com').toLowerCase();
const demoPassword = process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin@123';

await initDatabase();
const auth = getAuth();

let firebaseUser;
try {
  firebaseUser = await auth.getUserByEmail(demoEmail);
} catch {
  firebaseUser = await auth.createUser({ email: demoEmail, password: demoPassword, displayName: 'Demo Admin' });
}
await auth.setCustomUserClaims(firebaseUser.uid, { role: 'admin', admin: true });

await createDoc(COLLECTIONS.users, {
  email: demoEmail,
  name: 'Demo Admin',
  role: 'admin',
  firebaseUid: firebaseUser.uid,
}, firebaseUser.uid);

const samples = [
  {
    col: COLLECTIONS.testimonials,
    data: {
      name: 'Sarah Mensah',
      role: 'Graduate',
      company: 'Tech Corp',
      quote: 'Anmel guided me through every step of my application.',
      accent: 'sky',
    },
  },
  {
    col: COLLECTIONS.courses,
    data: {
      title: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      category: 'cybersecurity',
      published: true,
      order: 1,
      shortDescription: 'Learn core security concepts.',
    },
  },
  {
    col: COLLECTIONS.blogPosts,
    data: {
      title: 'Welcome to Anmel',
      slug: 'welcome-to-anmel',
      excerpt: 'Study abroad and cybersecurity programs.',
      content: '<p>Welcome to our platform.</p>',
      published: true,
    },
  },
  {
    col: COLLECTIONS.caseStudies,
    data: {
      title: 'Security Assessment Success',
      slug: 'security-assessment-success',
      category: 'Security Assessment',
      published: true,
      hasImage: false,
      order: 1,
    },
  },
];

for (const { col, data } of samples) {
  await createDoc(col, data);
}

console.log('Firebase seed complete.');
console.log(`Admin login: ${demoEmail} / ${demoPassword}`);
process.exit(0);
