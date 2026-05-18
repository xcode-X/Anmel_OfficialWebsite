import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = Router();

router.post('/subscribe',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!isDbConnected()) return res.status(503).json({ error: 'Service temporarily unavailable. Please try again shortly.' });
    try {
      await NewsletterSubscriber.create({ email: req.body.email });
      res.json({ message: 'Subscribed successfully.' });
    } catch (e) {
      if (e.code === 11000) return res.json({ message: 'You are already subscribed.' });
      throw e;
    }
  }
);

export default router;
