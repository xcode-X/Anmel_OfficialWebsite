import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  Library,
  Layers,
  Shield,
  Sparkles,
  Target,
  Users,
  Code2,
  Palette,
} from 'lucide-react';
import api, { publicApi } from '../lib/api';
import { deferIdle } from '../lib/deferIdle';
import { defaultCourses } from '../lib/coursesData';
import { mergeCourseDetail } from '../lib/mergeCourseDetail';
import { educationHeroImage, getCourseHeroImage } from '../lib/siteImages';
import RemoteImage from '../components/ui/RemoteImage';
import CourseSyllabusModal from '../components/education/CourseSyllabusModal';
import { downloadSyllabusPdf } from '../lib/syllabusPdf';

function useNavCourses(coursesFromApi) {
  return useMemo(() => {
    const apiBySlug = new Map(coursesFromApi.map((c) => [c.slug, c]));
    const ordered = defaultCourses.map((def) => {
      const api = apiBySlug.get(def.slug);
      if (!api) return def;
      return {
        ...def,
        ...api,
        title: api.title || def.title,
        shortDescription:
          (api.shortDescription && String(api.shortDescription).trim()) || def.shortDescription,
        tagline: api.tagline || def.tagline,
        category: api.category || def.category,
      };
    });
    const extras = coursesFromApi
      .filter((c) => !defaultCourses.some((d) => d.slug === c.slug))
      .sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
    return [...ordered, ...extras];
  }, [coursesFromApi]);
}

const categoryMeta = {
  cybersecurity: {
    label: 'Cybersecurity',
    Icon: Shield,
    gradient: 'from-violet-600 to-indigo-700',
    chip: 'bg-violet-100 text-violet-800 ring-violet-200',
  },
  'web-development': {
    label: 'Web development',
    Icon: Code2,
    gradient: 'from-sky-600 to-cyan-700',
    chip: 'bg-sky-100 text-sky-800 ring-sky-200',
  },
  'ux-design': {
    label: 'UX / UI design',
    Icon: Palette,
    gradient: 'from-fuchsia-600 to-rose-700',
    chip: 'bg-fuchsia-100 text-fuchsia-900 ring-fuchsia-200',
  },
};

export default function Education() {
  const [courses, setCourses] = useState(defaultCourses);
  const [syllabusCourse, setSyllabusCourse] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTrack = searchParams.get('track') || 'all';
  const filterParam = ['all', 'cybersecurity', 'web-development', 'ux-design'].includes(rawTrack)
    ? rawTrack
    : 'all';
  const navCourses = useNavCourses(courses);

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      publicApi.courses().then((d) => { if (!cancelled) setCourses(Array.isArray(d) ? d : []); }).catch(() => {});
    }, 400);
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);

  const setTrack = (track) => {
    const next = new URLSearchParams(searchParams);
    if (track === 'all') next.delete('track');
    else next.set('track', track);
    setSearchParams(next, { replace: true });
  };

  const filtered =
    filterParam === 'all'
      ? navCourses
      : navCourses.filter((c) => c.category === filterParam);

  return (
    <div className="bg-white">
      <CourseSyllabusModal
        key={syllabusCourse?.slug ?? 'closed'}
        course={syllabusCourse}
        open={!!syllabusCourse}
        onClose={() => setSyllabusCourse(null)}
      />
      <section className="relative min-h-[min(520px,85vh)] overflow-hidden pt-28">
        <div className="absolute inset-0">
          <RemoteImage
            src={educationHeroImage}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fallbackSeed="education-hero"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-violet-950/90 to-stone-900/85" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_80%_0%,rgba(124,58,237,0.35),transparent)]" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[min(520px,85vh)] max-w-7xl flex-col justify-end px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">
              <GraduationCap className="h-4 w-4" strokeWidth={2} />
              Anmel Inc Education
            </div>
            <h1
              className="mt-6 text-4xl font-bold leading-[1.08] text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Learn security & web engineering—{' '}
              <span className="bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
                with practitioners
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-200 sm:text-xl">
              Introductory tracks in cybersecurity, web development, and UX/UI design—live sessions, gentle labs, and
              replays in our Student Learning Management Portal after you enroll.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-[#EA580C]"
              >
                Browse catalog
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <Link
                to="/student"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Student LMS
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Talk to admissions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { n: `${navCourses.length}`, l: 'Introductory programs', Icon: Layers },
            { n: 'LMS', l: 'Replays & resources', Icon: Sparkles },
            { n: '3 tracks', l: 'Cyber, web & UX', Icon: Target },
          ].map(({ n, l, Icon }) => (
            <div key={l} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-stone-200/80">
                <Icon className="h-6 w-6 text-violet-600" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  {n}
                </p>
                <p className="text-sm text-stone-600">{l}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-sky-50/40 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Student Learning Management Portal</p>
            <h2 className="mt-2 text-xl font-bold text-stone-900 sm:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
              Lectures, replays & materials in one place
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
              Enrolled students sign in to access prerecorded lessons, past live session replays, and cohort updates.
              Accounts are issued when your seat is confirmed.
            </p>
          </div>
          <Link
            to="/student"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-700"
          >
            Open portal overview
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section id="catalog" className="scroll-mt-28 py-[var(--spacing-section)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2
                className="text-3xl font-bold text-stone-900 sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Intro course catalog
              </h2>
              <p className="mt-2 max-w-xl text-stone-600">
                All programs below are introductory. Content syncs with the server when available; your portal library
                fills in as you enroll.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All programs' },
                { id: 'cybersecurity', label: 'Cybersecurity' },
                { id: 'web-development', label: 'Web development' },
                { id: 'ux-design', label: 'UX / UI' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTrack(id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filterParam === id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {filtered.map((c, i) => {
                const meta = categoryMeta[c.category] || categoryMeta.cybersecurity;
                const CatIcon = meta.Icon;
                return (
                  <motion.article
                    layout
                    key={c.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.04 }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[var(--shadow-card)] ring-1 ring-stone-100 transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)]"
                  >
                    <div
                      className={`relative h-40 overflow-hidden bg-gradient-to-br ${meta.gradient} sm:h-44`}
                    >
                      <RemoteImage
                        src={getCourseHeroImage(c.slug)}
                        alt=""
                        className="h-full w-full object-cover opacity-90 mix-blend-overlay transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        loading="lazy"
                        fallbackSeed={`course-card-${c.slug}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                      <span
                        className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${meta.chip}`}
                      >
                        <CatIcon className="h-3.5 w-3.5" strokeWidth={2} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3
                        className="text-lg font-bold text-stone-900 line-clamp-2"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {c.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-violet-700 line-clamp-1">{c.tagline}</p>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600 line-clamp-3">
                        {c.shortDescription}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {c.durationWeeks} wks
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {c.level}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSyllabusCourse(c)}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition group-hover:bg-violet-700"
                      >
                        View syllabus
                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2} />
                      </button>
                      <Link
                        to={`/education/${c.slug}`}
                        className="mt-2 block text-center text-xs font-semibold text-violet-700 underline-offset-2 hover:underline"
                      >
                        Full program page
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="mt-12 text-center text-stone-500">No courses in this track yet.</p>
          )}
        </div>
      </section>

      <section className="border-t border-stone-200 bg-gradient-to-b from-violet-50/50 to-white py-[var(--spacing-section)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2
                className="text-3xl font-bold text-stone-900 sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Built for teams who ship
              </h2>
              <ul className="mt-6 space-y-4 text-stone-600">
                {[
                  'Realistic labs—not multiple-choice trivia',
                  'Instructor feedback on capstone checkpoints',
                  'Templates you can reuse at work the next week',
                  'Optional office hours for cohort questions',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-stone-200/80 bg-white p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3 text-stone-900">
                <Users className="h-8 w-8 text-[#0EA5E9]" strokeWidth={1.6} />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-stone-500">Admissions</p>
                  <p className="text-lg font-semibold">Tell us your goals—we’ll suggest a path.</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                Share your background, timeline, and whether you prefer cohort or hybrid pacing. We’ll respond with
                recommended prerequisites and the next intake window.
              </p>
              <Link
                to="/contact"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200/40 transition hover:bg-[#EA580C]"
              >
                Contact admissions
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseDetailBody({ slug }) {
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api
      .get(`/courses/${slug}`)
      .then((data) => {
        if (cancelled) return;
        if (!data || Array.isArray(data) || !data.slug) throw new Error('not found');
        const merged = mergeCourseDetail(data, slug);
        if (merged) setItem(merged);
        else throw new Error('not found');
      })
      .catch(() => {
        if (cancelled) return;
        const found = defaultCourses.find((c) => c.slug === slug);
        if (found) setItem(found);
        else {
          setItem(null);
          setNotFound(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white px-4 pt-28">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
          Course not found
        </h1>
        <p className="mt-2 max-w-md text-center text-stone-600">This program isn’t in our catalog (yet).</p>
        <Link
          to="/education"
          className="mt-6 rounded-xl bg-[#0EA5E9] px-6 py-3 font-semibold text-white transition hover:bg-[#0284C7]"
        >
          Back to education
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white pt-28">
        <div className="h-[min(380px,50vh)] animate-pulse bg-stone-200" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="h-10 max-w-md animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-6 h-6 max-w-xl animate-pulse rounded bg-stone-100" />
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-stone-100" />
              <div className="h-32 animate-pulse rounded-2xl bg-stone-100" />
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  const meta = categoryMeta[item.category] || categoryMeta.cybersecurity;
  const CatIcon = meta.Icon;
  const lead = item.shortDescription?.trim() || '';
  const full = item.description?.trim() || '';
  const showLong = full && (full !== lead || full.length > lead.length + 40);
  const onDownloadPdf = () => downloadSyllabusPdf(item);

  return (
    <div className="bg-white">
      <section className="relative min-h-[min(440px,75vh)] overflow-hidden pt-28">
        <div className="absolute inset-0">
          <RemoteImage
            src={getCourseHeroImage(slug)}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fallbackSeed={`course-detail-${slug}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-violet-950/88 to-stone-900/75" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[min(440px,75vh)] max-w-7xl flex-col justify-end px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20">
          <nav className="text-sm text-white/75" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li>
                <Link to="/education" className="hover:text-white">
                  Education
                </Link>
              </li>
              <li className="text-white/40">/</li>
              <li className="max-w-[min(100%,280px)] truncate font-medium text-white/95">{item.title}</li>
            </ol>
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mt-8"
          >
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${meta.chip} bg-white/95`}
            >
              <CatIcon className="h-3.5 w-3.5" strokeWidth={2} />
              {meta.label}
            </span>
            <h1
              className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.title}
            </h1>
            <p className="mt-3 text-lg font-medium text-violet-200">{item.tagline}</p>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-200">{lead || full.slice(0, 240)}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-stone-300">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{item.level}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {item.durationWeeks} weeks
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{item.format}</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={`/education/${slug}/apply`}
                className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 hover:bg-[#EA580C]"
              >
                Apply now
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <button
                type="button"
                onClick={onDownloadPdf}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15"
              >
                Download syllabus (PDF)
              </button>
              <Link
                to="/education"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15"
              >
                All courses
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
          <div className="space-y-14">
            {showLong && (
              <section>
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  About this program
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-stone-600">{full}</p>
              </section>
            )}

            {item.audience && (
              <section className="rounded-2xl border border-stone-200/80 bg-stone-50/80 p-6 sm:p-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Who it’s for</h2>
                <p className="mt-3 text-stone-700">{item.audience}</p>
              </section>
            )}

            {item.highlights?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Highlights
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {item.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-stone-200/80 bg-white px-4 py-3 text-[15px] text-stone-700 shadow-sm"
                    >
                      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" strokeWidth={2} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {item.modules?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Curriculum — topics & hands-on labs
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Every module pairs concept topics with practical labs (live or replay). Outlines match the catalog and refresh when course data syncs from the server.
                </p>
                <div className="mt-6 space-y-4">
                  {item.modules.map((m, idx) => (
                    <div
                      key={m.title}
                      className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm"
                    >
                      <div className="flex gap-4 border-b border-stone-100 bg-gradient-to-r from-violet-50/50 to-white px-5 py-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-stone-900">{m.title}</h3>
                          {m.summary && <p className="mt-1 text-sm text-stone-600">{m.summary}</p>}
                        </div>
                      </div>
                      {m.topics?.length > 0 && (
                        <div className="border-b border-stone-100 bg-white px-5 py-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Topics</p>
                          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                            {m.topics.map((t) => (
                              <li key={t} className="flex items-start gap-2 text-sm text-stone-600">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {m.labs?.length > 0 && (
                        <div className="border-t border-stone-100 bg-emerald-50/50 px-5 py-4">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                            <FlaskConical className="h-4 w-4" strokeWidth={2} />
                            Hands-on labs (practical)
                          </p>
                          <ul className="mt-3 space-y-3">
                            {m.labs.map((lab, li) => {
                              const title = typeof lab === 'string' ? lab : lab?.title || 'Lab';
                              const focus = typeof lab === 'string' ? '' : lab?.focus || '';
                              return (
                                <li
                                  key={`${title}-${li}`}
                                  className="rounded-xl border border-emerald-200/80 bg-white px-4 py-3 text-sm text-stone-700"
                                >
                                  <span className="font-semibold text-emerald-900">{title}</span>
                                  {focus ? <p className="mt-1.5 text-stone-600">{focus}</p> : null}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                      {m.skillsGained?.length > 0 && (
                        <div className="border-t border-violet-100 bg-violet-50/40 px-5 py-4">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-900">
                            <GraduationCap className="h-4 w-4" strokeWidth={2} />
                            Skills gained
                          </p>
                          <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                            {m.skillsGained.map((s) => (
                              <li key={s} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {m.assignment && (
                        <div className="border-t border-amber-100 bg-amber-50/50 px-5 py-4">
                          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                            <ClipboardList className="h-4 w-4" strokeWidth={2} />
                            Weekly assignment
                          </p>
                          <p className="mt-2 text-sm text-stone-700">{m.assignment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.resourceGuide?.length > 0 && (
              <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  <Library className="h-6 w-6 text-sky-600" strokeWidth={1.8} />
                  External resources & references
                </h2>
                <p className="mt-2 text-sm text-stone-600">
                  Globally recognized references for instructors and learners—explore at your own pace; Anmel Inc does not endorse any single vendor or product.
                </p>
                <div className="mt-6 space-y-6">
                  {item.resourceGuide.map((block) => (
                    <div key={block.heading}>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-sky-800">{block.heading}</h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                        {(block.items || []).map((line) => (
                          <li key={line} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.prerequisites?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Prerequisites
                </h2>
                <ul className="mt-4 space-y-2 text-stone-600">
                  {item.prerequisites.map((p) => (
                    <li key={p} className="flex gap-2">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {item.outcomes && (
              <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 sm:p-8">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">Outcomes</h2>
                <p className="mt-3 text-lg leading-relaxed text-stone-800">{item.outcomes}</p>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-32 space-y-6">
            <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white to-violet-50/40 p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Program facts</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-stone-100 pb-3">
                  <dt className="text-stone-500">Level</dt>
                  <dd className="font-semibold text-stone-900">{item.level}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-100 pb-3">
                  <dt className="text-stone-500">Duration</dt>
                  <dd className="font-semibold text-stone-900">{item.durationWeeks} weeks</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-stone-100 pb-3">
                  <dt className="text-stone-500">Format</dt>
                  <dd className="text-right font-semibold text-stone-900">{item.format}</dd>
                </div>
                {item.certification && (
                  <div className="pt-1">
                    <dt className="text-stone-500">Credential</dt>
                    <dd className="mt-1 font-medium text-stone-800">{item.certification}</dd>
                  </div>
                )}
              </dl>
              <Link
                to={`/education/${slug}/apply`}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200/40 hover:bg-[#EA580C]"
              >
                Apply now
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <button
                type="button"
                onClick={onDownloadPdf}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3.5 text-sm font-semibold text-stone-800 transition hover:border-violet-300 hover:bg-violet-50/50"
              >
                Download syllabus (PDF)
              </button>
            </div>
            <Link
              to="/education"
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:border-violet-200 hover:bg-violet-50/40"
            >
              <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={2} />
              Back to catalog
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  return <CourseDetailBody key={slug} slug={slug} />;
}
