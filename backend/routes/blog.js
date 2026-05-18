import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import BlogPost from '../models/BlogPost.js';
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
  const published = req.query.published !== 'false' && !req.userId;
  const q = published ? { published: true } : {};
  if (category) q.category = category;
  const posts = await BlogPost.find(q).sort({ publishedAt: -1, createdAt: -1 }).lean();
  res.json(posts);
});

router.get('/featured', async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1 }).limit(3).lean();
  res.json(posts);
});

/** Increment view count (public). Must be registered before GET /:slug. */
router.post('/:slug/view', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const post = await BlogPost.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 }, updatedAt: new Date() },
    { new: true },
  ).lean();
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json({ views: post.views });
});

router.get('/:slug', async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

router.post('/', authMiddleware, adminOnly,
  body('title').notEmpty().trim(),
  body('excerpt').optional().trim(),
  body('content').optional().trim(),
  body('category').optional().trim(),
  body('featuredImage').optional().trim(),
  body('author').optional().trim(),
  body('published').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const data = { ...req.body, slug: req.body.slug || slugify(req.body.title) };
    if (data.published) data.publishedAt = new Date();
    const post = await BlogPost.create(data);
    publishContentChange('blog');
    res.status(201).json(post);
  }
);

router.put('/:id', authMiddleware, adminOnly,
  body('title').optional().notEmpty().trim(),
  body('slug').optional().trim(),
  body('excerpt').optional().trim(),
  body('content').optional().trim(),
  body('category').optional().trim(),
  body('featuredImage').optional().trim(),
  body('published').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const update = { ...req.body, updatedAt: new Date() };
    // Set publishedAt when publishing for the first time; use $exists check via the update payload.
    if (req.body.published) update.publishedAt = update.publishedAt || new Date();
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: update, ...(req.body.published ? { $setOnInsert: {} } : {}) },
      { new: true },
    );
    if (!post) return res.status(404).json({ error: 'Not found' });
    publishContentChange('blog');
    res.json(post);
  }
);

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  publishContentChange('blog');
  res.json({ deleted: true });
});

export default router;
