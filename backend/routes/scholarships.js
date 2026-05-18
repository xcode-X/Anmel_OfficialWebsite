import { Router } from 'express';
import Scholarship from '../models/Scholarship.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

// GET all published scholarships (public)
router.get('/', async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const scholarships = await Scholarship.find({ isPublished: true }).sort({ createdAt: -1 });
  res.json(scholarships);
});

// GET all scholarships for admin (requires auth)
router.get('/admin/all', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.json([]);
  const scholarships = await Scholarship.find().sort({ createdAt: -1 });
  res.json(scholarships);
});

// GET single scholarship
router.get('/:id', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  const s = await Scholarship.findById(req.params.id);
  if (!s) return res.status(404).json({ error: 'Scholarship not found' });
  res.json(s);
});

// POST create scholarship (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { title, university, country, deadline, scholarshipType, fundingStatus, eligibility, description, applicationLink, amount, isPublished } = req.body;
  if (!title || !university || !country || !deadline || !scholarshipType || !fundingStatus || !eligibility) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const scholarship = await Scholarship.create({
    title, university, country, deadline: new Date(deadline),
    scholarshipType, fundingStatus, eligibility, description, applicationLink, amount,
    isPublished: isPublished !== undefined ? isPublished : true,
  });
  res.status(201).json(scholarship);
});

// PATCH update scholarship (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  const updates = req.body;
  if (updates.deadline) updates.deadline = new Date(updates.deadline);
  const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!scholarship) return res.status(404).json({ error: 'Scholarship not found' });
  res.json(scholarship);
});

// DELETE scholarship (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  await Scholarship.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
