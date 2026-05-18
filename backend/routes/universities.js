import express from 'express';
import University from '../models/University.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { isDbConnected } from '../lib/dbReady.js';

const router = express.Router();

// ── List — excludes large base64 image blobs for fast responses ───────────────
// Returns 503 (not []) when the DB is unavailable so the frontend can retry
// rather than replacing good cached data with an empty array.
// Frontend uses a ?full=1 param to opt-in to images when rendering cards.
router.get('/', async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'db_unavailable' });
  try {
    const projection = req.query.full === '1' ? {} : { image: 0 };
    const unis = await University.find({}, projection).sort({ createdAt: -1 }).lean();
    res.json(unis);
  } catch (err) {
    // Only log unexpected errors — suppress expected reconnection / TLS noise
    const isReconnectNoise = /bad.record.mac|mac.check|decryption.failed|pool.*cleared|connection.pool|ECONNRESET|ETIMEDOUT|buffering.timed.out/i.test(err.message);
    if (!isReconnectNoise) console.warn('[universities] GET failed:', err.message);
    res.status(503).json({ error: 'db_unavailable' });
  }
});

// ── URL lookup proxy (Hipolabs + Wikipedia) — keeps external calls server-side
router.get('/lookup', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  let domain;
  try { domain = new URL(url).hostname.replace(/^www\./, ''); }
  catch { return res.status(400).json({ error: 'Invalid URL' }); }

  const result = { name: '', country: '', website: url, description: '', founded: '', students: '', courses: [] };

  // ── Hipolabs: find by domain ─────────────────────────────────────────────────
  try {
    const hipoRes = await fetch(
      `https://universities.hipolabs.com/search?domain=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (hipoRes.ok) {
      const hipoData = await hipoRes.json();
      const uni = Array.isArray(hipoData) ? hipoData[0] : null;
      if (uni) { result.name = uni.name || ''; result.country = uni.country || ''; }
    }
  } catch { /* non-fatal — Hipolabs may be unreachable */ }

  // ── Derive a search name from the domain if Hipolabs returned nothing ─────────
  if (!result.name) result.name = domainToName(domain);

  // ── Wikipedia: full text for everything else ──────────────────────────────────
  try {
    const srRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(result.name)}&srlimit=3&format=json&origin=*`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (srRes.ok) {
      const srData = await srRes.json();
      // pick the first result that looks like a university
      const hit = (srData.query?.search || []).find(r =>
        /universit|college|institute|school/i.test(r.title)
      ) || srData.query?.search?.[0];

      const pageTitle = hit?.title;
      if (pageTitle) {
        // Use the Wikipedia title as the name if Hipolabs gave nothing
        if (!result.name || result.name === domainToName(domain)) {
          result.name = pageTitle;
        }

        const exRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (exRes.ok) {
          const exData = await exRes.json();
          const text   = Object.values(exData.query?.pages || {})[0]?.extract || '';

          if (text) {
            const descMatch    = text.match(/^([^.!?]+[.!?])/);
            const foundedMatch = text.match(/(?:founded|established|chartered|opened)\s+in\s+(\d{4})/i)
                              || text.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
            const studMatch    = text.match(/([\d,]+)\s+(?:full[- ]time\s+)?(?:enrolled\s+)?students/i)
                              || text.match(/enrol(?:l(?:ment|ed))?\s+of\s+([\d,]+)/i);
            // Country from Wikipedia if Hipolabs didn't give one
            if (!result.country) {
              const countryMatch = text.match(/(?:located in|based in|situated in|in )\s*([\w\s]+?)(?:\.|,)/i)
                                || text.match(/university in ([\w\s]+?)(?:\.|,)/i);
              if (countryMatch) result.country = countryMatch[1].trim();
            }

            if (descMatch)    result.description = descMatch[0];
            if (foundedMatch) result.founded     = foundedMatch[1];
            if (studMatch)    result.students    = studMatch[1].replace(/,/g, '') + '+';
            result.courses = parseCoursesFromText(text);
          }
        }
      }
    }
  } catch { /* non-fatal */ }

  res.json(result);
});

// ── Create ────────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const idName = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uni = new University({ ...req.body, idName });
    await uni.save();
    // Return the full doc including image so the admin list can display it immediately
    res.status(201).json(uni);
  } catch (err) {
    console.warn('[universities] POST failed:', err.message);
    const isDuplicate = err.code === 11000;
    res.status(isDuplicate ? 409 : 500).json({ error: isDuplicate ? 'A university with this name already exists.' : err.message });
  }
});

// ── Delete ────────────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  if (!isDbConnected()) return res.status(503).json({ error: 'Database unavailable' });
  try {
    await University.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.warn('[universities] DELETE failed:', err.message);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

export default router;

// ── Course parser (same logic as frontend, runs server-side) ─────────────────
function parseCoursesFromText(text) {
  if (!text) return [];
  const found = new Set();
  const results = [];

  const add = (name, level) => {
    const key = name.toLowerCase().trim();
    if (found.has(key) || name.length < 5 || name.length > 70) return;
    found.add(key);
    const duration = level === 'Undergraduate' ? '3 Years'
      : level === "Master's" ? '1–2 Years' : '3–4 Years';
    results.push({ name: name.trim(), level, duration });
  };

  for (const [, s] of text.matchAll(/\bBachelor of ([\w][\w\s]{2,40}?)(?=[,.()\n])/g)) add(`Bachelor of ${s.trim()}`, 'Undergraduate');
  for (const [, s] of text.matchAll(/\bMaster of ([\w][\w\s]{2,40}?)(?=[,.()\n])/g))  add(`Master of ${s.trim()}`, "Master's");
  for (const [, s] of text.matchAll(/\bDoctor of ([\w][\w\s]{2,40}?)(?=[,.()\n])/g))  add(`Doctor of ${s.trim()}`, 'PhD');
  for (const [, s] of text.matchAll(/\bPh\.?D\.? in ([\w][\w\s]{2,35}?)(?=[,.()\n])/g)) add(`PhD in ${s.trim()}`, 'PhD');
  for (const [, s] of text.matchAll(/\bMSc in ([\w][\w\s]{2,35}?)(?=[,.()\n])/g))    add(`MSc ${s.trim()}`, "Master's");
  for (const [, s] of text.matchAll(/\bBSc in ([\w][\w\s]{2,35}?)(?=[,.()\n])/g))    add(`BSc ${s.trim()}`, 'Undergraduate');

  if (/\bMBA\b/i.test(text))  add('MBA (Master of Business Administration)', "Master's");
  if (/\bMBBS\b/i.test(text)) add('MBBS (Bachelor of Medicine, Bachelor of Surgery)', 'Undergraduate');
  if (/\bLLB\b/i.test(text))  add('LLB (Bachelor of Laws)', 'Undergraduate');
  if (/\bLLM\b/i.test(text))  add('LLM (Master of Laws)', "Master's");
  if (/\bMD\b/.test(text))    add('MD (Doctor of Medicine)', 'PhD');
  if (/\bBEng\b/i.test(text)) add('BEng (Bachelor of Engineering)', 'Undergraduate');
  if (/\bMEng\b/i.test(text)) add('MEng (Master of Engineering)', "Master's");

  if (results.length < 4) {
    for (const [, area] of text.matchAll(/\b(?:School|Faculty|College|Department|Institute) of ([\w][\w\s]{2,35}?)(?=[,.()\n])/g)) {
      add(area.trim(), 'Undergraduate');
    }
  }

  return results.slice(0, 20);
}

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
