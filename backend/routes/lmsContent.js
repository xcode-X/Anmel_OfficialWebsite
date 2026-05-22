import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import LmsContent from '../models/LmsContent.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { bumpRealtime } from '../lib/firestoreDb.js';

const router = Router();
const listeners = new Set();
const scheduledJobs = new Map();

function slugify(s) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function publishChange() {
  bumpRealtime('lms-content');
  const payload = JSON.stringify({ event: 'changed', ts: Date.now() });
  for (const client of listeners) {
    client.write(`data: ${payload}\n\n`);
  }
}

function clearScheduledJob(id) {
  const job = scheduledJobs.get(String(id));
  if (job) {
    clearTimeout(job);
    scheduledJobs.delete(String(id));
  }
}

async function publishIfDue(id) {
  clearScheduledJob(id);
  const item = await LmsContent.findById(id);
  if (!item) return;
  if (item.published) return;
  if (!item.scheduledPublishAt) return;
  if (item.scheduledPublishAt > new Date()) return;
  item.published = true;
  item.publishedAt = item.scheduledPublishAt;
  item.updatedAt = new Date();
  await item.save();
  publishChange();
}

function schedulePublication(item) {
  clearScheduledJob(item._id);
  if (!item.scheduledPublishAt || item.published) return;
  const delay = new Date(item.scheduledPublishAt).getTime() - Date.now();
  if (delay <= 0) {
    publishIfDue(item._id).catch(() => {});
    return;
  }
  const job = setTimeout(() => {
    publishIfDue(item._id).catch(() => {});
  }, delay);
  scheduledJobs.set(String(item._id), job);
}

async function syncScheduledPublications() {
  const items = await LmsContent.find({
    published: false,
    scheduledPublishAt: { $ne: null },
  }).select('_id scheduledPublishAt published').lean();
  for (const item of items) {
    schedulePublication(item);
  }
}

setInterval(() => {
  syncScheduledPublications().catch(() => {});
}, 60000);
syncScheduledPublications().catch(() => {});

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ event: 'connected', ts: Date.now() })}\n\n`);
  listeners.add(res);

  const keepAlive = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    listeners.delete(res);
  });
});

router.get('/', optionalAuth, async (req, res) => {
  // Run due publishes in the background — never block the list response
  if (isDbConnected()) {
    withDbQuery(
      () => LmsContent.find({
        published: false,
        scheduledPublishAt: { $ne: null, $lte: new Date() },
      }).select('_id').maxTimeMS(3000).lean(),
      { fallback: [], label: 'lms due publish', timeoutMs: 3000 }
    ).then((due) => {
      for (const item of due || []) {
        publishIfDue(item._id).catch(() => {});
      }
    }).catch(() => {});
  }

  const q = req.userId || req.query.published === 'false' ? {} : { published: true };
  const items = await withDbQuery(
    () => LmsContent.find(q).sort({ publishedAt: -1, createdAt: -1 }).maxTimeMS(8000).lean(),
    { fallback: [], label: 'lms-content list' }
  );
  res.json(items);
});

router.post('/',
  authMiddleware,
  adminOnly,
  body('title').notEmpty().trim(),
  body('contentType').isIn(['video', 'document', 'lesson']),
  body('courseSlug').optional().trim(),
  body('moduleLabel').optional().trim(),
  body('description').optional().trim(),
  body('mediaUrl').optional().trim(),
  body('durationMin').optional().isInt({ min: 0 }),
  body('recordedAt').optional().trim(),
  body('published').optional().isBoolean(),
  body('scheduledPublishAt').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = {
      ...req.body,
      slug: req.body.slug || slugify(req.body.title),
      updatedAt: new Date(),
    };
    if (payload.published) {
      payload.publishedAt = new Date();
      payload.scheduledPublishAt = null;
    } else if (payload.scheduledPublishAt) {
      payload.scheduledPublishAt = new Date(payload.scheduledPublishAt);
    }
    const item = await LmsContent.create(payload);
    schedulePublication(item);
    publishChange();
    res.status(201).json(item);
  }
);

router.post('/bulk',
  authMiddleware,
  adminOnly,
  body('items').isArray({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const items = [];
    for (const raw of req.body.items) {
      if (!raw?.title || !['video', 'document', 'lesson'].includes(raw?.contentType)) {
        continue;
      }
      const payload = {
        title: String(raw.title),
        slug: raw.slug ? String(raw.slug) : slugify(String(raw.title)),
        contentType: raw.contentType,
        courseSlug: raw.courseSlug ? String(raw.courseSlug) : 'general',
        moduleLabel: raw.moduleLabel ? String(raw.moduleLabel) : '',
        description: raw.description ? String(raw.description) : '',
        mediaUrl: raw.mediaUrl ? String(raw.mediaUrl) : '',
        durationMin: Number(raw.durationMin || 0),
        recordedAt: raw.recordedAt ? String(raw.recordedAt) : '',
        published: Boolean(raw.published),
        publishedAt: raw.published ? new Date() : null,
        scheduledPublishAt: raw.published
          ? null
          : raw.scheduledPublishAt
            ? new Date(raw.scheduledPublishAt)
            : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      items.push(payload);
    }

    if (!items.length) return res.status(400).json({ error: 'No valid items in bulk payload' });
    const created = await LmsContent.insertMany(items, { ordered: false });
    for (const item of created) schedulePublication(item);
    publishChange();
    res.status(201).json({ created: created.length });
  }
);

router.put('/:id',
  authMiddleware,
  adminOnly,
  body('title').optional().notEmpty().trim(),
  body('contentType').optional().isIn(['video', 'document', 'lesson']),
  body('courseSlug').optional().trim(),
  body('moduleLabel').optional().trim(),
  body('description').optional().trim(),
  body('mediaUrl').optional().trim(),
  body('durationMin').optional().isInt({ min: 0 }),
  body('recordedAt').optional().trim(),
  body('published').optional().isBoolean(),
  body('scheduledPublishAt').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const update = { ...req.body, updatedAt: new Date() };
    if (update.published) {
      update.publishedAt = new Date();
      update.scheduledPublishAt = null;
    } else if (update.scheduledPublishAt) {
      update.scheduledPublishAt = new Date(update.scheduledPublishAt);
    } else if (Object.hasOwn(update, 'scheduledPublishAt') && !update.scheduledPublishAt) {
      update.scheduledPublishAt = null;
    }
    const item = await LmsContent.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    schedulePublication(item);
    publishChange();
    res.json(item);
  }
);

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const item = await LmsContent.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  clearScheduledJob(req.params.id);
  publishChange();
  res.json({ deleted: true });
});

export default router;
