import { Router } from 'express';
import ScholarshipApplication from '../models/ScholarshipApplication.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';
import { resolvePublicMediaUrl } from '../lib/fileStorage.js';
import { STUDENT_DOC_FIELDS } from '../lib/mediaFields.js';

const router = Router();

function toApplicationListItem(app) {
  const submittedDocFields = STUDENT_DOC_FIELDS.filter((f) => app[f]);
  const lean = { ...app };
  for (const f of STUDENT_DOC_FIELDS) delete lean[f];
  return {
    ...lean,
    submittedDocFields,
    documentsCount: submittedDocFields.length,
  };
}

function withResolvedDocUrls(req, row) {
  if (!row) return row;
  const out = { ...row };
  for (const f of STUDENT_DOC_FIELDS) {
    if (out[f]) out[f] = resolvePublicMediaUrl(req, out[f]);
  }
  out.submittedDocFields = STUDENT_DOC_FIELDS.filter((f) => !!row[f]);
  return out;
}

/** Admin: all scholarship applications across listings. */
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const applications = await ScholarshipApplication.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(applications.map(toApplicationListItem));
  } catch (err) {
    console.warn('[scholarship-applications] GET / failed:', err.message);
    res.status(503).json({ error: err?.message || 'Could not load applications' });
  }
});

/** Admin: single application with document URLs. */
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const app = await ScholarshipApplication.findById(req.params.id).lean();
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(withResolvedDocUrls(req, app));
  } catch (err) {
    console.warn('[scholarship-applications] GET /:id failed:', err.message);
    res.status(400).json({ error: 'Invalid application id' });
  }
});

export default router;
