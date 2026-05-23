import { Router } from 'express';
import Scholarship from '../models/Scholarship.js';
import ScholarshipApplication from '../models/ScholarshipApplication.js';
import User from '../models/User.js';
import { authMiddleware, adminOnly, optionalAuth } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { publishScholarshipToSocial } from '../lib/socialPublisher.js';
import { sendScholarshipConfirmation, sendScholarshipAdminAlert } from '../lib/notifyApplications.js';
import {
  persistMediaValue,
  persistMediaFields,
  resolvePublicMediaUrl,
  streamMediaValue,
  isDataUrl,
} from '../lib/fileStorage.js';
import { SCHOLARSHIP_MEDIA_FIELDS, STUDENT_DOC_FIELDS } from '../lib/mediaFields.js';
const router = Router();

function formatMongooseError(err) {
  if (err?.name === 'ValidationError') {
    return Object.values(err.errors).map((e) => e.message).join('; ');
  }
  return err?.message || 'Request failed';
}

function parseDeadline(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function normalizePrograms(input) {
  if (Array.isArray(input)) {
    return input
      .map((p) => {
        if (typeof p === 'string') {
          const name = p.trim();
          return name ? { name, level: '' } : null;
        }
        const name = String(p?.name || '').trim();
        if (!name) return null;
        return { name, level: String(p?.level || '').trim() };
      })
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name, level: '' }));
  }
  return [];
}

function sanitizePayload(body = {}) {
  const deadline = parseDeadline(body.deadline);
  const programs = normalizePrograms(
    body.programs ?? body.programsText ?? body.programList,
  );
  return {
    title: String(body.title || '').trim(),
    university: String(body.university || '').trim(),
    country: String(body.country || '').trim(),
    universityId: String(body.universityId || '').trim() || undefined,
    deadline,
    scholarshipType: String(body.scholarshipType || '').trim(),
    fundingStatus: String(body.fundingStatus || '').trim(),
    eligibility: String(body.eligibility || '').trim(),
    description: String(body.description || '').trim(),
    applicationLink: String(body.applicationLink || '').trim(),
    amount: String(body.amount || '').trim(),
    thumbnail: String(body.thumbnail || '').trim(),
    programs,
    isPublished: body.isPublished !== false,
  };
}

function validatePayload(data) {
  if (!data.title) return 'Title is required.';
  if (!data.university) return 'University is required.';
  if (!data.country) return 'Country is required.';
  if (!data.deadline) return 'A valid application deadline is required.';
  if (!data.scholarshipType) return 'Scholarship type is required.';
  if (!data.fundingStatus) return 'Funding status is required.';
  if (!data.eligibility) return 'Eligibility is required.';
  return null;
}

const APP_DOC_FIELDS = STUDENT_DOC_FIELDS;

function scholarshipImageUrl(id) {
  return `/api/scholarships/${id}/thumbnail/image`;
}

function toPublicListItem(row, { hasThumbnail, remoteThumbnail } = {}) {
  const id = String(row._id || '');
  const { thumbnail: _drop, ...rest } = row;
  const thumb = remoteThumbnail || '';
  const isRemoteUrl = /^https?:\/\//i.test(thumb);
  return {
    ...rest,
    hasThumbnail: Boolean(hasThumbnail),
    thumbnail: isRemoteUrl
      ? thumb
      : hasThumbnail && id
        ? scholarshipImageUrl(id)
        : undefined,
  };
}

function toApplicationListItem(app) {
  const submittedDocFields = APP_DOC_FIELDS.filter((f) => app[f]);
  const lean = { ...app };
  for (const f of APP_DOC_FIELDS) delete lean[f];
  return {
    ...lean,
    submittedDocFields,
    documentsCount: submittedDocFields.length,
  };
}

async function isRequestAdmin(userId) {
  if (!userId) return false;
  const user = await User.findById(userId).lean().catch(() => null);
  return user?.role === 'admin';
}

// GET all published scholarships (public) — thumbnails via /:id/thumbnail when needed
router.get('/', async (req, res) => {
  const rows = await withDbQuery(
    () =>
      Scholarship.find({ isPublished: true })
        .select('-thumbnail')
        .sort({ createdAt: -1 })
        .maxTimeMS(8000)
        .lean(),
    { fallback: [], label: 'scholarships public list' },
  );

  const remoteRows = await withDbQuery(
    () =>
      Scholarship.find({ isPublished: true, thumbnail: /^https?:\/\//i })
        .select('_id thumbnail')
        .maxTimeMS(8000)
        .lean(),
    { fallback: [], label: 'scholarships remote thumbnails' },
  );
  const hasThumbIds = new Set(
    (
      await withDbQuery(
        () =>
          Scholarship.find({
            isPublished: true,
            thumbnail: { $exists: true, $nin: [null, ''] },
          })
            .select('_id')
            .maxTimeMS(8000)
            .lean(),
        { fallback: [], label: 'scholarships thumb ids' },
      )
    ).map((r) => String(r._id)),
  );
  const remoteById = new Map(remoteRows.map((r) => [String(r._id), r.thumbnail]));

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  res.json(
    rows.map((row) => {
      const id = String(row._id);
      return toPublicListItem(row, {
        hasThumbnail: hasThumbIds.has(id),
        remoteThumbnail: remoteById.get(id),
      });
    }),
  );
});

// GET all scholarships for admin (requires auth)
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const scholarships = await withDbQuery(
      () =>
        Scholarship.find()
          .select('-thumbnail')
          .sort({ createdAt: -1 })
          .maxTimeMS(10000)
          .lean(),
      { fallback: [], label: 'scholarships admin list', timeoutMs: 12000 },
    );
    res.json(scholarships);
  } catch (err) {
    console.warn('[scholarships] GET /admin/all failed:', err.message);
    const mongoErr = formatMongooseError(err);
    if (mongoErr) return res.status(503).json({ error: mongoErr });
    res.status(503).json({ error: err?.message || 'Could not load scholarships' });
  }
});

// GET scholarship applications (admin)
router.get('/:id/applications', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const scholarship = await Scholarship.findById(req.params.id).lean();
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });

    const applications = await ScholarshipApplication.find({ scholarshipId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(applications.map(toApplicationListItem));
  } catch (err) {
    console.warn('[scholarships] GET /:id/applications failed:', err.message);
    res.status(400).json({ error: 'Invalid scholarship id' });
  }
});

// POST scholarship application (public)
router.post('/:id/applications', async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const scholarship = await Scholarship.findById(req.params.id).lean();
    if (!scholarship || !scholarship.isPublished) {
      return res.status(404).json({ error: 'Scholarship not found or not accepting applications.' });
    }

    const body = req.body || {};
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim();
    if (!fullName) return res.status(400).json({ error: 'Full name is required.' });
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const docPayload = await persistMediaFields(body, APP_DOC_FIELDS, 'scholarship-applications');
    const oversizedField = APP_DOC_FIELDS.find((f) => isDataUrl(docPayload[f]));
    if (oversizedField) {
      return res.status(413).json({
        error: 'Uploaded documents are too large to store inline. Please refresh the page and submit again.',
      });
    }
    const application = await ScholarshipApplication.create({
      scholarshipId: scholarship._id,
      scholarshipTitle: scholarship.title,
      fullName,
      email,
      phone: String(body.phone || '').trim(),
      country: String(body.country || '').trim(),
      educationLevel: String(body.educationLevel || '').trim(),
      experienceLevel: String(body.experienceLevel || '').trim(),
      university: String(body.university || scholarship.university || '').trim(),
      course: String(body.course || '').trim(),
      degreeLevel: String(body.degreeLevel || '').trim(),
      studyMode: String(body.studyMode || '').trim(),
      personalStatement: String(docPayload.personalStatement || body.personalStatement || '').trim(),
      passportPhoto: docPayload.passportPhoto || '',
      oLevelCertificate: docPayload.oLevelCertificate || '',
      aLevelCertificate: docPayload.aLevelCertificate || '',
      highSchoolDiploma: docPayload.highSchoolDiploma || '',
      waecResult: docPayload.waecResult || '',
      academicTranscript: docPayload.academicTranscript || '',
      bachelorDegree: docPayload.bachelorDegree || '',
      masterDegree: docPayload.masterDegree || '',
      englishProficiency: docPayload.englishProficiency || '',
      healthCertificate: docPayload.healthCertificate || '',
      passportBioPage: docPayload.passportBioPage || '',
      recommendationLetters: docPayload.recommendationLetters || '',
      cvResume: docPayload.cvResume || '',
      otherDocuments: docPayload.otherDocuments || '',
    });

    publishContentChange('scholarship-applications', { scholarshipId: String(scholarship._id) });

    // Send emails in background — don't block the response
    const notifyData = {
      name: fullName,
      email,
      phone: String(body.phone || '').trim(),
      scholarshipTitle: scholarship.title,
      university: String(body.university || scholarship.university || '').trim(),
      country: String(body.country || scholarship.country || '').trim(),
      course: String(body.course || '').trim(),
      degreeLevel: String(body.degreeLevel || '').trim(),
    };
    setImmediate(() => {
      sendScholarshipConfirmation(notifyData)
        .catch((e) => console.warn('[scholarships] Confirmation email failed:', e.message));
      sendScholarshipAdminAlert(notifyData)
        .catch((e) => console.warn('[scholarships] Admin alert email failed:', e.message));
    });

    res.status(201).json({ ok: true, id: application._id });
  } catch (err) {
    console.warn('[scholarships] POST /:id/applications failed:', err.message);
    const status = err?.status === 413 ? 413 : err.name === 'ValidationError' ? 400 : 503;
    res.status(status).json({ error: formatMongooseError(err) });
  }
});

// PATCH application status (admin)
router.patch('/:id/applications/:appId', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const allowed = ['pending', 'reviewing', 'accepted', 'rejected'];
    const status = String(req.body?.status || '').trim();
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const application = await ScholarshipApplication.findOneAndUpdate(
      { _id: req.params.appId, scholarshipId: req.params.id },
      { status, updatedAt: new Date() },
      { new: true },
    ).lean();
    if (!application) return res.status(404).json({ error: 'Application not found' });

    publishContentChange('scholarship-applications', { scholarshipId: String(req.params.id) });
    res.json(toApplicationListItem(application));
  } catch (err) {
    console.warn('[scholarships] PATCH /:id/applications/:appId failed:', err.message);
    res.status(400).json({ error: 'Invalid application id' });
  }
});

// GET scholarship thumbnail as image bytes (cards, detail hero)
router.get('/:id/thumbnail/image', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).end();
    const s = await Scholarship.findById(req.params.id, { thumbnail: 1, isPublished: 1 })
      .lean()
      .maxTimeMS(8000);
    if (!s?.thumbnail) return res.status(404).end();
    if (!s.isPublished) return res.status(404).end();
    const ok = await streamMediaValue(res, s.thumbnail);
    if (!ok) return res.status(404).end();
  } catch (err) {
    console.warn('[scholarships] GET /:id/thumbnail/image failed:', err.message);
    if (!res.headersSent) res.status(400).end();
  }
});

// GET scholarship thumbnail JSON — admin preview / legacy clients
router.get('/:id/thumbnail', async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const s = await Scholarship.findById(req.params.id, { thumbnail: 1, isPublished: 1 }).lean();
    if (!s) return res.status(404).json({ error: 'Scholarship not found' });
    const admin = await isRequestAdmin(req.userId);
    if (!s.isPublished && !admin) return res.status(404).json({ error: 'Scholarship not found' });

    const thumb = s.thumbnail || '';
    if (isDataUrl(thumb)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.json({ thumbnail: thumb });
    }

    const resolved = resolvePublicMediaUrl(req, thumb);
    if (resolved && /^https?:\/\//i.test(resolved)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.json({ thumbnail: resolved });
    }

    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.json({ thumbnail: scholarshipImageUrl(String(s._id)) });
  } catch (err) {
    console.warn('[scholarships] GET /:id/thumbnail failed:', err.message);
    res.status(400).json({ error: 'Invalid scholarship id' });
  }
});

// GET single scholarship (public if published; full doc for admin)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
    const s = await Scholarship.findById(req.params.id).lean();
    if (!s) return res.status(404).json({ error: 'Scholarship not found' });

    const admin = await isRequestAdmin(req.userId);
    if (!s.isPublished && !admin) return res.status(404).json({ error: 'Scholarship not found' });

    if (admin) return res.json(s);
    const hasThumbnail = Boolean(s.thumbnail);
    const remoteThumbnail = /^https?:\/\//i.test(s.thumbnail || '') ? s.thumbnail : undefined;
    return res.json(toPublicListItem(s, { hasThumbnail, remoteThumbnail }));
  } catch (err) {
    console.warn('[scholarships] GET /:id failed:', err.message);
    res.status(400).json({ error: 'Invalid scholarship id' });
  }
});

// POST create scholarship (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const data = sanitizePayload(req.body);
    const validationError = validatePayload(data);
    if (validationError) return res.status(400).json({ error: validationError });

    const thumb = data.thumbnail
      ? await persistMediaValue(data.thumbnail, { category: 'scholarships' })
      : undefined;
    const scholarship = await Scholarship.create({
      title: data.title,
      university: data.university,
      country: data.country,
      universityId: data.universityId,
      deadline: data.deadline,
      scholarshipType: data.scholarshipType,
      fundingStatus: data.fundingStatus,
      eligibility: data.eligibility,
      description: data.description || undefined,
      applicationLink: data.applicationLink || undefined,
      amount: data.amount || undefined,
      programs: data.programs?.length ? data.programs : undefined,
      thumbnail: thumb || undefined,
      isPublished: data.isPublished,
    });

    publishContentChange('scholarships');
    res.status(201).json(scholarship);
  } catch (err) {
    console.warn('[scholarships] POST failed:', err.message);
    res.status(err.name === 'ValidationError' ? 400 : 500).json({ error: formatMongooseError(err) });
  }
});

// PATCH update scholarship (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const updates = { ...req.body };
    if (updates.deadline !== undefined) {
      const deadline = parseDeadline(updates.deadline);
      if (!deadline) return res.status(400).json({ error: 'A valid application deadline is required.' });
      updates.deadline = deadline;
    }
    if (updates.title !== undefined) updates.title = String(updates.title).trim();
    if (updates.university !== undefined) updates.university = String(updates.university).trim();
    if (updates.country !== undefined) updates.country = String(updates.country).trim();
    if (updates.eligibility !== undefined) updates.eligibility = String(updates.eligibility).trim();
    if (updates.programs !== undefined || updates.programsText !== undefined) {
      updates.programs = normalizePrograms(updates.programs ?? updates.programsText);
      delete updates.programsText;
    }
    if (updates.universityId !== undefined) {
      updates.universityId = String(updates.universityId || '').trim() || undefined;
    }
    if (updates.thumbnail !== undefined) {
      const raw = String(updates.thumbnail || '').trim();
      updates.thumbnail = raw
        ? await persistMediaValue(raw, { category: 'scholarships', fileId: `scholarship-${req.params.id}` })
        : undefined;
    }

    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });

    publishContentChange('scholarships');
    res.json(scholarship);
  } catch (err) {
    console.warn('[scholarships] PATCH failed:', err.message);
    res.status(err.name === 'ValidationError' ? 400 : 500).json({ error: formatMongooseError(err) });
  }
});

// POST publish scholarship to social platforms (admin only)
router.post('/:id/share', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const scholarship = await Scholarship.findById(req.params.id).lean();
    if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
    if (!scholarship.isPublished) {
      return res.status(400).json({ error: 'Publish the scholarship on the public site before sharing to social media.' });
    }

    const payload = await publishScholarshipToSocial(scholarship);
    res.json(payload);
  } catch (err) {
    console.warn('[scholarships] POST /:id/share failed:', err.message);
    res.status(503).json({ error: err.message || 'Social publish failed' });
  }
});

// DELETE scholarship (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
  }

  try {
    const deleted = await Scholarship.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Scholarship not found' });
    publishContentChange('scholarships', { action: 'deleted', scholarshipId: String(deleted._id) });
    res.json({ ok: true });
  } catch (err) {
    console.warn('[scholarships] DELETE failed:', err.message);
    res.status(400).json({ error: 'Invalid scholarship id' });
  }
});

export default router;
