import { defaultCourses } from './coursesData';

function mergeModuleList(apiMods, defMods) {
  const api = Array.isArray(apiMods) ? apiMods : [];
  const def = Array.isArray(defMods) ? defMods : [];
  if (api.length === 0) return def;
  if (def.length === 0) return api;
  const max = Math.max(api.length, def.length);
  const out = [];
  for (let i = 0; i < max; i += 1) {
    const a = api[i];
    const d = def[i];
    if (!a && !d) continue;
    if (!a) {
      out.push(d);
      continue;
    }
    if (!d) {
      out.push(a);
      continue;
    }
    out.push({
      ...d,
      ...a,
      title: a.title || d.title,
      summary: a.summary != null && String(a.summary).trim() !== '' ? a.summary : d.summary,
      topics: Array.isArray(a.topics) && a.topics.length > 0 ? a.topics : d.topics,
      labs: Array.isArray(a.labs) && a.labs.length > 0 ? a.labs : d.labs,
      assignment:
        a.assignment != null && String(a.assignment).trim() !== ''
          ? a.assignment
          : d.assignment,
      skillsGained:
        Array.isArray(a.skillsGained) && a.skillsGained.length > 0 ? a.skillsGained : d.skillsGained,
    });
  }
  return out;
}

export function mergeCourseDetail(apiData, slug) {
  const def = defaultCourses.find((c) => c.slug === slug);
  if (!def) {
    return apiData && typeof apiData === 'object' && apiData.slug ? { ...apiData } : null;
  }
  const pick = (a, b, preferLen) => {
    if (preferLen) return Array.isArray(a) && a.length > 0 ? a : b;
    return a != null && a !== '' ? a : b;
  };
  return {
    ...def,
    ...apiData,
    title: apiData.title || def.title,
    tagline: pick(apiData.tagline, def.tagline),
    shortDescription: pick(apiData.shortDescription, def.shortDescription),
    description: pick(apiData.description, def.description),
    level: pick(apiData.level, def.level),
    durationWeeks: apiData.durationWeeks ?? def.durationWeeks,
    format: pick(apiData.format, def.format),
    audience: pick(apiData.audience, def.audience),
    outcomes: pick(apiData.outcomes, def.outcomes),
    certification: pick(apiData.certification, def.certification),
    highlights: pick(apiData.highlights, def.highlights, true),
    modules: mergeModuleList(apiData.modules, def.modules),
    prerequisites: pick(apiData.prerequisites, def.prerequisites, true),
    category: apiData.category || def.category,
    resourceGuide: pick(apiData.resourceGuide, def.resourceGuide, true),
  };
}