/** Lightweight public list rows — avoid shipping base64 blobs in list APIs. */

const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/i;

export function extractFirstImageFromHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const match = html.match(IMG_SRC_RE);
  return match?.[1]?.trim() || '';
}

export function hasMediaValue(value) {
  const v = String(value || '').trim();
  if (!v) return false;
  return /^https?:\/\//i.test(v) || /^\/?uploads\//i.test(v) || v.startsWith('data:');
}

export function remoteMediaUrl(value) {
  const v = String(value || '').trim();
  return /^https?:\/\//i.test(v) ? v : undefined;
}

export function coverApiPath(basePath, slug) {
  return `${basePath}/${encodeURIComponent(slug)}/cover`;
}

/** Pick cover media for a blog post (featured field, then first inline image). */
export function resolveBlogCoverSource(post) {
  const featured = String(post?.featuredImage || '').trim();
  if (hasMediaValue(featured)) return featured;
  const inline = extractFirstImageFromHtml(post?.content);
  if (hasMediaValue(inline)) return inline;
  return '';
}
