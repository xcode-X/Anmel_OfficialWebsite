/**
 * Subscribe to CMS updates (SSE). When blog, case-studies, or services change on the server,
 * connected public pages can refetch without a manual refresh.
 */
export function subscribeContentStream(onResource) {
  if (typeof EventSource === 'undefined') return () => {};
  const es = new EventSource('/api/content/stream');
  es.onmessage = (ev) => {
    try {
      const d = JSON.parse(ev.data);
      if (d.resource && d.resource !== 'connected') onResource(d.resource);
    } catch {
      /* ignore */
    }
  };
  return () => {
    try {
      es.close();
    } catch {
      /* ignore */
    }
  };
}
