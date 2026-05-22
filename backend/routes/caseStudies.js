import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import CaseStudy from '../models/CaseStudy.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { sendRouteError } from '../lib/asyncHandler.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { formatMongoError } from '../lib/mongoErrors.js';
import { publishCaseStudyToSocial } from '../lib/socialPublisher.js';
import { streamMediaValue } from '../lib/fileStorage.js';
import { coverApiPath, hasMediaValue, remoteMediaUrl } from '../lib/contentListHelpers.js';

const router = Router();

function isAdminRequest(req) {
  return req.auth?.role === 'admin';
}

function listFilter(req) {
  const q = {};
  if (!isAdminRequest(req)) q.published = true;
  return q;
}

function toPublicCaseStudyListItem(item) {
  const remote = remoteMediaUrl(item.image);
  const hasImage = hasMediaValue(item.image);
  const { image: _img, ...rest } = item;
  return {
    ...rest,
    hasImage,
    image: remote || (hasImage && item.slug ? coverApiPath('/api/case-studies', item.slug) : undefined),
  };
}

function toPublicCaseStudyDetail(item) {
  return toPublicCaseStudyListItem(item);
}

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function resolveUniqueSlug(baseSlug, excludeId = null) {
  const root = (baseSlug || 'case-study').trim() || 'case-study';
  for (let n = 0; n < 100; n += 1) {
    const candidate = n === 0 ? root : `${root}-${n + 1}`;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await CaseStudy.findOne(q).select('_id').lean();
    if (!exists) return candidate;
  }
  return `${root}-${Date.now()}`;
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const q = listFilter(req);
    const category = req.query.category;
    if (category) q.category = category;

    const items = await withDbQuery(
      () =>
        CaseStudy.find(q)
          .select('-image')
          .sort({ order: 1, createdAt: -1 })
          .maxTimeMS(8000)
          .lean(),
      { fallback: [], label: 'case-studies list', timeoutMs: 12000 },
    );

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(
      (Array.isArray(items) ? items : []).map((row) => {
        const hasImage = Boolean(row.hasImage);
        return {
          ...row,
          hasImage,
          image: hasImage && row.slug ? coverApiPath('/api/case-studies', row.slug) : undefined,
        };
      }),
    );
  } catch (err) {
    console.warn('[case-studies] GET / failed:', err.message);
    res.json([]);
  }
});

router.get('/:slug/cover', optionalAuth, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).end();
    const q = { slug: req.params.slug };
    if (!isAdminRequest(req)) q.published = true;
    const item = await CaseStudy.findOne(q).select('image').maxTimeMS(5000).lean();
    if (!item?.image) return res.status(404).end();
    const ok = await streamMediaValue(res, item.image);
    if (!ok) return res.status(404).end();
  } catch (err) {
    console.warn('[case-studies] GET /:slug/cover failed:', err.message);
    if (!res.headersSent) res.status(400).end();
  }
});

router.get('/:slug', optionalAuth, async (req, res) => {
  if (!isDbConnected()) return res.status(404).json({ error: 'Not found' });
  const item = await CaseStudy.findOne({ slug: req.params.slug }).lean();
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (!item.published && !isAdminRequest(req)) return res.status(404).json({ error: 'Not found' });
  if (isAdminRequest(req)) return res.json(item);
  res.json(toPublicCaseStudyDetail(item));
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
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database temporarily unavailable. Please try again in a moment.' });
    }
    try {
      const baseSlug = (req.body.slug || slugify(req.body.title)).trim() || 'case-study';
      const slug = await resolveUniqueSlug(baseSlug);
      const slugAdjusted = slug !== baseSlug;
      const imageVal = String(req.body.image || '').trim();
      const item = await CaseStudy.create({
        ...req.body,
        slug,
        hasImage: hasMediaValue(imageVal),
      });
      publishContentChange('case-studies');
      const payload = item.toObject();
      res.status(201).json({
        ...payload,
        slugAdjusted,
        ...(slugAdjusted ? { requestedSlug: baseSlug } : {}),
      });
    } catch (err) {
      return sendRouteError(res, err, { scope: 'case-studies/create' });
    }
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
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Database temporarily unavailable. Please try again in a moment.' });
    }
    try {
      const patch = { ...req.body, updatedAt: new Date() };
      if (req.body.image !== undefined) {
        patch.hasImage = hasMediaValue(String(req.body.image || '').trim());
      }
      const item = await CaseStudy.findByIdAndUpdate(req.params.id, patch, { new: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      publishContentChange('case-studies');
      res.json(item);
    } catch (err) {
      return sendRouteError(res, err, { scope: 'case-studies/update' });
    }
  }
);

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const item = await CaseStudy.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  publishContentChange('case-studies');
  res.json({ deleted: true });
});

router.post('/:id/share', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database temporarily unavailable. Please try again in a moment.' });
  }
  try {
    const item = await CaseStudy.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!item.published) {
      return res.status(400).json({ error: 'Publish the case study on the public site before sharing to social media.' });
    }
    const payload = await publishCaseStudyToSocial(item);
    res.json(payload);
  } catch (err) {
    console.warn('[case-studies] POST /:id/share failed:', err.message);
    res.status(503).json({ error: err.message || 'Social publish failed' });
  }
});

export default router;
