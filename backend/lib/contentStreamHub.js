/** Content change notifications — Firestore meta doc + legacy SSE fan-out. */
import { bumpRealtime } from './firestoreDb.js';

const listeners = new Set();

export function registerContentStreamClient(res) {
  listeners.add(res);
  res.on('close', () => listeners.delete(res));
}

export function publishContentChange(resource, meta = {}) {
  bumpRealtime(resource, meta);
  const payload = JSON.stringify({ resource, ...meta, ts: Date.now() });
  const line = `data: ${payload}\n\n`;
  for (const client of [...listeners]) {
    try {
      client.write(line);
    } catch {
      listeners.delete(client);
    }
  }
}
