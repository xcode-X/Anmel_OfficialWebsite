import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { getAuth } from '../config/firebase.js';
import User from '../models/User.js';
import { authMiddleware, adminOnly, verifyFirebaseToken, createCustomToken } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { createDoc, COLLECTIONS, findOne } from '../lib/firestoreDb.js';
import { publishContentChange } from '../lib/contentStreamHub.js';

const router = Router();

async function ensureFirebaseAdminUser(email, password, { name = 'Admin', role = 'admin' } = {}) {
  const auth = getAuth();
  let firebaseUser;
  try {
    firebaseUser = await auth.getUserByEmail(email);
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
    firebaseUser = await auth.createUser({ email, password, displayName: name });
  }
  await auth.setCustomUserClaims(firebaseUser.uid, { role, admin: role === 'admin' });
  let profile = await findOne(COLLECTIONS.users, { email });
  if (!profile) {
    profile = await createDoc(COLLECTIONS.users, {
      email,
      name,
      role,
      password: await bcrypt.hash(password, 12),
      firebaseUid: firebaseUser.uid,
    });
  }
  return { firebaseUser, profile };
}

async function signInWithPassword(email, password) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error('FIREBASE_WEB_API_KEY is required for email/password login');
    err.status = 503;
    throw err;
  }
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message || 'Invalid credentials');
    err.status = 401;
    throw err;
  }
  return data;
}

router.post('/login',
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional(),
  body('idToken').optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.body.idToken) {
        const decoded = await verifyFirebaseToken(req.body.idToken);
        const profile = await User.findById(decoded.uid) || await User.findOne({ email: decoded.email });
        return res.json({
          token: req.body.idToken,
          user: {
            id: decoded.uid,
            email: decoded.email || profile?.email,
            role: decoded.role || profile?.role || 'admin',
            name: decoded.name || profile?.name || 'Admin',
          },
        });
      }

      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      const demoEmail = (process.env.DEMO_ADMIN_EMAIL || 'demo.admin@anmelinc.com').toLowerCase();
      const demoPassword = process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin@123';

      if (email === demoEmail && password === demoPassword && isDbConnected()) {
        try {
          await ensureFirebaseAdminUser(demoEmail, demoPassword, { name: 'Demo Admin', role: 'admin' });
        } catch { /* Admin SDK optional */ }
      }

      const signIn = await signInWithPassword(email, password);
      const decoded = await verifyFirebaseToken(signIn.idToken);

      let profile = null;
      if (isDbConnected()) {
        profile = await User.findOne({ email }) || await User.findById(decoded.uid);
      }
      if (!profile) {
        const { fetchUserProfileViaRest } = await import('../lib/firebaseRestAuth.js');
        profile = await fetchUserProfileViaRest(decoded.uid, signIn.idToken);
      }

      const isAdmin =
        decoded.role === 'admin' ||
        decoded.admin ||
        profile?.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      return res.json({
        token: signIn.idToken,
        user: {
          id: signIn.localId || decoded.uid,
          email,
          role: 'admin',
          name: profile?.name || signIn.displayName || 'Admin',
        },
      });
    } catch (err) {
      const status = err.status || 401;
      return res.status(status).json({ error: err.message || 'Login failed' });
    }
  },
);

router.post('/register-admin',
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });

    const { name, email, password } = req.body;
    const normalized = email.toLowerCase();
    const existing = await User.findOne({ email: normalized });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const { firebaseUser, profile } = await ensureFirebaseAdminUser(normalized, password, { name, role: 'admin' });
    const signIn = await signInWithPassword(normalized, password);
    publishContentChange('users');
    res.status(201).json({
      token: signIn.idToken,
      user: { id: firebaseUser.uid, email: normalized, role: 'admin', name: profile.name || name },
    });
  },
);

router.get('/me', authMiddleware, async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.userId,
        email: req.auth.email,
        role: req.auth.role || 'admin',
        name: req.auth.name || 'Admin',
      },
    });
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
});

router.patch('/password', authMiddleware, adminOnly,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const email = req.auth.email;
      await signInWithPassword(email, req.body.currentPassword);
      await getAuth().updateUser(req.userId, { password: req.body.newPassword });
      const user = await User.findById(req.userId);
      if (user) {
        await User.findByIdAndUpdate(req.userId, { password: await bcrypt.hash(req.body.newPassword, 12) });
      }
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      res.status(401).json({ error: err.message || 'Current password is incorrect' });
    }
  },
);

router.post('/student/activate',
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const decoded = await verifyFirebaseToken(req.body.token);
      if (decoded.role !== 'student') {
        return res.status(400).json({ error: 'Invalid activation token' });
      }
      await getAuth().updateUser(decoded.uid, { password: req.body.newPassword });
      await User.findByIdAndUpdate(decoded.uid, { password: await bcrypt.hash(req.body.newPassword, 12) });
      return res.json({ activated: true });
    } catch {
      return res.status(401).json({ error: 'Activation link is invalid or expired' });
    }
  },
);

export default router;
