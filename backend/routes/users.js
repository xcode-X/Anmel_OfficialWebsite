import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const users = await User.find().select('-password').lean();
  res.json(users);
});

export default router;
