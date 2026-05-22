/**
 * Server-Sent Events helpers (Nginx/VPS-safe).
 */
export function isSseRequest(req) {
  const accept = String(req.headers.accept || '');
  const path = req.path || req.url || '';
  return accept.includes('text/event-stream') || /\/stream(\?|$)/.test(path);
}

export function initSseResponse(res) {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();
}

export function writeSseEvent(res, data) {
  if (res.writableEnded || res.destroyed) return false;
  try {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    return true;
  } catch {
    return false;
  }
}

export function writeSseComment(res, comment = 'ping') {
  if (res.writableEnded || res.destroyed) return false;
  try {
    res.write(`: ${comment}\n\n`);
    return true;
  } catch {
    return false;
  }
}

export function attachSseKeepAlive(set, req, res, { onClose } = {}) {
  set.add(res);
  const keepAlive = setInterval(() => writeSseComment(res), 25000);

  const cleanup = () => {
    clearInterval(keepAlive);
    set.delete(res);
    onClose?.();
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
  res.on('error', cleanup);
  return cleanup;
}

export function broadcastSse(set, payload) {
  const line = JSON.stringify(payload);
  for (const client of [...set]) {
    if (client.writableEnded || client.destroyed) {
      set.delete(client);
      continue;
    }
    try {
      client.write(`data: ${line}\n\n`);
    } catch {
      set.delete(client);
    }
  }
}
