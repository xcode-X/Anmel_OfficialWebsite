import { verifyFirebaseToken } from '../middleware/auth.js';
import { isDbConnected } from './dbReady.js';
import {
  fetchUserProfileViaRest,
  isWhitelistedAdminEmail,
} from './firebaseRestAuth.js';
import User from '../models/User.js';

export async function assertAdminFromToken(token) {
  const decoded = await verifyFirebaseToken(token);

  if (decoded.role === 'admin' || decoded.admin) {
    return { userId: decoded.uid, email: decoded.email, role: 'admin', name: decoded.name };
  }

  if (isDbConnected()) {
    const user = await User.findById(decoded.uid);
    if (user?.role === 'admin') {
      return { userId: decoded.uid, email: user.email, role: 'admin', name: user.name };
    }
  }

  const profile = await fetchUserProfileViaRest(decoded.uid, token);
  if (profile?.role === 'admin') {
    return {
      userId: decoded.uid,
      email: profile.email || decoded.email,
      role: 'admin',
      name: profile.name || 'Admin',
    };
  }

  if (isWhitelistedAdminEmail(decoded.email)) {
    return { userId: decoded.uid, email: decoded.email, role: 'admin', name: decoded.name || 'Admin' };
  }

  const err = new Error('Admin access required');
  err.status = 403;
  throw err;
}
