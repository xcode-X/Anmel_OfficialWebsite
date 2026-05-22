import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../lib/jwtSecret.js';
import { createAdminSseRoute } from '../lib/streamRoute.js';
import { broadcastSse } from '../lib/sse.js';
import StudentRegistration from '../models/StudentRegistration.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { notifyStudentProvisioned } from '../lib/notifyStudent.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { sendRouteError } from '../lib/asyncHandler.js';
import { persistMediaFields, resolvePublicMediaUrl, isDataUrl } from '../lib/fileStorage.js';
import { STUDENT_DOC_FIELDS } from '../lib/mediaFields.js';
import { invalidateAdminStatsCache } from './adminStats.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { logError } from '../lib/logger.js';

const router = Router();
const listeners = new Set();

const DOC_FIELDS = STUDENT_DOC_FIELDS;

function withResolvedDocUrls(req, row) {
  if (!row) return row;
  const out = { ...row };
  for (const f of DOC_FIELDS) {
    if (out[f]) out[f] = resolvePublicMediaUrl(req, out[f]);
  }
  return out;
}

function emitChanged() {
  broadcastSse(listeners, { event: 'changed', ts: Date.now() });
}

/** Notify admin dashboards (SSE + stats cache). */
export function broadcastStudentRegistrationChange() {
  emitChanged();
  invalidateAdminStatsCache();
}

function buildStudentPayload(body, storedDocs) {
  return {
    fullName:              body.fullName,
    email:                 body.email,
    phone:                 body.phone || '',
    courseSlug:            body.courseSlug || 'general',
    applicationType:       body.applicationType || (body.courseSlug && body.courseSlug !== 'general' ? 'intern' : 'university'),
    country:               body.country || '',
    educationLevel:        body.educationLevel || '',
    experienceLevel:       body.experienceLevel || '',
    preferredLearningMode: body.preferredLearningMode || '',
    preferredStartWindow:  body.preferredStartWindow || '',
    motivation:            body.motivation || '',
    university:            body.university || '',
    course:                body.course || '',
    degreeLevel:           body.degreeLevel || '',
    intake:                body.intake || '',
    studyMode:             body.studyMode || '',
    campus:                body.campus || '',
    passportPhoto:         storedDocs.passportPhoto || '',
    oLevelCertificate:     storedDocs.oLevelCertificate || '',
    aLevelCertificate:     storedDocs.aLevelCertificate || '',
    highSchoolDiploma:     storedDocs.highSchoolDiploma || '',
    waecResult:            storedDocs.waecResult || '',
    academicTranscript:    storedDocs.academicTranscript || '',
    bachelorDegree:        storedDocs.bachelorDegree || '',
    masterDegree:          storedDocs.masterDegree || '',
    englishProficiency:    storedDocs.englishProficiency || '',
    healthCertificate:     storedDocs.healthCertificate || '',
    passportBioPage:       storedDocs.passportBioPage || '',
    recommendationLetters: storedDocs.recommendationLetters || '',
    personalStatement:     storedDocs.personalStatement || '',
    cvResume:              storedDocs.cvResume || '',
    otherDocuments:        storedDocs.otherDocuments || '',
    updatedAt: new Date(),
  };
}

/** Mirror a scholarship/public application into Student Intake (admin list). */
export async function syncStudentFromApplication(body, storedDocs, { courseSlug } = {}) {
  if (!isDbConnected()) return null;
  const email = String(body.email || '').trim().toLowerCase();
  if (!email) return null;
  const existing = await StudentRegistration.findOne({ email }).select('_id').lean();
  if (existing) return existing;
  const payload = buildStudentPayload({ ...body, email, courseSlug: courseSlug || body.courseSlug || 'general' }, storedDocs);
  const registration = await StudentRegistration.create(payload);
  broadcastStudentRegistrationChange();
  return registration;
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
  const token = jwt.sign(payload, getJwtSecret(), { expiresIn: '72h' });
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${clientBase}/student/access?token=${encodeURIComponent(token)}`;
}

// ── SSE stream (admin only) ───────────────────────────────────────────────────
router.get('/stream', createAdminSseRoute(listeners));

// ── Public submit ─────────────────────────────────────────────────────────────
router.post('/',
  body('fullName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty().trim(),
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
    if (!errors.isEmpty()) {
      const msgs = errors.array().map((e) => e.msg).filter(Boolean);
      return res.status(400).json({
        error: msgs.join('. ') || 'Invalid application data',
        errors: errors.array(),
      });
    }

    try {
      const storedDocs = await persistMediaFields(req.body, DOC_FIELDS, 'students');
      const oversizedField = DOC_FIELDS.find((f) => isDataUrl(storedDocs[f]));
      if (oversizedField) {
        return res.status(413).json({
          error: 'Uploaded documents are too large to store inline. Please refresh the page and submit again.',
        });
      }
      const payload = buildStudentPayload(req.body, storedDocs);

      const existing = await StudentRegistration.findOne({ email: payload.email });
      if (existing) {
        return res.status(409).json({ error: 'An application with this email already exists.' });
      }

      const registration = await StudentRegistration.create(payload);
      broadcastStudentRegistrationChange();
      res.status(201).json({ id: registration._id, submitted: true });
    } catch (err) {
      logError('student-registrations/create', err);
      if (err?.status === 413) {
        return res.status(413).json({ error: err.message || 'One or more files are too large.' });
      }
      return sendRouteError(res, err, { scope: 'student-registrations/create' });
    }
  }
);

// ── Admin: list (lightweight — no document blobs) ────────────────────────────
// Returns a submittedDocFields array so the UI knows which docs exist without
// transferring the actual base64 data (can be 15 MB per doc × 15 fields).
const STUDENT_LIST_EXCLUDE = DOC_FIELDS.map((f) => `-${f}`).join(' ');

router.get('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const rows = await withDbQuery(
      () =>
        StudentRegistration.find({})
          .select(STUDENT_LIST_EXCLUDE)
          .sort({ createdAt: -1 })
          .maxTimeMS(12000)
          .lean(),
      { fallback: [], label: 'student-registrations list', timeoutMs: 15000 },
    );

    // Doc presence is resolved on GET /:id (full record). Listing with aggregation
    // over large base64 fields can hang MongoDB and surface as 500s in the browser.
    res.json(
      rows.map((row) => ({
        ...row,
        submittedDocFields: Array.isArray(row.submittedDocFields) ? row.submittedDocFields : [],
      })),
    );
  } catch (err) {
    return sendRouteError(res, err, { scope: 'student-registrations/list' });
  }
});

// ── Admin: single record with full document data ──────────────────────────────
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const row = await StudentRegistration.findById(req.params.id).lean();
    if (!row) return res.status(404).json({ error: 'Not found' });
    const resolved = withResolvedDocUrls(req, row);
    resolved.submittedDocFields = DOC_FIELDS.filter((f) => !!row[f]);
    res.json(resolved);
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
    broadcastStudentRegistrationChange();
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
    broadcastStudentRegistrationChange();
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
  broadcastStudentRegistrationChange();
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
  const courseLabel = row.course || row.courseSlug || 'general';

  // Link an existing user account if the email is already registered
  const existingUser = await User.findOne({ email: row.email });
  if (existingUser) {
    if (existingUser.role !== 'student') {
      return res.status(400).json({ error: 'This email belongs to a non-student account and cannot be used for LMS access.' });
    }

    const tempPassword = randomPassword();
    existingUser.password = tempPassword;
    existingUser.name = row.fullName || existingUser.name;
    await existingUser.save();

    row.lmsProvisioned    = true;
    row.lmsProvisionedAt  = now;
    row.lmsUserId         = existingUser._id;
    row.status            = 'provisioned';
    row.updatedAt         = now;
    await row.save();

    const notification = await notifyStudentProvisioned({
      name: row.fullName,
      email: existingUser.email,
      phone: row.phone,
      tempPassword,
      courseSlug: courseLabel,
      activationUrl: buildStudentActivationUrl(existingUser),
    });

    if (notification.emailResult?.error && !notification.emailResult?.dryRun) {
      return res.status(502).json({
        error: `LMS account linked but login email could not be sent: ${notification.emailResult.error}`,
        provisioned: true,
        email: existingUser.email,
        password: tempPassword,
        existing: true,
        notification,
      });
    }

    broadcastStudentRegistrationChange();
    publishContentChange('users');
    return res.json({
      provisioned: true,
      email: existingUser.email,
      password: tempPassword,
      existing: true,
      notification,
    });
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

  const notification = await notifyStudentProvisioned({
    name: row.fullName,
    email: user.email,
    phone: row.phone,
    tempPassword,
    courseSlug: courseLabel,
    activationUrl: buildStudentActivationUrl(user),
  });

  if (notification.emailResult?.error && !notification.emailResult?.dryRun) {
    return res.status(502).json({
      error: `LMS account created but login email could not be sent: ${notification.emailResult.error}`,
      provisioned: true,
      email: user.email,
      password: tempPassword,
      existing: false,
      notification,
    });
  }

  broadcastStudentRegistrationChange();
  publishContentChange('users');
  res.json({
    provisioned: true,
    email: user.email,
    password: tempPassword,
    existing: false,
    notification,
  });
});

export default router;
