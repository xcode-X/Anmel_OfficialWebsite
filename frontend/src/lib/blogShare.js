/**
 * Social share URLs for blog posts. Opens in a new tab; Medium uses new-story + clipboard (no native share URL).
 */
export function getBlogPostUrl(slug) {
  if (typeof window === 'undefined' || !slug) return '';
  return `${window.location.origin}/blog/${slug}`;
}

export function buildShareLinks(postUrl, title) {
  const u = encodeURIComponent(postUrl);
  const t = encodeURIComponent(title || '');
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    /** Medium has no generic “share this URL” — open editor; we copy the post URL for paste/import. */
    medium: 'https://medium.com/new-story',
  };
}

export async function copyPostUrlForMedium(postUrl) {
  try {
    await navigator.clipboard.writeText(postUrl);
    return true;
  } catch {
    return false;
  }
}
