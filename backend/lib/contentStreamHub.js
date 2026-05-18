/** SSE fan-out for public pages to refetch when CMS content changes (blog, case studies, services). */
const listeners = new Set();

export function registerContentStreamClient(res) {
  listeners.add(res);
  res.on('close', () => listeners.delete(res));
}

export function publishContentChange(resource) {
  const payload = JSON.stringify({ resource, ts: Date.now() });
  const line = `data: ${payload}\n\n`;
  for (const client of [...listeners]) {
    try {
      client.write(line);
    } catch {
      listeners.delete(client);
    }
  }
}
