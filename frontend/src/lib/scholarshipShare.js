/**
 * Social share helpers for scholarship listings.
 */

export function getScholarshipShareUrl(scholarshipId) {
  if (typeof window === 'undefined' || !scholarshipId) return '';
  return `${window.location.origin}/education-consultant/scholarships/${scholarshipId}`;
}

export function buildScholarshipShareText(scholarship, shareUrl) {
  const parts = [
    `New Scholarship: ${scholarship.title}`,
    `${scholarship.university}, ${scholarship.country}`,
  ];
  if (scholarship.amount) parts.push(scholarship.amount);
  if (scholarship.deadline) {
    parts.push(
      `Deadline: ${new Date(scholarship.deadline).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`
    );
  }
  if (scholarship.applicationLink?.startsWith('http')) {
    parts.push(`Apply: ${scholarship.applicationLink}`);
  }
  parts.push(shareUrl);
  return parts.filter(Boolean).join('\n');
}

export function buildScholarshipShareLinks(shareUrl, shareText) {
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
    email: `mailto:?subject=${encodeURIComponent('Scholarship Opportunity')}&body=${t}`,
  };
}

export const SHARE_PLATFORMS = [
  { id: 'facebook', label: 'Facebook', color: '#1877F2' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
  { id: 'x', label: 'X (Twitter)', color: '#000000' },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { id: 'telegram', label: 'Telegram', color: '#0088cc' },
  { id: 'reddit', label: 'Reddit', color: '#FF4500' },
  { id: 'email', label: 'Email', color: '#64748b' },
];

export function openShareWindow(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer,width=640,height=520');
}

/** Stagger opens to reduce popup-blocker issues when sharing to many platforms. */
export async function openAllShareWindows(links, platformIds = SHARE_PLATFORMS.map((p) => p.id)) {
  for (let i = 0; i < platformIds.length; i += 1) {
    const id = platformIds[i];
    const url = links[id];
    if (url) openShareWindow(url);
    if (i < platformIds.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
    }
  }
}

export async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
