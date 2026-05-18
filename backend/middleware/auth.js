import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intelera-secret-change-in-production';

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    next();
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function adminOnly(req, res, next) {
  if (req.auth?.role === 'admin') {
    req.user = {
      _id: req.auth.userId || 'demo-admin',
      email: req.auth.email || 'demo.admin@intelera.com',
      role: 'admin',
      name: req.auth.name || 'Demo Admin',
    };
    return next();
  }

  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(500).json({ error: 'Authorization failed' });
  }
}

export function signToken(userId) {
  if (typeof userId === 'object' && userId !== null) {
    return jwt.sign(userId, JWT_SECRET, { expiresIn: '7d' });
  }
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
