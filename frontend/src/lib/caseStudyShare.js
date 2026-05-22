/**
 * Social share helpers for case studies (institution platforms).
 */

export {
  SHARE_PLATFORMS,
  openShareWindow,
  openAllShareWindows,
  copyShareText,
} from './scholarshipShare';

export function getCaseStudyShareUrl(slug) {
  if (typeof window === 'undefined' || !slug) return '';
  return `${window.location.origin}/case-studies/${slug}`;
}

export function buildCaseStudyShareText(caseStudy, shareUrl) {
  const parts = [`Case Study: ${caseStudy.title}`];
  if (caseStudy.category) parts.push(caseStudy.category);
  if (caseStudy.client) parts.push(`Client: ${caseStudy.client}`);
  if (caseStudy.resultSnippet) parts.push(caseStudy.resultSnippet);
  else if (caseStudy.excerpt) parts.push(caseStudy.excerpt);
  parts.push(shareUrl);
  return parts.filter(Boolean).join('\n');
}

export function buildCaseStudyShareLinks(shareUrl, shareText) {
  const u = encodeURIComponent(shareUrl);
  const t = encodeURIComponent(shareText || '');
  const shortText = encodeURIComponent((shareText || '').split('\n')[0] || '');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${shortText}`,
    whatsapp: `https://wa.me/?text=${t}`,
    telegram: `https://t.me/share/url?url=${u}&text=${shortText}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${shortText}`,
    email: `mailto:?subject=${encodeURIComponent('New Case Study — Anmel Inc.')}&body=${t}`,
  };
}
