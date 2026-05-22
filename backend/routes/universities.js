import express from 'express';
import University from '../models/University.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected, withDbQuery } from '../lib/dbReady.js';
import { publishContentChange } from '../lib/contentStreamHub.js';
import { persistMediaFields, resolvePublicMediaUrl } from '../lib/fileStorage.js';
import { UNIVERSITY_MEDIA_FIELDS } from '../lib/mediaFields.js';
import {
  canonicalizeUniversityUrl,
  lookupFromOfficialWebsite,
  mergeUniversityLookup,
  parseCoursesFromText,
} from '../lib/universityWebsiteLookup.js';

const router = express.Router();

// ── List — metadata only (image blobs loaded via /:id/image) ─────────────────
router.get('/', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });

  const rows = await withDbQuery(
    () =>
      University.find()
        .select('-image')
        .sort({ createdAt: -1 })
        .maxTimeMS(8000)
        .lean(),
    { fallback: [], label: 'universities list' },
  );

  const [remoteRows, storedRows] = await Promise.all([
    withDbQuery(
      () =>
        University.find({ image: /^https?:\/\//i })
          .select('_id image')
          .maxTimeMS(8000)
          .lean(),
      { fallback: [], label: 'universities remote images' },
    ),
    withDbQuery(
      () =>
        University.find({
          $or: [
            { image: /^\/uploads\// },
            { image: /^data:/ },
            { image: { $exists: true, $type: 'string', $not: /^https?:\/\// } },
          ],
        })
          .select('_id')
          .maxTimeMS(8000)
          .lean(),
      { fallback: [], label: 'universities stored images' },
    ),
  ]);

  const remoteById = new Map(remoteRows.map((r) => [String(r._id), r.image]));
  const hasImageIds = new Set([
    ...remoteRows.map((r) => String(r._id)),
    ...storedRows.map((r) => String(r._id)),
  ]);

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  res.json(
    rows.map((row) => {
      const id = String(row._id);
      return {
        ...row,
        hasImage: hasImageIds.has(id),
        image: remoteById.get(id),
      };
    }),
  );
});

// ── URL lookup: official website (primary) + Hipolabs/Wikipedia (fallback) ───
// Does not require Firebase/DB — must never return 503.
router.get('/lookup', async (req, res) => {
  try {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  const canonicalUrl = canonicalizeUniversityUrl(String(url));
  let parsedUrl;
  try {
    parsedUrl = new URL(canonicalUrl);
    if (!/^https?:$/i.test(parsedUrl.protocol)) throw new Error('bad protocol');
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  const domain = parsedUrl.hostname.replace(/^www\./, '');

  const fallback = {
    name: '',
    country: '',
    website: canonicalUrl,
    description: '',
    founded: '',
    students: '',
    ranking: '',
    courses: [],
    image: '',
  };

  // ── Hipolabs: find by domain ─────────────────────────────────────────────────
  try {
    const hipoRes = await fetch(
      `https://universities.hipolabs.com/search?domain=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (hipoRes.ok) {
      const hipoData = await hipoRes.json();
      const uni = Array.isArray(hipoData) ? hipoData[0] : null;
      if (uni) {
        fallback.name = uni.name || '';
        fallback.country = uni.country || '';
      }
    }
  } catch { /* non-fatal */ }

  if (!fallback.name) fallback.name = domainToName(domain);

  // ── Wikipedia ───────────────────────────────────────────────────────────────
  try {
    const srRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(fallback.name)}&srlimit=3&format=json&origin=*`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (srRes.ok) {
      const srData = await srRes.json();
      const hit = (srData.query?.search || []).find((r) =>
        /universit|college|institute|school/i.test(r.title),
      ) || srData.query?.search?.[0];

      const pageTitle = hit?.title;
      if (pageTitle) {
        if (!fallback.name || fallback.name === domainToName(domain)) {
          fallback.name = pageTitle;
        }

        const exRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`,
          { signal: AbortSignal.timeout(10000) },
        );
        if (exRes.ok) {
          const exData = await exRes.json();
          const text = Object.values(exData.query?.pages || {})[0]?.extract || '';

          if (text) {
            const descMatch = text.match(/^([^.!?]+[.!?])/);
            const foundedMatch = text.match(/(?:founded|established|chartered|opened)\s+in\s+(\d{4})/i)
              || text.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
            const studMatch = text.match(/([\d,]+)\s+(?:full[- ]time\s+)?(?:enrolled\s+)?students/i)
              || text.match(/enrol(?:l(?:ment|ed))?\s+of\s+([\d,]+)/i);
            if (!fallback.country) {
              const countryMatch = text.match(/(?:located in|based in|situated in|in )\s*([\w\s]+?)(?:\.|,)/i)
                || text.match(/university in ([\w\s]+?)(?:\.|,)/i);
              if (countryMatch) fallback.country = countryMatch[1].trim();
            }
            if (descMatch) fallback.description = descMatch[0];
            if (foundedMatch) fallback.founded = foundedMatch[1];
            if (studMatch) fallback.students = studMatch[1].replace(/,/g, '') + '+';
            fallback.courses = parseCoursesFromText(text);
          }
        }
      }
    }
  } catch { /* non-fatal */ }

  // ── Official university website (programmes, UG/PG/PhD/Diploma, stats) ─────
  let websiteData = { website: canonicalUrl, courses: [], source: 'website' };
  try {
    websiteData = await lookupFromOfficialWebsite(canonicalUrl);
  } catch (err) {
    websiteData = { website: canonicalUrl, courses: [], error: err.message };
  }

  const result = mergeUniversityLookup(websiteData, fallback);
  result.website = canonicalUrl;
  result.lookupSource = websiteData.courses?.length
    ? 'official-website'
    : (fallback.courses?.length ? 'wikipedia' : 'partial');

  if (websiteData.error && !result.courses.length && !result.founded && !result.students) {
    result.lookupWarning = `Website fetch: ${websiteData.error}. Showing fallback data where available.`;
  }

  res.json(result);
  } catch (err) {
    console.warn('[universities] GET /lookup failed:', err.message);
    res.status(200).json({
      name: '',
      country: '',
      website: canonicalizeUniversityUrl(String(req.query.url || '')),
      description: '',
      founded: '',
      students: '',
      courses: [],
      lookupWarning: err.message || 'Lookup failed',
    });
  }
});

// ── Create ────────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const idName = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const body = await persistMediaFields(req.body, UNIVERSITY_MEDIA_FIELDS, 'universities');
    const uni = await University.create({ ...body, idName });
    publishContentChange('universities');
    res.status(201).json(uni);
  } catch (err) {
    console.warn('[universities] POST failed:', err.message);
    const isDuplicate = err.code === 11000;
    res.status(isDuplicate ? 409 : 503).json({ error: isDuplicate ? 'A university with this name already exists.' : err.message });
  }
});

// ── Update ────────────────────────────────────────────────────────────────────
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const body = await persistMediaFields(req.body, UNIVERSITY_MEDIA_FIELDS, 'universities');
    const uni = await University.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!uni) return res.status(404).json({ error: 'University not found' });
    publishContentChange('universities');
    res.json(uni);
  } catch (err) {
    console.warn('[universities] PATCH failed:', err.message);
    res.status(503).json({ error: err.message });
  }
});

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    await University.findByIdAndDelete(req.params.id);
    publishContentChange('universities');
    res.json({ success: true });
  } catch (err) {
    console.warn('[universities] DELETE failed:', err.message);
    res.status(503).json({ error: err.message });
  }
});

// ── Image only — lazy-loaded by public cards (avoids huge list payloads) ─────
router.get('/:id/image', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    let uni = await University.findById(req.params.id, { image: 1 }).lean().catch(() => null);
    if (!uni) uni = await University.findOne({ idName: req.params.id }, { image: 1 }).lean();
    if (!uni) return res.status(404).json({ error: 'University not found' });
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.json({ image: resolvePublicMediaUrl(req, uni.image) || null });
  } catch (err) {
    console.warn('[universities] GET /:id/image failed:', err.message);
    res.status(503).json({ error: err.message });
  }
});

// ── Get by id / slug ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const uni = await University.findById(req.params.id).catch(() => null)
               || await University.findOne({ idName: req.params.id });
    if (!uni) return res.status(404).json({ error: 'University not found' });
    res.json(uni);
  } catch (err) {
    console.warn('[universities] GET /:id failed:', err.message);
    res.status(503).json({ error: err.message });
  }
});

export default router;

// ── Convert a domain hostname into a readable university name ─────────────────
function domainToName(domain) {
  // strip known academic TLD segments: .edu.in, .ac.uk, .edu, .ac, .univ, etc.
  let raw = domain
    .replace(/\.(edu|ac|university|college|univ)(\.([a-z]{2}))?$/i, '')
    .replace(/\.[a-z]{2,3}$/, '')          // remaining TLD
    .replace(/^(the|www)\./i, '');         // leading "the." or "www."

  // camelCase / PascalCase split: "sandipUniversity" → "Sandip University"
  raw = raw.replace(/([a-z])([A-Z])/g, '$1 $2');

  // split by hyphen/underscore
  raw = raw.replace(/[-_]/g, ' ');

  // if the word "university" is embedded, separate it and capitalize
  raw = raw.replace(/\b(university|college|institute|school)\b/gi, (m) =>
    m.charAt(0).toUpperCase() + m.slice(1).toLowerCase()
  );

  // capitalize each word
  const words = raw.split(/\s+/).filter(Boolean).map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  );

  const name = words.join(' ');
  // append "University" if no academic keyword present
  if (!/university|college|institute|school/i.test(name)) return name + ' University';
  return name;
}
