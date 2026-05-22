import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import BlogPost from '../models/BlogPost.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { persistMediaValue, streamMediaValue } from '../lib/fileStorage.js';
import {
  coverApiPath,
  extractFirstImageFromHtml,
  hasMediaValue,
  remoteMediaUrl,
  resolveBlogCoverSource,
} from '../lib/contentListHelpers.js';
import { sendRouteError } from '../lib/asyncHandler.js';
import { logError } from '../lib/logger.js';

const router = Router();

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function isAdminRequest(req) {
  return req.auth?.role === 'admin';
}

function listFilter(req) {
  const q = {};
  if (!isAdminRequest(req)) q.published = true;
  return q;
}

async function persistBlogPayload(body) {
  const slug = (body.slug || slugify(body.title || '')).trim() || 'post';
  let featuredImage = String(body.featuredImage || '').trim();
  if (!featuredImage && body.content) {
    featuredImage = extractFirstImageFromHtml(body.content);
  }
  if (featuredImage && hasMediaValue(featuredImage)) {
    featuredImage = await persistMediaValue(featuredImage, {
      category: 'blog',
      fileId: `blog-${slug}`,
    });
  }
  return { ...body, slug, featuredImage: featuredImage || '' };
}

function toPublicBlogListItem(post, { hasImage, remoteThumb } = {}) {
  const remote = remoteThumb || remoteMediaUrl(post.featuredImage);
  const showCover = hasImage ?? hasMediaValue(resolveBlogCoverSource(post));
  const { content: _c, featuredImage: _f, ...rest } = post;
  return {
    ...rest,
    hasFeaturedImage: Boolean(showCover),
    image: remote || (showCover && post.slug ? coverApiPath('/api/blog', post.slug) : undefined),
    featuredImage: remote,
  };
}

function toPublicBlogDetail(post) {
  const hasImage = hasMediaValue(resolveBlogCoverSource(post));
  return {
    ...toPublicBlogListItem(post, { hasImage }),
    content: post.content || '',
  };
}

async function loadSlugsWithImages(q) {
  const [withFeatured, withInline] = await Promise.all([
    withDbQuery(
      () =>
        BlogPost.find({ ...q, featuredImage: { $exists: true, $nin: [null, ''] } })
          .select('slug featuredImage')
          .maxTimeMS(5000)
          .lean(),
      { fallback: [], label: 'blog featured slugs', timeoutMs: 8000 },
    ),
    withDbQuery(
      () =>
        BlogPost.find({ ...q, content: { $regex: /<img\s/i } })
          .select('slug')
          .maxTimeMS(5000)
          .lean(),
      { fallback: [], label: 'blog inline image slugs', timeoutMs: 8000 },
    ),
  ]);

  const slugs = new Set();
  for (const row of withFeatured) {
    if (hasMediaValue(row.featuredImage)) slugs.add(row.slug);
  }
  for (const row of withInline) slugs.add(row.slug);
  return slugs;
}

router.get('/', optionalAuth, async (req, res) => {
  try {
  const q = listFilter(req);
  const category = req.query.category;
  if (category) q.category = category;

  const posts = await withDbQuery(
    () =>
      BlogPost.find(q)
        .select('-content -featuredImage')
        .sort({ publishedAt: -1, createdAt: -1 })
        .maxTimeMS(8000)
        .lean(),
    { fallback: [], label: 'blog list', timeoutMs: 12000 },
  );

  const slugsWithImage = await loadSlugsWithImages(q);

  const remoteRows = await withDbQuery(
    () =>
      BlogPost.find({ ...q, featuredImage: /^https?:\/\//i })
        .select('slug featuredImage')
        .maxTimeMS(5000)
        .lean(),
    { fallback: [], label: 'blog remote images', timeoutMs: 8000 },
  );
  const remoteBySlug = new Map(remoteRows.map((r) => [r.slug, r.featuredImage]));

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  res.json(
    posts.map((row) => {
      const remote = remoteBySlug.get(row.slug);
      const hasImage = slugsWithImage.has(row.slug);
      return {
        ...row,
        hasFeaturedImage: hasImage,
        image: remote || (hasImage ? coverApiPath('/api/blog', row.slug) : undefined),
        featuredImage: remote,
      };
    }),
  );
  } catch (err) {
    logError('blog/list', err);
    return res.json([]);
  }
});

router.get('/featured', async (req, res) => {
  const q = { published: true };
  const posts = await withDbQuery(
    () =>
      BlogPost.find(q)
        .select('-content -featuredImage')
        .sort({ publishedAt: -1 })
        .limit(3)
        .maxTimeMS(8000)
        .lean(),
    { fallback: [], label: 'blog featured', timeoutMs: 12000 },
  );

  const slugsWithImage = await loadSlugsWithImages(q);

  res.json(
    posts.map((row) => ({
      ...row,
      hasFeaturedImage: slugsWithImage.has(row.slug),
      image: slugsWithImage.has(row.slug) ? coverApiPath('/api/blog', row.slug) : undefined,
    })),
  );
});

router.get('/:slug/cover', optionalAuth, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).end();
    const q = { slug: req.params.slug };
    if (!isAdminRequest(req)) q.published = true;
    const post = await BlogPost.findOne(q)
      .select('featuredImage content')
      .maxTimeMS(8000)
      .lean();
    const source = resolveBlogCoverSource(post);
    if (!source) return res.status(404).end();
    const ok = await streamMediaValue(res, source);
    if (!ok) return res.status(404).end();
  } catch (err) {
    console.warn('[blog] GET /:slug/cover failed:', err.message);
    if (!res.headersSent) res.status(400).end();
  }
});

/** Increment view count (public). Must be registered before GET /:slug. */
router.post('/:slug/view', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const post = await BlogPost.findOneAndUpdate(
    { slug: req.params.slug, published: true },
    { $inc: { views: 1 }, updatedAt: new Date() },
    { new: true },
  ).lean();
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json({ views: post.views });
});

router.get('/:slug', optionalAuth, async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (!post.published && !isAdminRequest(req)) return res.status(404).json({ error: 'Not found' });
  if (isAdminRequest(req)) return res.json(post);
  res.json(toPublicBlogDetail(post));
});

router.post('/', authMiddleware, adminOnly,
  body('title').notEmpty().trim(),
  body('excerpt').optional().trim(),
  body('content').optional(),
  body('category').optional().trim(),
  body('featuredImage').optional(),
  body('author').optional().trim(),
  body('published').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    try {
      const data = await persistBlogPayload(req.body);
      if (data.published) data.publishedAt = new Date();
      const post = await BlogPost.create(data);
      publishContentChange('blog');
      res.status(201).json(post);
    } catch (err) {
      console.warn('[blog] POST failed:', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Could not create post' });
    }
  }
);

router.put('/:id', authMiddleware, adminOnly,
  body('title').optional().notEmpty().trim(),
  body('slug').optional().trim(),
  body('excerpt').optional().trim(),
  body('content').optional(),
  body('category').optional().trim(),
  body('featuredImage').optional(),
  body('published').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    try {
      const existing = await BlogPost.findById(req.params.id).lean();
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const merged = { ...existing, ...req.body };
      const normalized = await persistBlogPayload(merged);
      const update = {
        title: normalized.title,
        slug: normalized.slug,
        excerpt: normalized.excerpt,
        content: normalized.content,
        category: normalized.category,
        featuredImage: normalized.featuredImage,
        author: normalized.author,
        published: normalized.published,
        updatedAt: new Date(),
      };
      if (req.body.published) update.publishedAt = update.publishedAt || existing.publishedAt || new Date();
      const post = await BlogPost.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
      publishContentChange('blog');
      res.json(post);
    } catch (err) {
      console.warn('[blog] PUT failed:', err.message);
      res.status(err.status || 500).json({ error: err.message || 'Could not update post' });
    }
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
