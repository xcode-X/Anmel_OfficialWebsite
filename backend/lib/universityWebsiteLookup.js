/**
 * Fetch university metadata and programmes from the official website (server-side).
 */

const FETCH_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const PROGRAM_LINK_RE =
  /program|programme|course|study|studies|degree|academic|facult|school-of|admission|undergrad|postgrad|graduate|diploma|phd|master|bachelor/i;

const MAX_EXTRA_PAGES = 2;
const PAGE_TIMEOUT_MS = 9000;
const LOOKUP_TOTAL_MS = 20000;
const MAX_HTML_BYTES = 450000;

/** Pick the first valid http(s) URL when the field contains duplicates or extra text. */
export function canonicalizeUniversityUrl(input) {
  const raw = String(input || '').trim();
  const matches = raw.match(/https?:\/\/[^\s"'<>]+/gi);
  if (matches?.length) {
    try {
      const u = new URL(matches[0]);
      if (/^https?:$/i.test(u.protocol)) return u.href;
    } catch {
      /* fall through */
    }
  }
  try {
    return new URL(raw).href;
  } catch {
    return raw;
  }
}

/** @param {string} level */
function defaultDuration(level) {
  switch (level) {
    case 'PhD':
      return '3–4 Years';
    case "Master's":
      return '1–2 Years';
    case 'Diploma':
      return '1–2 Years';
    case 'Certificate':
      return '6–12 Months';
    case 'Foundation':
      return '1 Year';
    default:
      return '3 Years';
  }
}

/**
 * @param {string} text
 * @param {string} [context]
 */
export function inferDegreeLevel(text, context = '') {
  const t = `${text} ${context}`.toLowerCase();
  if (/\b(ph\.?\s*d|doctorate|doctoral|d\.?\s*phil|doctor of philosophy|research degree)\b/.test(t)) {
    return 'PhD';
  }
  if (/\b(diploma|h\.?\s*n\.?\s*d|higher national diploma|associate degree)\b/.test(t)) {
    return 'Diploma';
  }
  if (/\b(certificate|certification|short course|professional certificate)\b/.test(t) && !/\bmaster|postgrad/i.test(t)) {
    return 'Certificate';
  }
  if (/\b(foundation year|foundation programme|foundation program|pathway|preparatory|pre-sessional)\b/.test(t)) {
    return 'Foundation';
  }
  if (/\b(undergraduate|undergrad|bachelor|b\.?\s*sc|b\.?\s*a\b|b\.?\s*eng|llb|mbbs|b\.?\s*com|b\.?\s*tech|first degree|\bug\b)\b/.test(t)) {
    return 'Undergraduate';
  }
  if (/\b(postgraduate|postgrad|master'?s?|m\.?\s*sc|m\.?\s*a\b|m\.?\s*eng|mba|llm|m\.?\s*phil|\bpg\b|graduate taught|taught master)\b/.test(t)) {
    return "Master's";
  }
  return 'Undergraduate';
}

/**
 * @param {string} html
 */
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} html
 */
function extractMetaFromHtml(html) {
  const meta = { title: '', description: '', image: '' };
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const ogDesc = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const titleTag = html.match(/<title[^>]*>([^<]{2,120})<\/title>/i);
  const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

  if (ogTitle) meta.title = decodeHtmlEntities(ogTitle[1].trim());
  else if (titleTag) meta.title = decodeHtmlEntities(titleTag[1].trim());

  if (ogDesc) meta.description = decodeHtmlEntities(ogDesc[1].trim());
  else if (metaDesc) meta.description = decodeHtmlEntities(metaDesc[1].trim());

  if (ogImage) meta.image = ogImage[1].trim();

  return meta;
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * @param {string} url
 */
async function fetchHtml(url, signal) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': FETCH_UA,
      Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: signal || AbortSignal.timeout(PAGE_TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}

/**
 * @param {string} html
 * @param {string} baseUrl
 */
function discoverProgramPageUrls(html, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const seen = new Set();
  const scored = [];

  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let href = m[1].trim();
    if (!href || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
    try {
      const abs = new URL(href, baseUrl).href;
      if (!abs.startsWith(origin)) continue;
      const path = new URL(abs).pathname;
      if (!PROGRAM_LINK_RE.test(path) && !PROGRAM_LINK_RE.test(htmlToText(m[2]))) continue;
      if (seen.has(abs)) continue;
      seen.add(abs);
      let score = 0;
      if (/program|programme|course/i.test(path)) score += 3;
      if (/undergrad|postgrad|graduate|degree/i.test(path)) score += 2;
      if (/facult|academic|study/i.test(path)) score += 1;
      scored.push({ url: abs, score });
    } catch {
      /* invalid url */
    }
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.url).slice(0, MAX_EXTRA_PAGES);
}

/**
 * @param {string} text
 */
export function parseCoursesFromText(text) {
  if (!text) return [];
  const found = new Set();
  const results = [];

  const add = (name, levelHint = '') => {
    const clean = name.replace(/\s+/g, ' ').trim();
    const key = clean.toLowerCase();
    if (found.has(key) || clean.length < 4 || clean.length > 90) return;
    found.add(key);
    const level = inferDegreeLevel(clean, levelHint);
    results.push({ name: clean, level, duration: defaultDuration(level) });
  };

  for (const [, raw] of text.matchAll(/\bBachelor of ([\w][\w\s/&-]{2,45}?)(?=[,.()\n]|$)/gi)) {
    add(`Bachelor of ${raw.trim()}`, 'Undergraduate');
  }
  for (const [, raw] of text.matchAll(/\bMaster of ([\w][\w\s/&-]{2,45}?)(?=[,.()\n]|$)/gi)) {
    add(`Master of ${raw.trim()}`, "Master's");
  }
  for (const [, raw] of text.matchAll(/\bDoctor of ([\w][\w\s/&-]{2,40}?)(?=[,.()\n]|$)/gi)) {
    add(`Doctor of ${raw.trim()}`, 'PhD');
  }
  for (const [, raw] of text.matchAll(/\bPh\.?\s*D\.?\s*(?:in|of)?\s*([\w][\w\s/&-]{2,40}?)(?=[,.()\n]|$)/gi)) {
    add(`PhD in ${raw.trim()}`, 'PhD');
  }
  for (const [, raw] of text.matchAll(/\bM\.?\s*Sc\.?\s*(?:in|of)?\s*([\w][\w\s/&-]{2,40}?)(?=[,.()\n]|$)/gi)) {
    add(`MSc in ${raw.trim()}`, "Master's");
  }
  for (const [, raw] of text.matchAll(/\bB\.?\s*Sc\.?\s*(?:in|of)?\s*([\w][\w\s/&-]{2,40}?)(?=[,.()\n]|$)/gi)) {
    add(`BSc in ${raw.trim()}`, 'Undergraduate');
  }
  for (const [, raw] of text.matchAll(/\bDiploma (?:in|of)?\s*([\w][\w\s/&-]{2,40}?)(?=[,.()\n]|$)/gi)) {
    add(`Diploma in ${raw.trim()}`, 'Diploma');
  }
  for (const [, raw] of text.matchAll(/\bFoundation (?:in|of)?\s*([\w][\w\s/&-]{2,35}?)(?=[,.()\n]|$)/gi)) {
    add(`Foundation in ${raw.trim()}`, 'Foundation');
  }
  for (const [, raw] of text.matchAll(/\bCertificate (?:in|of)?\s*([\w][\w\s/&-]{2,35}?)(?=[,.()\n]|$)/gi)) {
    add(`Certificate in ${raw.trim()}`, 'Certificate');
  }

  if (/\bMBA\b/i.test(text)) add('MBA (Master of Business Administration)', "Master's");
  if (/\bMBBS\b/i.test(text)) add('MBBS', 'Undergraduate');
  if (/\bLLB\b/i.test(text)) add('LLB (Bachelor of Laws)', 'Undergraduate');
  if (/\bLLM\b/i.test(text)) add('LLM (Master of Laws)', "Master's");
  if (/\bBEng\b/i.test(text)) add('BEng (Bachelor of Engineering)', 'Undergraduate');
  if (/\bMEng\b/i.test(text)) add('MEng (Master of Engineering)', "Master's");

  for (const [, area] of text.matchAll(
    /\b(?:School|Faculty|College|Department|Institute) of ([\w][\w\s/&-]{2,40}?)(?=[,.()\n<]|$)/gi,
  )) {
    add(`${area.trim()} (Faculty pathway)`, 'Undergraduate');
  }

  for (const [, line] of text.matchAll(
    /<(?:h[2-4]|li|strong)[^>]*>\s*([^<]{8,70}(?:BSc|BA|MSc|MBA|PhD|Bachelor|Master|Diploma|Certificate)[^<]{0,40})\s*</gi,
  )) {
    add(htmlToText(line), '');
  }

  return results.slice(0, 40);
}

/**
 * @param {string} html
 */
function parseCoursesFromHtml(html) {
  const courses = [];
  const seen = new Set();
  const merge = (list) => {
    for (const c of list) {
      const key = `${c.name}|${c.level}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        courses.push(c);
      }
    }
  };

  merge(parseCoursesFromText(htmlToText(html)));

  for (const m of html.matchAll(/<a[^>]+href=["'][^"']*["'][^>]*>([\s\S]{4,80}?)<\/a>/gi)) {
    const label = htmlToText(m[1]);
    if (
      /\b(bsc|b\.?a|msc|m\.?a|mba|phd|bachelor|master|diploma|certificate|foundation|undergrad|postgrad)\b/i.test(label)
      && label.length >= 6
      && label.length <= 85
    ) {
      const level = inferDegreeLevel(label);
      const key = `${label}|${level}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        courses.push({ name: label, level, duration: defaultDuration(level) });
      }
    }
  }

  for (const block of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(block[1]);
      const nodes = Array.isArray(json) ? json : [json];
      for (const node of nodes) {
        if (node['@type'] === 'Course' || node['@type'] === 'EducationalOccupationalProgram') {
          const name = node.name || node.title;
          if (name) {
            const level = inferDegreeLevel(String(name), node.educationalLevel || '');
            const key = `${name}|${level}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              courses.push({
                name: String(name).trim(),
                level,
                duration: defaultDuration(level),
              });
            }
          }
        }
      }
    } catch {
      /* ignore invalid json-ld */
    }
  }

  return courses.slice(0, 40);
}

/**
 * @param {string} text
 */
function extractStatsFromText(text) {
  const stats = { description: '', founded: '', students: '' };
  const descMatch = text.match(/^([^.!?]{40,280}[.!?])/);
  if (descMatch) stats.description = descMatch[1].trim();

  const foundedMatch =
    text.match(/(?:founded|established|chartered|opened|since)\s+(?:in\s+)?(\d{4})/i)
    || text.match(/\bestablished[:\s]+(\d{4})/i);
  if (foundedMatch) stats.founded = foundedMatch[1];

  const studMatch =
    text.match(/([\d,.]+)\s*(?:\+)?\s*(?:full[- ]time\s+)?(?:students|undergraduates|enrol)/i)
    || text.match(/enrol(?:lment|led)?\s+(?:of\s+)?([\d,.]+)/i)
    || text.match(/student population[:\s]+([\d,.]+)/i);
  if (studMatch) {
    stats.students = studMatch[1].replace(/,/g, '').replace(/\.$/, '') + '+';
  }

  return stats;
}

/**
 * @param {string} title
 */
function cleanUniversityTitle(title) {
  return title
    .replace(/\s*[\|–-]\s*.*$/, '')
    .replace(/\s*:\s*Home.*$/i, '')
    .replace(/\s*Official Site.*$/i, '')
    .trim();
}

/**
 * Fetch university data from the official website URL.
 * @param {string} url
 */
export async function lookupFromOfficialWebsite(url) {
  const canonical = canonicalizeUniversityUrl(url);
  const result = {
    name: '',
    country: '',
    website: canonical,
    description: '',
    founded: '',
    students: '',
    ranking: '',
    courses: [],
    image: '',
    source: 'website',
  };

  const abort = new AbortController();
  const totalTimer = setTimeout(() => abort.abort(), LOOKUP_TOTAL_MS);

  let homepageHtml;
  try {
    homepageHtml = await fetchHtml(canonical, abort.signal);
  } catch (err) {
    clearTimeout(totalTimer);
    const msg = err.name === 'AbortError' ? 'Website lookup timed out' : (err.message || 'Could not reach website');
    return { ...result, error: msg };
  }

  const meta = extractMetaFromHtml(homepageHtml);
  if (meta.title) result.name = cleanUniversityTitle(meta.title);
  if (meta.description) result.description = meta.description.slice(0, 500);
  if (meta.image && /^https?:\/\//i.test(meta.image)) {
    try {
      result.image = new URL(meta.image, canonical).href;
    } catch {
      result.image = meta.image;
    }
  }

  const homeText = htmlToText(homepageHtml);
  const homeStats = extractStatsFromText(homeText);
  if (!result.description && homeStats.description) result.description = homeStats.description;
  if (homeStats.founded) result.founded = homeStats.founded;
  if (homeStats.students) result.students = homeStats.students;

  const courseMap = new Map();
  const addCourses = (list) => {
    for (const c of list) {
      const key = c.name.toLowerCase();
      if (!courseMap.has(key)) courseMap.set(key, c);
    }
  };

  addCourses(parseCoursesFromHtml(homepageHtml));

  if (!abort.signal.aborted) {
    const extraUrls = discoverProgramPageUrls(homepageHtml, canonical);
    const fetches = extraUrls.map(async (pageUrl) => {
      if (abort.signal.aborted) return [];
      try {
        const html = await fetchHtml(pageUrl, abort.signal);
        return parseCoursesFromHtml(html);
      } catch {
        return [];
      }
    });

    const batches = await Promise.all(fetches);
    for (const batch of batches) addCourses(batch);
  }

  clearTimeout(totalTimer);
  result.courses = [...courseMap.values()];

  const countryMatch = homeText.match(
    /(?:located in|based in|situated in|address[:\s]+[^,]+,\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/,
  );
  if (countryMatch) result.country = countryMatch[1].trim();

  return result;
}

/**
 * Merge website lookup with fallback (Hipolabs/Wikipedia) data.
 * @param {object} primary
 * @param {object} fallback
 */
export function mergeUniversityLookup(primary, fallback) {
  const out = { ...fallback, ...primary, website: primary.website || fallback.website };
  if (!out.name) out.name = fallback.name;
  if (!out.country) out.country = fallback.country;
  if (!out.description) out.description = fallback.description;
  if (!out.founded) out.founded = fallback.founded;
  if (!out.students) out.students = fallback.students;
  if (!out.image) out.image = fallback.image || '';

  const byName = new Map();
  for (const c of [...(fallback.courses || []), ...(primary.courses || [])]) {
    if (c?.name) byName.set(c.name.toLowerCase(), c);
  }
  out.courses = [...byName.values()].slice(0, 40);
  return out;
}
