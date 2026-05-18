import { Router } from 'express';
import Course from '../models/Course.js';
import { optionalAuth } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const q = req.userId ? {} : { published: true };
  const items = await Course.find(q).sort({ order: 1, title: 1 }).lean();
  res.json(items);
});

router.get('/:slug', async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const item = await Course.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

export default router;
