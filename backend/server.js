import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import caseStudyRoutes from './routes/caseStudies.js';
import servicesRoutes from './routes/services.js';
import coursesRoutes from './routes/courses.js';
import lmsContentRoutes from './routes/lmsContent.js';
import studentRegistrationsRoutes from './routes/studentRegistrations.js';
import securityCheckerRoutes from './routes/securityChecker.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import userRoutes from './routes/users.js';
import contentStreamRoutes from './routes/contentStream.js';
import scholarshipRoutes from './routes/scholarships.js';
import agentRoutes from './routes/agents.js';
import universityRoutes from './routes/universities.js';
import testimonialRoutes from './routes/testimonials.js';

connectDB().then(() => console.log('MongoDB connected')).catch((e) => console.warn('MongoDB unavailable — running without database:', e.message));

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// Uploaded images are stored as data URLs (base64) for now, which can be large.
// Increase the JSON body limit to avoid PayloadTooLargeError (default is 100kb).
app.use(express.json({ limit: '20mb' }));

// Skip rate limiting entirely for localhost — React 18 Strict Mode double-invokes
// every effect, so a single dev browser session can rack up requests very fast.
const isLocalhost = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000, // generous ceiling for a single-admin SPA with multiple polling intervals
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
  skip: isLocalhost,
});

// More relaxed limiter for write operations from authenticated admin sessions
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, please wait a moment.' },
  skip: isLocalhost,
});

app.use('/api/', limiter);

// Apply write limiter to mutating methods on content routes
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
app.use('/api/security-checker', securityCheckerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentStreamRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/testimonials', testimonialRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  if (err?.status === 413 || err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Upload too large. Please use a smaller image file.' });
  }
  const isJsonBodyError =
    err instanceof SyntaxError &&
    (err.status === 400 || err.statusCode === 400 || err.type === 'entity.parse.failed');
  if (isJsonBodyError) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (req.method === 'GET') return res.json([]);
  res.status(500).json({ error: 'Service unavailable' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use. Either:\n  1. Stop the other process using port ${PORT} (e.g. close the other terminal that ran the server),\n  2. Or set PORT=5001 in server/.env and restart.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
