import { defaultCourses } from './coursesData';

const ACADEMY_COURSE_SLUGS = new Set(defaultCourses.map((c) => c.slug));

const courseTitleBySlug = Object.fromEntries(
  defaultCourses.map((c) => [c.slug, c.title]),
);

export function getAcademyCourseTitle(slug) {
  if (!slug) return '';
  return courseTitleBySlug[slug] || slug;
}

export function isScholarshipCourseSlug(courseSlug) {
  return String(courseSlug || '').startsWith('scholarship-');
}

/** Academy / education program application (intern intake). */
export function isInternApplication(row) {
  if (!row) return false;
  if (row.applicationType === 'intern') return true;
  const slug = String(row.courseSlug || '').trim();
  if (!slug || slug === 'general') return false;
  if (isScholarshipCourseSlug(slug)) return false;
  return ACADEMY_COURSE_SLUGS.has(slug);
}
