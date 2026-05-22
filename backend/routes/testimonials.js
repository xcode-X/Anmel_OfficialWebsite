import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { withDbQuery } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const ts = await withDbQuery(
      () => Testimonial.find().sort({ createdAt: -1 }).maxTimeMS(8000).lean(),
      { fallback: [], label: 'testimonials list' },
    );
    res.json(ts);
  } catch (err) {
    console.warn('[testimonials] GET failed:', err.message);
    res.json([]);
  }
});

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    publishContentChange('testimonials');
    res.status(201).json(t);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    publishContentChange('testimonials');
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

export default router;
