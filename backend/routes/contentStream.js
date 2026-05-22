import { Router } from 'express';
import { registerContentStreamClient } from '../lib/contentStreamHub.js';
import { initSseResponse, writeSseEvent, writeSseComment } from '../lib/sse.js';
import { logError } from '../lib/logger.js';

const router = Router();

router.get('/stream', (req, res) => {
  try {
    initSseResponse(res);
    registerContentStreamClient(res);
    writeSseEvent(res, { resource: 'connected', ts: Date.now() });

    const keepAlive = setInterval(() => {
      if (!writeSseComment(res)) clearInterval(keepAlive);
    }, 25000);

    req.on('close', () => clearInterval(keepAlive));
    req.on('aborted', () => clearInterval(keepAlive));
  } catch (err) {
    logError('content/stream', err);
    if (!res.headersSent) {
      return res.status(503).json({ error: 'Content stream unavailable' });
    }
    try {
      res.end();
    } catch {
      /* ignore */
    }
  }
});

export default router;
