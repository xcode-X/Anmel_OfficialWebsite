/**
 * Optional server-side social posting when API credentials are configured.
 * Falls back to share-intent URLs when credentials are missing.
 */

function siteOrigin() {
  return (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
}

function buildInstitutionShareLinks(shareUrl, shareText, emailSubject = 'Anmel Inc.') {
  const u = encodeURIComponent(shareUrl);
  const t = encodeURIComponent(shareText);
  const shortText = encodeURIComponent((shareText || '').split('\n')[0] || '');

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${shortText}`,
    whatsapp: `https://wa.me/?text=${t}`,
    telegram: `https://t.me/share/url?url=${u}&text=${shortText}`,
    reddit: `https://www.reddit.com/submit?url=${u}&title=${shortText}`,
    email: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${t}`,
  };
}

export function buildScholarshipSharePayload(scholarship) {
  const shareUrl = `${siteOrigin()}/education-consultant/scholarships/${scholarship._id}`;
  const lines = [
    `New Scholarship: ${scholarship.title}`,
    `${scholarship.university}, ${scholarship.country}`,
  ];
  if (scholarship.amount) lines.push(scholarship.amount);
  if (scholarship.deadline) {
    lines.push(
      `Deadline: ${new Date(scholarship.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`
    );
  }
  if (scholarship.applicationLink?.startsWith('http')) {
    lines.push(`Apply: ${scholarship.applicationLink}`);
  }
  lines.push(shareUrl);

  const shareText = lines.filter(Boolean).join('\n');
  const links = buildInstitutionShareLinks(shareUrl, shareText, 'Scholarship Opportunity');

  return { shareUrl, shareText, links };
}

export function buildCaseStudySharePayload(caseStudy) {
  const shareUrl = `${siteOrigin()}/case-studies/${caseStudy.slug}`;
  const lines = [`Case Study: ${caseStudy.title}`];
  if (caseStudy.category) lines.push(caseStudy.category);
  if (caseStudy.client) lines.push(`Client: ${caseStudy.client}`);
  if (caseStudy.resultSnippet) lines.push(caseStudy.resultSnippet);
  else if (caseStudy.excerpt) lines.push(caseStudy.excerpt);
  lines.push(shareUrl);

  const shareText = lines.filter(Boolean).join('\n');
  const links = buildInstitutionShareLinks(shareUrl, shareText, 'New Case Study — Anmel Inc.');

  return { shareUrl, shareText, links };
}

async function postToFacebook(message, link) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!token || !pageId) return null;

  const body = new URLSearchParams({
    message,
    link,
    access_token: token,
  });

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Facebook post failed');
  }
  return { postId: data.id };
}

async function postToLinkedIn(text, link) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId = process.env.LINKEDIN_ORG_ID;
  if (!token || !orgId) return null;

  const payload = {
    author: `urn:li:organization:${orgId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'ARTICLE',
        media: [{ status: 'READY', originalUrl: link }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'LinkedIn post failed');
  }
  return { postId: data.id };
}

async function publishContentToSocial({ shareUrl, shareText, links }) {
  const results = [];

  const apiTargets = [
    { platform: 'facebook', run: () => postToFacebook(shareText, shareUrl) },
    { platform: 'linkedin', run: () => postToLinkedIn(shareText, shareUrl) },
  ];

  for (const { platform, run } of apiTargets) {
    try {
      const apiResult = await run();
      if (apiResult) {
        results.push({ platform, ok: true, method: 'api', ...apiResult });
      } else {
        results.push({ platform, ok: true, method: 'intent', url: links[platform] });
      }
    } catch (err) {
      results.push({
        platform,
        ok: false,
        method: 'intent',
        url: links[platform],
        error: err.message,
      });
    }
  }

  const intentPlatforms = ['x', 'whatsapp', 'telegram', 'reddit', 'email'];
  for (const platform of intentPlatforms) {
    results.push({ platform, ok: true, method: 'intent', url: links[platform] });
  }

  return { shareUrl, shareText, links, results };
}

/** Attempt API posts where configured; always return intent links for every platform. */
export async function publishScholarshipToSocial(scholarship) {
  return publishContentToSocial(buildScholarshipSharePayload(scholarship));
}

export async function publishCaseStudyToSocial(caseStudy) {
  return publishContentToSocial(buildCaseStudySharePayload(caseStudy));
}
