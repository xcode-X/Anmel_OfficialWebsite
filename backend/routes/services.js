import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Service from '../models/Service.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';

const router = Router();

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

router.get('/', optionalAuth, async (req, res) => {
  const q = req.userId ? {} : { published: true };
  const items = await withDbQuery(
    () => Service.find(q).sort({ order: 1 }).maxTimeMS(8000).lean(),
    { fallback: [], label: 'services list' }
  );
  res.json(items);
});

router.get('/:slug', async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const item = await Service.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', authMiddleware, adminOnly,
  body('title').notEmpty().trim(),
  body('shortDescription').optional().trim(),
  body('description').optional().trim(),
  body('outcomes').optional().trim(),
  body('icon').optional().trim(),
  body('features').optional().isArray(),
  body('process').optional().isArray(),
  body('order').optional().isInt(),
  body('published').optional().isBoolean(),
  body('image').optional().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = { ...req.body, slug: req.body.slug || slugify(req.body.title) };
    const item = await Service.create(data);
    publishContentChange('services');
    res.status(201).json(item);
  }
);

router.put('/:id', authMiddleware, adminOnly,
  body('title').optional().notEmpty().trim(),
  body('slug').optional().trim(),
  body('shortDescription').optional().trim(),
  body('description').optional().trim(),
  body('outcomes').optional().trim(),
  body('icon').optional().trim(),
  body('features').optional().isArray(),
  body('process').optional().isArray(),
  body('order').optional().isInt(),
  body('published').optional().isBoolean(),
  body('image').optional().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const item = await Service.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    publishContentChange('services');
    res.json(item);
  }
);

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const item = await Service.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  publishContentChange('services');
  res.json({ deleted: true });
});

export default router;
