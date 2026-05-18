import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentRegistration from '../models/StudentRegistration.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { notifyStudentProvisioned } from '../lib/notifyStudent.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();
const listeners = new Set();

// Document field names — used to strip blobs from list responses and compute submittedDocFields
const DOC_FIELDS = [
  'passportPhoto', 'oLevelCertificate', 'aLevelCertificate', 'highSchoolDiploma',
  'waecResult', 'academicTranscript', 'bachelorDegree', 'masterDegree',
  'englishProficiency', 'healthCertificate', 'passportBioPage',
  'recommendationLetters', 'personalStatement', 'cvResume', 'otherDocuments',
];

function emitChanged() {
  const payload = JSON.stringify({ event: 'changed', ts: Date.now() });
  for (const client of listeners) {
    client.write(`data: ${payload}\n\n`);
  }
}

function randomPassword() {
  return `Stu!${Math.random().toString(36).slice(2, 6)}${Math.random().toString(36).slice(2, 6)}`;
}

function buildStudentActivationUrl(user) {
  const payload = {
    userId: String(user._id),
    email: user.email,
    role: 'student',
    purpose: 'student-activate',
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'intelera-secret-change-in-production', { expiresIn: '72h' });
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientBase}/student/access?token=${encodeURIComponent(token)}`;
}

// ── SSE stream ────────────────────────────────────────────────────────────────
router.get('/stream', async (req, res) => {
  const token = req.query.token;
  if (!token || typeof token !== 'string') return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'intelera-secret-change-in-production');
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ event: 'connected', ts: Date.now() })}\n\n`);
  listeners.add(res);

  const keepAlive = setInterval(() => res.write(`: ping ${Date.now()}\n\n`), 25000);
  req.on('close', () => {
    clearInterval(keepAlive);
    listeners.delete(res);
  });
});

// ── Public submit ─────────────────────────────────────────────────────────────
router.post('/',
  body('fullName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('courseSlug').optional().trim(),
  body('country').optional().trim(),
  body('educationLevel').optional().trim(),
  body('experienceLevel').optional().trim(),
  body('preferredLearningMode').optional().trim(),
  body('preferredStartWindow').optional().trim(),
  body('motivation').optional().trim(),
  async (req, res) => {
    if (!isDbConnected()) {
      return res.status(503).json({ error: 'Admissions service is temporarily unavailable. Please try again shortly.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = {
      fullName:              req.body.fullName,
      email:                 req.body.email,
      phone:                 req.body.phone || '',
      courseSlug:            req.body.courseSlug || 'general',
      country:               req.body.country || '',
      educationLevel:        req.body.educationLevel || '',
      experienceLevel:       req.body.experienceLevel || '',
      preferredLearningMode: req.body.preferredLearningMode || '',
      preferredStartWindow:  req.body.preferredStartWindow || '',
      motivation:            req.body.motivation || '',
      university:            req.body.university || '',
      course:                req.body.course || '',
      degreeLevel:           req.body.degreeLevel || '',
      intake:                req.body.intake || '',
      studyMode:             req.body.studyMode || '',
      campus:                req.body.campus || '',
      passportPhoto:         req.body.passportPhoto || '',
      oLevelCertificate:     req.body.oLevelCertificate || '',
      aLevelCertificate:     req.body.aLevelCertificate || '',
      highSchoolDiploma:     req.body.highSchoolDiploma || '',
      waecResult:            req.body.waecResult || '',
      academicTranscript:    req.body.academicTranscript || '',
      bachelorDegree:        req.body.bachelorDegree || '',
      masterDegree:          req.body.masterDegree || '',
      englishProficiency:    req.body.englishProficiency || '',
      healthCertificate:     req.body.healthCertificate || '',
      passportBioPage:       req.body.passportBioPage || '',
      recommendationLetters: req.body.recommendationLetters || '',
      personalStatement:     req.body.personalStatement || '',
      cvResume:              req.body.cvResume || '',
      otherDocuments:        req.body.otherDocuments || '',
      updatedAt: new Date(),
    };

    const existing = await StudentRegistration.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ error: 'An application with this email already exists.' });

    const registration = await StudentRegistration.create(payload);
    emitChanged();
    res.status(201).json({ id: registration._id, submitted: true });
  }
);

// ── Admin: list (lightweight — no document blobs) ────────────────────────────
// Returns a submittedDocFields array so the UI knows which docs exist without
// transferring the actual base64 data (can be 15 MB per doc × 15 fields).
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const rows = await StudentRegistration.find({}).sort({ createdAt: -1 }).lean();
    const lightweight = rows.map(row => {
      const submittedDocFields = DOC_FIELDS.filter(f => !!row[f]);
      const out = { ...row, submittedDocFields };
      DOC_FIELDS.forEach(f => delete out[f]);
      return out;
    });
    res.json(lightweight);
  } catch (err) {
    console.warn('[student-registrations] GET list failed:', err.message);
    res.status(503).json({ error: 'db_unavailable' });
  }
});

// ── Admin: single record with full document data ──────────────────────────────
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const row = await StudentRegistration.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: 'Not found' });
    // Add convenience array of uploaded doc field names
    row.submittedDocFields = DOC_FIELDS.filter(f => !!row[f]);
    res.json(row);
  } catch (err) {
    console.warn('[student-registrations] GET single failed:', err.message);
    res.status(503).json({ error: 'db_unavailable' });
  }
});

// ── Admin: update flags (requirements, fees) ─────────────────────────────────
router.patch('/:id', authMiddleware, adminOnly,
  body('requirementsReceived').optional().isBoolean(),
  body('feesPaid').optional().isBoolean(),
  async (req, res) => {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const row = await StudentRegistration.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    if (Object.hasOwn(req.body, 'requirementsReceived')) row.requirementsReceived = req.body.requirementsReceived;
    if (Object.hasOwn(req.body, 'feesPaid')) row.feesPaid = req.body.feesPaid;

    // Recompute status (but don't overwrite rejected/provisioned unless flags changed)
    if (row.status !== 'rejected' && row.status !== 'provisioned') {
      row.status = row.requirementsReceived && row.feesPaid ? 'ready' : 'pending';
    }
    row.updatedAt = new Date();
    await row.save();
    emitChanged();
    res.json(row);
  }
);

// ── Admin: reject application ─────────────────────────────────────────────────
router.post('/:id/reject', authMiddleware, adminOnly,
  body('reason').optional().trim(),
  async (req, res) => {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const row = await StudentRegistration.findById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.lmsProvisioned) return res.status(400).json({ error: 'Cannot reject a student whose LMS account is already provisioned.' });

    row.status = 'rejected';
    row.rejectionReason = req.body.reason || '';
    row.updatedAt = new Date();
    await row.save();
    emitChanged();
    res.json({ rejected: true, id: row._id });
  }
);

// ── Admin: restore rejected application back to pending ───────────────────────
router.post('/:id/restore', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const row = await StudentRegistration.findById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (row.status !== 'rejected') return res.status(400).json({ error: 'Application is not rejected.' });

  row.status = row.requirementsReceived && row.feesPaid ? 'ready' : 'pending';
  row.rejectionReason = '';
  row.updatedAt = new Date();
  await row.save();
  emitChanged();
  res.json({ restored: true, status: row.status });
});

// ── Admin: provision LMS account ─────────────────────────────────────────────
router.post('/:id/provision-lms', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const row = await StudentRegistration.findById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (row.status === 'rejected') return res.status(400).json({ error: 'Cannot provision LMS for a rejected application.' });
  if (row.lmsProvisioned) return res.status(400).json({ error: 'LMS account already provisioned for this student.' });

  const now = new Date();

  // Link an existing user account if the email is already registered
  const existingUser = await User.findOne({ email: row.email });
  if (existingUser) {
    row.lmsProvisioned    = true;
    row.lmsProvisionedAt  = now;
    row.lmsUserId         = existingUser._id;
    row.status            = 'provisioned';
    row.updatedAt         = now;
    await row.save();
    // Non-blocking notification
    notifyStudentProvisioned({
      name: row.fullName, email: existingUser.email, phone: row.phone,
      tempPassword: null, courseSlug: row.courseSlug,
      activationUrl: buildStudentActivationUrl(existingUser),
    }).catch(err => console.warn('[lms] Notify failed:', err.message));
    emitChanged();
    return res.json({ provisioned: true, email: existingUser.email, password: null, existing: true });
  }

  // Create a fresh student account
  const tempPassword = randomPassword();
  const user = await User.create({ email: row.email, name: row.fullName, password: tempPassword, role: 'student' });
  row.lmsProvisioned    = true;
  row.lmsProvisionedAt  = now;
  row.lmsUserId         = user._id;
  row.status            = 'provisioned';
  row.updatedAt         = now;
  await row.save();
  // Non-blocking notification
  notifyStudentProvisioned({
    name: row.fullName, email: user.email, phone: row.phone,
    tempPassword, courseSlug: row.courseSlug,
    activationUrl: buildStudentActivationUrl(user),
  }).catch(err => console.warn('[lms] Notify failed:', err.message));
  emitChanged();
  res.json({ provisioned: true, email: user.email, password: tempPassword, existing: false });
});

export default router;
