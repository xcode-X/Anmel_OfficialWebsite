import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import ContactSubmission from '../models/ContactSubmission.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { sendRouteError } from '../lib/asyncHandler.js';
import { publishContentChange } from '../lib/contentStreamHub.js';

const router = Router();

router.post('/',
  body('name').notEmpty().trim().isLength({ max: 200 }),
  body('email').isEmail().normalizeEmail(),
  body('company').optional().trim().isLength({ max: 200 }),
  body('phone').optional().trim().isLength({ max: 50 }),
  body('subject').optional().trim().isLength({ max: 200 }),
  body('message').notEmpty().trim().isLength({ max: 5000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Contact service is temporarily unavailable. Please try again shortly.' });
    const submission = await ContactSubmission.create(req.body);
    publishContentChange('contacts');
    res.status(201).json({ id: submission._id, message: 'Thank you. We will get back to you soon.' });
  }
);

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  try {
    const list = await withDbQuery(
      () => ContactSubmission.find().sort({ createdAt: -1 }).maxTimeMS(8000).lean(),
      { fallback: [], label: 'contacts list', timeoutMs: 10000 },
    );
    res.json(list);
  } catch (err) {
    return sendRouteError(res, err, { scope: 'contact/list' });
  }
});

router.patch('/:id/read', authMiddleware, adminOnly, async (req, res) => {
  const sub = await ContactSubmission.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!sub) return res.status(404).json({ error: 'Not found' });
  publishContentChange('contacts');
  res.json(sub);
});

export default router;
