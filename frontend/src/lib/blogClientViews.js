/**
 * Client-side view counts when the API is unavailable or posts are placeholders.
 * Server-side counts are authoritative when MongoDB returns posts.
 */
const STORAGE_KEY = 'intelera_blog_views_v1';

const PLACEHOLDER_SEEDS = {
  'why-security-matters': 412,
  'compliance-basics': 689,
  'secure-api-design': 523,
};

function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** One-time seed for demo placeholders when DB has no posts. */
export function initPlaceholderViewSeeds() {
  if (typeof window === 'undefined') return;
  const map = readMap();
  let changed = false;
  for (const [slug, seed] of Object.entries(PLACEHOLDER_SEEDS)) {
    if (map[slug] == null) {
      map[slug] = seed;
      changed = true;
    }
  }
  if (changed) writeMap(map);
}

export function getLocalViewCount(slug) {
  if (typeof window === 'undefined' || !slug) return 0;
  const map = readMap();
  return typeof map[slug] === 'number' ? map[slug] : 0;
}

export function setLocalViewCount(slug, n) {
  if (typeof window === 'undefined' || !slug) return;
  const map = readMap();
  map[slug] = n;
  writeMap(map);
}

export function incrementLocalViewCount(slug) {
  const n = getLocalViewCount(slug) + 1;
  setLocalViewCount(slug, n);
  return n;
}

export function dispatchBlogViewsUpdated(slug, views) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('intelera-blog-views', { detail: { slug, views } }));
}
