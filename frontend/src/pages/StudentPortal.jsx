import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, GraduationCap, LayoutDashboard, Library, Play,
  Radio, Shield, Sparkles, Video, X, Code2, Palette, ExternalLink, Lock,
} from 'lucide-react';
import { lmsContent, studentRegistrations } from '../lib/api';
import api, { publicApi } from '../lib/api';

const PORTAL_PREVIEW_KEY = 'anmel_portal_preview';

function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function StudentPortal() {
  const [preview, setPreview] = useState(() => {
    try {
      return localStorage.getItem(PORTAL_PREVIEW_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [tab, setTab] = useState('dashboard');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [liveItems, setLiveItems] = useState([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [courses, setCourses] = useState([]);
  const [registration, setRegistration] = useState({ fullName: '', email: '', phone: '', courseSlug: 'general' });
  const [registrationState, setRegistrationState] = useState('');
  const sourceItems = liveItems;

  const enablePreview = () => {
    try {
      localStorage.setItem(PORTAL_PREVIEW_KEY, '1');
    } catch {
      /* ignore */
    }
    setPreview(true);
  };

  const exitPreview = () => {
    try {
      localStorage.removeItem(PORTAL_PREVIEW_KEY);
    } catch {
      /* ignore */
    }
    setPreview(false);
  };

  const filteredRecordings = useMemo(() => {
    return sourceItems.filter((r) => {
      if (courseFilter !== 'all' && r.courseSlug !== courseFilter) return false;
      if (typeFilter === 'prerecorded' && r.type !== 'prerecorded' && r.contentType !== 'video') return false;
      if (typeFilter === 'live-replay' && r.type !== 'live-replay') return false;
      return true;
    });
  }, [courseFilter, typeFilter, sourceItems]);

  const courseTitleBySlug = useMemo(() => {
    const map = {};
    courses.forEach((course) => {
      if (course?.slug) map[course.slug] = course.title || course.slug;
    });
    return map;
  }, [courses]);

  useEffect(() => {
    publicApi.courses().then((d) => setCourses(Array.isArray(d) ? d : [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!preview) return undefined;

    let mounted = true;
    const load = async () => {
      setIsLoadingLive(true);
      try {
        const items = await lmsContent.list(false);
        if (mounted) {
          setLiveItems(items);
        }
      } catch {
        if (mounted) setLiveItems([]);
      } finally {
        if (mounted) setIsLoadingLive(false);
      }
    };

    load();
    const unsubscribe = lmsContent.subscribe(load);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [preview]);

  const onPlay = (title) => {
    setToast(`Playback is enabled for enrolled students. “${title}” will stream from your secure library after login.`);
    window.setTimeout(() => setToast(null), 5200);
  };

  const renderAction = (item) => {
    if (item.contentType === 'document') {
      return item.mediaUrl ? (
        <a
          href={item.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
        >
          Open doc
        </a>
      ) : (
        <span className="text-xs text-stone-400">No document link</span>
      );
    }
    if (item.contentType === 'lesson') {
      return item.mediaUrl ? (
        <a
          href={item.mediaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
        >
          Open lesson
        </a>
      ) : (
        <span className="text-xs text-stone-400">No lesson link</span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onPlay(item.title)}
        className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
      >
        <Play className="h-3.5 w-3.5" fill="currentColor" />
        Play
      </button>
    );
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    setRegistrationState('sending');
    try {
      await studentRegistrations.register(registration);
      setRegistrationState('success');
      setRegistration({ fullName: '', email: '', phone: '', courseSlug: 'general' });
    } catch (err) {
      setRegistrationState(err.message || 'error');
    }
  };

  if (!preview) {
    return (
      <div className="min-h-screen bg-stone-950 pt-28 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              <GraduationCap className="h-4 w-4" strokeWidth={2} />
              Student LMS
            </div>
            <h1
              className="mt-6 text-4xl font-bold leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Learning Management Portal
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-stone-300">
              Enrolled Anmel Inc students access{' '}
              <strong className="text-white">live session replays</strong>,{' '}
              <strong className="text-white">prerecorded micro-lessons</strong>, module materials, and cohort
              announcements—in one place.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { Icon: Video, t: 'Past & on-demand lectures', d: 'Rewatch cohort sessions with chapter markers.' },
              { Icon: Library, t: 'Organized by course & module', d: 'Filter by your intro track (cyber or web).' },
              { Icon: Radio, t: 'Live replays archived fast', d: 'Session recordings typically within 24–48h.' },
              { Icon: Lock, t: 'Student-only access', d: 'Credentials issued after enrollment is confirmed.' },
            ].map(({ Icon, t, d }) => (
              <div
                key={t}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:border-violet-400/30"
              >
                <Icon className="h-8 w-8 text-violet-300" strokeWidth={1.6} />
                <p className="mt-3 font-semibold text-white">{t}</p>
                <p className="mt-1 text-sm text-stone-400">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/80 to-stone-900/90 p-8 shadow-2xl shadow-violet-950/50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-violet-200">Not enrolled yet?</p>
                <p className="mt-2 text-stone-300">
                  Browse our <Link to="/education" className="text-sky-400 underline-offset-2 hover:underline">introductory courses</Link> and
                  contact admissions. We’ll provision your portal account with your cohort.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#EA580C]"
              >
                Request access
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            <div className="mt-8 border-t border-white/10 pt-8">
              <p className="text-sm text-stone-400">
                Want to see how the library is organized?{' '}
                <button
                  type="button"
                  onClick={enablePreview}
                  className="font-semibold text-sky-400 underline-offset-2 hover:underline"
                >
                  Open interactive preview (demo)
                </button>
              </p>
              <form onSubmit={submitRegistration} className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Student registration request</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    type="text"
                    placeholder="Full name"
                    value={registration.fullName}
                    onChange={(e) => setRegistration((s) => ({ ...s, fullName: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={registration.email}
                    onChange={(e) => setRegistration((s) => ({ ...s, email: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={registration.phone}
                    onChange={(e) => setRegistration((s) => ({ ...s, phone: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                  />
                  <select
                    value={registration.courseSlug}
                    onChange={(e) => setRegistration((s) => ({ ...s, courseSlug: e.target.value }))}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
                  >
                    <option value="general">General intake</option>
                    {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#00D4FF] px-4 py-2 text-sm font-semibold text-[#0B1C2D]"
                  disabled={registrationState === 'sending'}
                >
                  {registrationState === 'sending' ? 'Submitting...' : 'Submit registration'}
                </button>
                {registrationState === 'success' && <p className="text-xs text-emerald-300">Registration submitted. Admin will process your intake.</p>}
                {registrationState && registrationState !== 'success' && registrationState !== 'sending' && (
                  <p className="text-xs text-red-300">{registrationState}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pt-24 lg:pt-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 lg:flex-row lg:px-8">
        <aside className="shrink-0 lg:w-64">
          <div className="sticky top-28 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md">
                <GraduationCap className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Anmel Inc</p>
                <p className="text-sm font-bold text-stone-900">Student Portal</p>
              </div>
            </div>
            <nav className="mt-4 space-y-1" aria-label="Portal navigation">
              <button
                type="button"
                onClick={() => setTab('dashboard')}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  tab === 'dashboard'
                    ? 'bg-violet-50 text-violet-900 ring-1 ring-violet-200'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={2} />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('library');
                  setTypeFilter('all');
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  tab === 'library' && typeFilter === 'all'
                    ? 'bg-violet-50 text-violet-900 ring-1 ring-violet-200'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Library className="h-4 w-4 shrink-0" strokeWidth={2} />
                Video library
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('library');
                  setTypeFilter('live-replay');
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  tab === 'library' && typeFilter === 'live-replay'
                    ? 'bg-violet-50 text-violet-900 ring-1 ring-violet-200'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Radio className="h-4 w-4 shrink-0" strokeWidth={2} />
                Live session replays
              </button>
            </nav>
            <p className="mt-4 border-t border-stone-100 pt-4 text-xs leading-relaxed text-stone-500">
              Preview mode: playback buttons show how enrolled students launch streams (single sign-on not wired in
              this demo).
            </p>
            <button
              type="button"
              onClick={exitPreview}
              className="mt-3 w-full rounded-lg border border-stone-200 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Exit preview
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                  Welcome back
                </h1>
                <p className="mt-1 text-stone-600">Your introductory programs and recordings in one workspace.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { n: courses.length, l: 'Intro programs', Icon: BookOpen },
                  { n: sourceItems.length, l: 'Total recordings', Icon: Video },
                  { n: sourceItems.filter((r) => r.type === 'live-replay').length, l: 'Live replays', Icon: Calendar },
                ].map(({ n, l, Icon }) => (
                  <div key={l} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <Icon className="h-6 w-6 text-violet-600" strokeWidth={1.8} />
                    <p className="mt-3 text-3xl font-bold text-stone-900">{n}</p>
                    <p className="text-sm text-stone-500">{l}</p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900">Your courses</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {courses.map((c) => {
                    const cyber = c.category === 'cybersecurity';
                    const ux = c.category === 'ux-design';
                    const trackClass = cyber
                      ? 'bg-violet-100 text-violet-800'
                      : ux
                        ? 'bg-fuchsia-100 text-fuchsia-900'
                        : 'bg-sky-100 text-sky-800';
                    const trackLabel = cyber ? 'Cyber' : ux ? 'UX' : 'Web';
                    return (
                      <Link
                        key={c.slug}
                        to={`/education/${c.slug}`}
                        className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                      >
                        <span
                          className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${trackClass}`}
                        >
                          {cyber ? (
                            <Shield className="h-3 w-3" />
                          ) : ux ? (
                            <Palette className="h-3 w-3" />
                          ) : (
                            <Code2 className="h-3 w-3" />
                          )}
                          {trackLabel}
                        </span>
                        <p className="mt-3 font-semibold text-stone-900 group-hover:text-violet-800">{c.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-stone-600">{c.tagline}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700">
                          Open syllabus
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'library' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                    {typeFilter === 'live-replay'
                      ? 'Live session replays'
                      : typeFilter === 'prerecorded'
                        ? 'Prerecorded lessons'
                        : 'Video library'}
                  </h1>
                  <p className="mt-1 text-stone-600">
                    Prerecorded lessons, published documents, and archived cohort sessions. Filters apply below.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800"
                  >
                    <option value="all">All courses</option>
                    {courses.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTab('library');
                      setTypeFilter(e.target.value);
                    }}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800"
                  >
                    <option value="all">All types</option>
                    <option value="prerecorded">Prerecorded only</option>
                    <option value="live-replay">Live replays only</option>
                  </select>
                </div>
              </div>
              {isLoadingLive && (
                <p className="text-xs text-stone-500">Refreshing LMS content...</p>
              )}

              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-stone-100 bg-stone-50 text-xs font-bold uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="hidden px-4 py-3 sm:table-cell">Course</th>
                      <th className="hidden px-4 py-3 md:table-cell">Module</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                      <th className="px-4 py-3">Length</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRecordings.map((r) => (
                      <tr key={r._id || r.id} className="hover:bg-violet-50/40">
                        <td className="px-4 py-3 font-medium text-stone-900">{r.title}</td>
                        <td className="hidden px-4 py-3 text-stone-600 sm:table-cell">
                          {courseTitleBySlug[r.courseSlug] || r.courseSlug}
                        </td>
                        <td className="hidden px-4 py-3 text-stone-500 md:table-cell">{r.moduleLabel || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                              r.type === 'live-replay'
                                ? 'bg-amber-100 text-amber-900'
                                : r.contentType === 'document'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : r.contentType === 'lesson'
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : 'bg-sky-100 text-sky-900'
                            }`}
                          >
                            {r.type === 'live-replay' ? 'Live replay' : r.contentType || 'Prerecorded'}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-stone-500 lg:table-cell">{r.recordedAt || '-'}</td>
                        <td className="px-4 py-3 text-stone-600">{r.durationMin ? formatDuration(r.durationMin) : '-'}</td>
                        <td className="px-4 py-3">
                          {renderAction(r)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRecordings.length === 0 && (
                  <p className="px-4 py-10 text-center text-stone-500">No recordings match these filters.</p>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-4 right-4 z-[80] mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Video className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="flex-1 text-sm text-stone-700">{toast}</p>
              <button type="button" onClick={() => setToast(null)} className="text-stone-400 hover:text-stone-700" aria-label="Dismiss">
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
