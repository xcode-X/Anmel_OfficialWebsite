import { Router } from 'express';
import BlogPost from '../models/BlogPost.js';
import CaseStudy from '../models/CaseStudy.js';
import ContactSubmission from '../models/ContactSubmission.js';
import ScholarshipApplication from '../models/ScholarshipApplication.js';
import StudentRegistration from '../models/StudentRegistration.js';
import Scholarship from '../models/Scholarship.js';
import University from '../models/University.js';
import Agent from '../models/Agent.js';
import Testimonial from '../models/Testimonial.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { withDbQuery } from '../lib/dbReady.js';
import { logError } from '../lib/logger.js';

const router = Router();
const CACHE_MS = 30_000;
let statsCache = { data: null, expiresAt: 0 };

const EMPTY_STATS = {
  blog: { total: 0, published: 0 },
  caseStudies: { total: 0 },
  contacts: { total: 0, unread: 0 },
  students: { total: 0, pending: 0 },
  scholarshipApplications: { total: 0, pending: 0 },
  scholarships: { total: 0, live: 0 },
  universities: { total: 0 },
  agents: { total: 0, pending: 0 },
  testimonials: { total: 0 },
  updatedAt: Date.now(),
};

export function invalidateAdminStatsCache() {
  statsCache = { data: null, expiresAt: 0 };
}

router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const now = Date.now();
    if (statsCache.data && statsCache.expiresAt > now) {
      return res.json(statsCache.data);
    }

    const stats = await withDbQuery(
      async () => {
        const [
          blogTotal,
          blogPublished,
          caseStudies,
          contactsTotal,
          contactsUnread,
          studentsTotal,
          studentsPending,
          scholarshipAppsTotal,
          scholarshipAppsPending,
          scholarshipsTotal,
          scholarshipsLive,
          universities,
          agentsTotal,
          agentsPending,
          testimonials,
        ] = await Promise.all([
          BlogPost.countDocuments().maxTimeMS(5000),
          BlogPost.countDocuments({ published: true }).maxTimeMS(5000),
          CaseStudy.countDocuments().maxTimeMS(5000),
          ContactSubmission.countDocuments().maxTimeMS(5000),
          ContactSubmission.countDocuments({ read: { $ne: true } }).maxTimeMS(5000),
          StudentRegistration.countDocuments().maxTimeMS(5000),
          StudentRegistration.countDocuments({ status: 'pending' }).maxTimeMS(5000),
          ScholarshipApplication.countDocuments().maxTimeMS(5000),
          ScholarshipApplication.countDocuments({ status: 'pending' }).maxTimeMS(5000),
          Scholarship.countDocuments().maxTimeMS(5000),
          Scholarship.countDocuments({ isPublished: true }).maxTimeMS(5000),
          University.countDocuments().maxTimeMS(5000),
          Agent.countDocuments().maxTimeMS(5000),
          Agent.countDocuments({ status: 'Pending' }).maxTimeMS(5000),
          Testimonial.countDocuments().maxTimeMS(5000),
        ]);

        return {
          blog: { total: blogTotal, published: blogPublished },
          caseStudies: { total: caseStudies },
          contacts: { total: contactsTotal, unread: contactsUnread },
          students: { total: studentsTotal, pending: studentsPending },
          scholarshipApplications: { total: scholarshipAppsTotal, pending: scholarshipAppsPending },
          scholarships: { total: scholarshipsTotal, live: scholarshipsLive },
          universities: { total: universities },
          agents: { total: agentsTotal, pending: agentsPending },
          testimonials: { total: testimonials },
          updatedAt: Date.now(),
        };
      },
      { fallback: EMPTY_STATS, label: 'admin stats', timeoutMs: 10000 },
    );

    const payload = { ...stats, degraded: stats === EMPTY_STATS };
    statsCache = { data: payload, expiresAt: now + CACHE_MS };
    return res.json(payload);
  } catch (err) {
    logError('admin/stats', err);
    return res.status(200).json({
      ...EMPTY_STATS,
      degraded: true,
      updatedAt: Date.now(),
    });
  }
});

export default router;
