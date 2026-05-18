import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import CaseStudy from '../models/CaseStudy.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';

const router = Router();

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

router.get('/', optionalAuth, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const category = req.query.category;
  const q = req.userId ? {} : { published: true };
  if (category) q.category = category;
  const items = await CaseStudy.find(q).sort({ order: 1, createdAt: -1 }).lean();
  res.json(items);
});

router.get('/:slug', async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const item = await CaseStudy.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', authMiddleware, adminOnly,
  body('title').notEmpty().trim(),
  body('category').optional().trim(),
  body('client').optional().trim(),
  body('challenge').optional().trim(),
  body('solution').optional().trim(),
  body('results').optional().trim(),
  body('metrics').optional().isArray(),
  body('image').optional().trim(),
  body('excerpt').optional().trim(),
  body('resultSnippet').optional().trim(),
  body('duration').optional().trim(),
  body('clientSector').optional().trim(),
  body('accent').optional().trim(),
  body('published').optional().isBoolean(),
  body('order').optional().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = { ...req.body, slug: req.body.slug || slugify(req.body.title) };
    const item = await CaseStudy.create(data);
    publishContentChange('case-studies');
    res.status(201).json(item);
  }
);

router.put('/:id', authMiddleware, adminOnly,
  body('title').optional().notEmpty().trim(),
  body('slug').optional().trim(),
  body('category').optional().trim(),
  body('client').optional().trim(),
  body('challenge').optional().trim(),
  body('solution').optional().trim(),
  body('results').optional().trim(),
  body('metrics').optional().isArray(),
  body('image').optional().trim(),
  body('excerpt').optional().trim(),
  body('resultSnippet').optional().trim(),
  body('duration').optional().trim(),
  body('clientSector').optional().trim(),
  body('accent').optional().trim(),
  body('published').optional().isBoolean(),
  body('order').optional().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const item = await CaseStudy.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    publishContentChange('case-studies');
    res.json(item);
  }
);

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const item = await CaseStudy.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  publishContentChange('case-studies');
  res.json({ deleted: true });
});

export default router;
