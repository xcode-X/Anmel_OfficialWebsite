import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware, adminOnly, signToken } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'anmelinc-secret-change-in-production';

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const demoEmail = (process.env.DEMO_ADMIN_EMAIL || 'demo.admin@anmelinc.com').toLowerCase();
    const demoPassword = process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin@123';
    const seededAdminEmail = (process.env.ADMIN_EMAIL || 'admin@anmelinc.com').toLowerCase();
    const seededAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email.toLowerCase() === demoEmail && password === demoPassword) {
      try {
        let demoUser = await User.findOne({ email: demoEmail });
        if (!demoUser) {
          demoUser = await User.create({
            email: demoEmail,
            password: demoPassword,
            name: 'Demo Admin',
            role: 'admin',
          });
        }
        const token = signToken({
          userId: String(demoUser._id),
          email: demoUser.email,
          role: 'admin',
          name: demoUser.name || 'Demo Admin',
        });
        return res.json({ token, user: { id: demoUser._id, email: demoUser.email, role: demoUser.role } });
      } catch {
        const token = signToken({
          userId: 'demo-admin',
          email: demoEmail,
          role: 'admin',
          name: 'Demo Admin',
        });
        return res.json({ token, user: { id: 'demo-admin', email: demoEmail, role: 'admin' } });
      }
    }

    // Allow temporary admin access when database is offline.
    if (mongoose.connection.readyState !== 1) {
      if ((email === seededAdminEmail && password === seededAdminPassword) || (email === demoEmail && password === demoPassword)) {
        const token = signToken({
          userId: 'offline-admin',
          email,
          role: 'admin',
          name: 'Offline Admin',
        });
        return res.json({ token, user: { id: 'offline-admin', email, role: 'admin' } });
      }
      return res.status(401).json({ error: 'Invalid credentials. Use demo.admin@anmelinc.com / DemoAdmin@123 while database is offline.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ userId: String(user._id), email: user.email, role: user.role, name: user.name || '' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  }
);

router.post('/register-admin',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { name, email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database unavailable. Cannot register new admin at this time.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ name, email, password, role: 'admin' });
    const token = signToken({ userId: String(user._id), email: user.email, role: 'admin', name: user.name });
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  }
);


router.get('/me', authMiddleware, adminOnly, async (req, res) => {
  res.json({ user: req.user });
});

router.patch('/password', authMiddleware, adminOnly,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  }
);

router.post('/student/activate',
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, newPassword } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Activation link is invalid or expired' });
    }

    if (decoded.purpose !== 'student-activate' || decoded.role !== 'student') {
      return res.status(400).json({ error: 'Invalid activation token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') return res.status(404).json({ error: 'Student account not found' });
    user.password = newPassword;
    await user.save();
    return res.json({ activated: true });
  }
);

export default router;
