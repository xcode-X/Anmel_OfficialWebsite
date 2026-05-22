/** Course / Program options for scholarship applications (global catalog, no admin setup). */

import { getGlobalAcademicProgramsFlat, GLOBAL_PROGRAM_GROUPS } from './globalAcademicPrograms.js';

export function normalizeCourseOptions(sources) {
  const list = Array.isArray(sources) ? sources : [sources];
  const seen = new Set();
  const out = [];

  for (const raw of list) {
    const items = Array.isArray(raw) ? raw : [];
    for (const c of items) {
      const name = typeof c === 'string' ? c.trim() : String(c?.name || '').trim();
      const level = typeof c === 'object' && c?.level ? String(c.level).trim() : '';
      if (!name) continue;
      const key = `${name.toLowerCase()}|${level.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        name,
        level,
        label: level ? `${name} (${level})` : name,
        group: c?.group || '',
      });
    }
  }

  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/** Worldwide standard programs — always available on scholarship application forms. */
export function buildScholarshipCourseOptions() {
  return normalizeCourseOptions(
    getGlobalAcademicProgramsFlat().map((p) => ({
      name: p.name,
      level: p.level,
      group: p.group,
    })),
  );
}

export { GLOBAL_PROGRAM_GROUPS };

export function courseSelectValueForOptions(course, courseOptions) {
  const current = String(course || '').trim();
  if (!current) return '';
  const exact = courseOptions.find((o) => o.name === current || o.label === current);
  if (exact) return exact.name;
  if (courseOptions.length > 0) return '__other__';
  return current;
}
