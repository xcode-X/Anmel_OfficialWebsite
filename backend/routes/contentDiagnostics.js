import { Router } from 'express';
import BlogPost from '../models/BlogPost.js';
import CaseStudy from '../models/CaseStudy.js';
import Scholarship from '../models/Scholarship.js';
import University from '../models/University.js';
import Testimonial from '../models/Testimonial.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

/** Helps debug "data in DB but not on site" — shows published vs draft counts. */
router.get('/visibility', authMiddleware, adminOnly, async (_req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database not connected', connected: false });
  }

  const [blogTotal, blogPublished, casesTotal, casesPublished, scholTotal, scholPublished, uniTotal, testTotal] =
    await Promise.all([
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ published: true }),
      CaseStudy.countDocuments(),
      CaseStudy.countDocuments({ published: true }),
      Scholarship.countDocuments(),
      Scholarship.countDocuments({ isPublished: true }),
      University.countDocuments(),
      Testimonial.countDocuments(),
    ]);

  res.json({
    connected: true,
    hint: 'Public pages only show items where published/isPublished is true.',
    blog: { total: blogTotal, visibleOnSite: blogPublished, hiddenDrafts: blogTotal - blogPublished },
    caseStudies: { total: casesTotal, visibleOnSite: casesPublished, hiddenDrafts: casesTotal - casesPublished },
    scholarships: { total: scholTotal, visibleOnSite: scholPublished, hiddenDrafts: scholTotal - scholPublished },
    universities: { total: uniTotal, visibleOnSite: uniTotal, note: 'All universities show when API is healthy' },
    testimonials: { total: testTotal, visibleOnSite: testTotal },
  });
});

export default router;
