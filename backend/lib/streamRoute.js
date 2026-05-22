import { assertAdminFromToken } from './adminStreamAuth.js';
import { logError } from './logger.js';
import { initSseResponse, writeSseEvent, attachSseKeepAlive } from './sse.js';

/**
 * Admin-only SSE endpoint with safe auth + error handling.
 */
export function createAdminSseRoute(listeners, { connectedPayload } = {}) {
  return async (req, res) => {
    try {
      const token = req.query.token;
      await assertAdminFromToken(typeof token === 'string' ? token : '');

      initSseResponse(res);
      writeSseEvent(res, connectedPayload || { event: 'connected', ts: Date.now() });
      attachSseKeepAlive(listeners, req, res);
    } catch (err) {
      if (!res.headersSent) {
        let status =
          typeof err?.status === 'number' && err.status >= 400 && err.status < 600
            ? err.status
            : 503;
        if (status === 500) status = 503;
        if (status >= 500) logError('sse', err, { path: req.path });
        return res.status(status).json({ error: err.message || 'Stream unavailable' });
      }
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
  };
}
