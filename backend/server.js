import 'express-async-errors';
import 'dotenv/config';
import path from 'path';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './lib/dbReady.js';
import { ensureUploadDirs, UPLOAD_ROOT, getStorageDriver } from './lib/fileStorage.js';
import { isS3Enabled, objectPublicUrl } from './lib/s3Storage.js';
import { configureProduction } from './lib/productionStatic.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import caseStudyRoutes from './routes/caseStudies.js';
import servicesRoutes from './routes/services.js';
import coursesRoutes from './routes/courses.js';
import lmsContentRoutes from './routes/lmsContent.js';
import studentRegistrationsRoutes from './routes/studentRegistrations.js';
import scholarshipApplicationsRoutes from './routes/scholarshipApplications.js';
import securityCheckerRoutes from './routes/securityChecker.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import userRoutes from './routes/users.js';
import contentStreamRoutes from './routes/contentStream.js';
import scholarshipRoutes from './routes/scholarships.js';
import agentRoutes from './routes/agents.js';
import universityRoutes from './routes/universities.js';
import testimonialRoutes from './routes/testimonials.js';
import adminStatsRoutes from './routes/adminStats.js';
import contentDiagnosticsRoutes from './routes/contentDiagnostics.js';
import { isSseRequest } from './lib/sse.js';
import { validateEnvironment } from './lib/envCheck.js';
import { logError } from './lib/logger.js';

validateEnvironment();

const isProduction = process.env.NODE_ENV === 'production';
const serveFrontend = isProduction || process.env.SERVE_FRONTEND === 'true';

initDatabase()
  .then(() => console.log('Firebase (Firestore + Auth) connected'))
  .catch((e) => console.warn('Firebase unavailable:', e.message));

ensureUploadDirs().catch((e) => console.warn('[uploads] Could not create upload directories:', e.message));

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  compression({
    filter: (req, res) => {
      if (isSseRequest(req)) return false;
      const ct = res.getHeader('Content-Type');
      if (typeof ct === 'string' && ct.includes('text/event-stream')) return false;
      return compression.filter(req, res);
    },
  }),
);
app.use(helmet({ contentSecurityPolicy: false }));
const corsOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'https://anmelwebsitpro.web.app',
  'https://anmelwebsitpro.firebaseapp.com',
];
if (process.env.EXTRA_CORS_ORIGINS) {
  corsOrigins.push(...process.env.EXTRA_CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean));
}
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: process.env.JSON_LIMIT || '60mb' }));

if (isS3Enabled()) {
  const cdnBase =
    process.env.S3_PUBLIC_URL_BASE?.trim() ||
    process.env.PUBLIC_BASE_URL?.trim();
  app.use('/uploads', (req, res) => {
    if (cdnBase) {
      const target = `${cdnBase.replace(/\/$/, '')}/uploads${req.path}`;
      return res.redirect(301, target);
    }
    res.status(404).json({
      error: 'Uploads are served from object storage. Set S3_PUBLIC_URL_BASE or PUBLIC_BASE_URL (CDN).',
      driver: 's3',
    });
  });
} else {
  app.use(
    '/uploads',
    express.static(UPLOAD_ROOT, {
      maxAge: isProduction ? '7d' : 0,
      etag: true,
      setHeaders(res) {
        if (isProduction) {
          res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        }
      },
    }),
  );
}

const isLocalhost = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
  skip: (req) => isLocalhost(req) || isSseRequest(req),
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, please wait a moment.' },
  skip: (req) => isLocalhost(req) || req.method === 'GET' || req.method === 'HEAD',
});

app.use('/api/', limiter);
app.use('/api/blog', writeLimiter);
app.use('/api/case-studies', writeLimiter);
app.use('/api/services', writeLimiter);
app.use('/api/lms-content', writeLimiter);
app.use('/api/courses', writeLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lms-content', lmsContentRoutes);
app.use('/api/student-registrations', studentRegistrationsRoutes);
app.use('/api/scholarship-applications', scholarshipApplicationsRoutes);
app.use('/api/security-checker', securityCheckerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentStreamRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/admin/content', contentDiagnosticsRoutes);

app.get('/api/health', async (_, res) => {
  const storage = { driver: getStorageDriver() };
  if (isS3Enabled()) {
    const { verifyS3Connection } = await import('./lib/s3Storage.js');
    storage.s3 = await verifyS3Connection();
    storage.publicUrlExample = objectPublicUrl('/uploads/example.webp');
  }
  res.json({ ok: true, database: 'firebase', storage });
});

if (serveFrontend) {
  configureProduction(app);
}

app.use((err, req, res, _next) => {
  if (res.headersSent) {
    logError('express', err, { path: req.path, note: 'headers already sent' });
    try { res.end(); } catch { /* ignore */ }
    return;
  }
  logError('express', err, { method: req.method, path: req.path });
  if (err?.status === 413 || err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Upload too large. Please use a smaller image file.' });
  }
  const isJsonBodyError =
    err instanceof SyntaxError &&
    (err.status === 400 || err.statusCode === 400 || err.type === 'entity.parse.failed');
  if (isJsonBodyError) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  let status = typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 503;
  if (status === 500) status = 503;
  if (req.method === 'GET' && status >= 500) {
    return res.status(503).json({ error: 'Service temporarily unavailable. Please try again.', degraded: true });
  }
  return res.status(status).json({ error: err?.message || 'Service temporarily unavailable. Please try again.' });
});

process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (serveFrontend) console.log('Serving production frontend from frontend/dist');
  console.log(`Uploads directory: ${path.resolve(UPLOAD_ROOT)}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
