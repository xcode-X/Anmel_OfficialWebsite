import { logError } from './logger.js';
import { formatMongoError } from './mongoErrors.js';

/**
 * Wrap async route handlers — forwards errors to Express error middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/** Safe JSON error body for route catch blocks. */
export function sendRouteError(res, err, { fallbackStatus = 503, scope = 'route' } = {}) {
  if (res.headersSent) return;
  logError(scope, err);
  const mongo = formatMongoError(err);
  if (mongo) return res.status(mongo.status).json({ error: mongo.error });
  let status =
    typeof err?.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : fallbackStatus;
  if (status === 500) status = 503;
  return res.status(status).json({ error: err?.message || 'Request failed' });
}
