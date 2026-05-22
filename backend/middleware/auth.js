import { getAuth } from '../config/firebase.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { db, COLLECTIONS } from '../lib/firestoreDb.js';
import { logError } from '../lib/logger.js';
import {
  isFirebaseAdminSdkAvailable,
  verifyIdTokenViaRest,
  fetchUserProfileViaRest,
  isWhitelistedAdminEmail,
} from '../lib/firebaseRestAuth.js';

const User = db(COLLECTIONS.users);

function bearerToken(req) {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

function applyAuth(req, decoded) {
  req.userId = decoded.uid;
  req.auth = {
    userId: decoded.uid,
    email: decoded.email,
    role: decoded.role || (decoded.admin ? 'admin' : decoded.agent ? 'agent' : undefined),
    name: decoded.name,
  };
}

export async function verifyFirebaseToken(token) {
  if (isFirebaseAdminSdkAvailable()) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        admin: decoded.admin,
        agent: decoded.agent,
        name: decoded.name,
      };
    } catch (e) {
      if (e.code === 'auth/id-token-expired') throw e;
      // Fall through to REST if Admin SDK rejects unexpectedly
    }
  }
  return verifyIdTokenViaRest(token);
}

export function optionalAuth(req, res, next) {
  const token = bearerToken(req);
  if (!token) return next();
  verifyFirebaseToken(token)
    .then((decoded) => {
      applyAuth(req, decoded);
      next();
    })
    .catch(() => next());
}

export function authMiddleware(req, res, next) {
  const token = bearerToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  verifyFirebaseToken(token)
    .then((decoded) => {
      applyAuth(req, decoded);
      next();
    })
    .catch((e) => {
      const message = e.code === 'auth/id-token-expired' ? 'Session expired' : 'Invalid or expired token';
      return res.status(401).json({ error: message });
    });
}

async function resolveAdminUser(req, token) {
  if (req.auth?.role === 'admin') {
    return {
      _id: req.auth.userId,
      email: req.auth.email || '',
      role: 'admin',
      name: req.auth.name || 'Admin',
    };
  }

  if (isDbConnected()) {
    const user = await withDbQuery(
      () => User.findById(req.userId),
      { fallback: null, label: 'admin auth lookup', timeoutMs: 8000 },
    );
    if (user?.role === 'admin') return user;
  }

  if (token) {
    const profile = await fetchUserProfileViaRest(req.userId, token);
    if (profile?.role === 'admin') {
      return {
        _id: req.userId,
        email: profile.email || req.auth?.email || '',
        role: 'admin',
        name: profile.name || 'Admin',
      };
    }
  }

  if (isWhitelistedAdminEmail(req.auth?.email)) {
    return {
      _id: req.userId,
      email: req.auth.email,
      role: 'admin',
      name: req.auth.name || 'Admin',
    };
  }

  return null;
}

export async function adminOnly(req, res, next) {
  try {
    const token = bearerToken(req);
    const user = await resolveAdminUser(req, token);
    if (!user) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (err) {
    logError('adminOnly', err, { path: req.path });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Issue Firebase custom token (agents / legacy). Requires Admin SDK. */
export async function createCustomToken(uid, claims = {}) {
  return getAuth().createCustomToken(uid, claims);
}
