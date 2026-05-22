import { Router } from 'express';
import Course from '../models/Course.js';
import { optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';

const router = Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const q = req.auth?.role === 'admin' ? {} : { published: true };
    const items = await withDbQuery(
      () => Course.find(q).sort({ order: 1, title: 1 }).maxTimeMS(8000).lean(),
      { fallback: [], label: 'courses list', timeoutMs: 10000 },
    );
    res.json(Array.isArray(items) ? items : []);
  } catch (err) {
    console.warn('[courses] GET / failed:', err.message);
    res.json([]);
  }
});

router.get('/:slug', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
    const item = await withDbQuery(
      () => Course.findOne({ slug: req.params.slug }).maxTimeMS(8000).lean(),
      { fallback: null, label: 'course by slug', timeoutMs: 10000 },
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.warn('[courses] GET /:slug failed:', err.message);
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
