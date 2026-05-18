import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BookOpen, ClipboardList, Download, FlaskConical, GraduationCap, Library, Loader2, X } from 'lucide-react';
import api from '../../lib/api';
import { mergeCourseDetail } from '../../lib/mergeCourseDetail';
import { downloadSyllabusPdf } from '../../lib/syllabusPdf';

const categoryMeta = {
  cybersecurity: { label: 'Cybersecurity' },
  'web-development': { label: 'Web development' },
  'ux-design': { label: 'UX / UI design' },
};

export default function CourseSyllabusModal({ course, open, onClose }) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !course?.slug) return undefined;
    let cancelled = false;
    api
      .get(`/courses/${course.slug}`)
      .then((data) => {
        if (cancelled || !data || Array.isArray(data) || !data.slug) return;
        setApiData(data);
      })
      .catch(() => {
        if (!cancelled) setApiData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, course?.slug]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const item = useMemo(() => {
    if (!course?.slug) return null;
    const merged = mergeCourseDetail(apiData || {}, course.slug);
    return merged ? { ...course, ...merged } : { ...course };
  }, [course, apiData]);

  if (!course) return null;

  const onDownloadPdf = () => {
    if (item) downloadSyllabusPdf(item);
  };

  const meta = categoryMeta[item?.category] || categoryMeta.cybersecurity;

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="syllabus-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px]"
            aria-label="Close syllabus"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 bg-gradient-to-r from-violet-50/90 to-sky-50/40 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">{meta.label}</p>
                <h2 id="syllabus-modal-title" className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
                  {item?.title || course.title}
                </h2>
                {loading && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Syncing latest outline…
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-stone-500 transition hover:bg-white/80 hover:text-stone-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <p className="text-sm font-medium text-violet-800">{item?.tagline || course.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
                <span className="rounded-full bg-stone-100 px-2.5 py-1">{item?.durationWeeks ?? course.durationWeeks} weeks</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-1">{item?.level || course.level}</span>
                {item?.format && <span className="rounded-full bg-stone-100 px-2.5 py-1">{item.format}</span>}
              </div>

              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-500">
                  <BookOpen className="h-4 w-4 text-violet-600" strokeWidth={2} />
                  Hands-on syllabus (topics + labs)
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">
                  Each module lists concept topics and practical labs you complete during live sessions or replays—updated from this catalog in real time when the server syncs.
                </p>
                {item?.modules?.length > 0 ? (
                  <ol className="mt-4 space-y-4">
                    {item.modules.map((m, idx) => (
                      <li
                        key={`${m.title}-${idx}`}
                        className="overflow-hidden rounded-2xl border border-stone-200/90 bg-stone-50/50"
                      >
                        <div className="flex gap-3 border-b border-stone-100 bg-white px-4 py-3 sm:px-5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-stone-900">{m.title}</p>
                            {m.summary && <p className="mt-1 text-sm text-stone-600">{m.summary}</p>}
                          </div>
                        </div>
                        {m.topics?.length > 0 && (
                          <div className="border-t border-stone-100 bg-white px-4 py-3 sm:px-5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Topics</p>
                            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                              {m.topics.map((t) => (
                                <li key={t} className="flex items-start gap-2 text-sm text-stone-600">
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.labs?.length > 0 && (
                          <div className="border-t border-emerald-100 bg-emerald-50/40 px-4 py-3 sm:px-5">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                              <FlaskConical className="h-3.5 w-3.5" strokeWidth={2} />
                              Hands-on labs
                            </p>
                            <ul className="mt-3 space-y-3">
                              {m.labs.map((lab, li) => {
                                const title = typeof lab === 'string' ? lab : lab?.title || 'Lab';
                                const focus = typeof lab === 'string' ? '' : lab?.focus || '';
                                return (
                                  <li
                                    key={`${title}-${li}`}
                                    className="rounded-xl border border-emerald-200/80 bg-white px-3 py-2.5 text-sm text-stone-700 shadow-sm"
                                  >
                                    <span className="font-semibold text-emerald-900">{title}</span>
                                    {focus ? <span className="mt-1 block text-stone-600">{focus}</span> : null}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        {m.skillsGained?.length > 0 && (
                          <div className="border-t border-violet-100 bg-violet-50/50 px-4 py-3 sm:px-5">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-900">
                              <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                              Skills gained
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-stone-700">
                              {m.skillsGained.map((s) => (
                                <li key={s} className="flex items-start gap-2">
                                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {m.assignment && (
                          <div className="border-t border-amber-100 bg-amber-50/60 px-4 py-3 sm:px-5">
                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900">
                              <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                              Weekly assignment
                            </p>
                            <p className="mt-2 text-sm text-stone-700">{m.assignment}</p>
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-3 text-sm text-stone-600">
                    Module details are being finalized. Open the full program page for the latest updates.
                  </p>
                )}
              </div>

              {item?.resourceGuide?.length > 0 && (
                <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 px-4 py-4 sm:px-5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
                    <Library className="h-4 w-4" strokeWidth={2} />
                    External resources & references
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    For instructors and students; explore independently—no single vendor is endorsed.
                  </p>
                  <div className="mt-4 space-y-4">
                    {item.resourceGuide.map((block) => (
                      <div key={block.heading}>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-800">{block.heading}</p>
                        <ul className="mt-1.5 space-y-1 text-sm text-stone-700">
                          {(block.items || []).map((line) => (
                            <li key={line} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-400" />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item?.prerequisites?.length > 0 && (
                <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900/80">Prerequisites</p>
                  <ul className="mt-2 space-y-1 text-sm text-stone-700">
                    {item.prerequisites.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 border-t border-stone-200 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Apply for this program</h3>
                <p className="mt-1 text-sm text-stone-600">
                  Continue to the full application form for <strong className="text-stone-800">{item?.title || course.title}</strong>.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to={`/education/${course.slug}/apply`}
                    onClick={onClose}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/30 transition hover:bg-[#0284C7]"
                  >
                    Apply now
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3.5 text-sm font-semibold text-stone-800 transition hover:border-violet-300 hover:bg-violet-50/50"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-stone-100 pt-5">
                <Link
                  to={`/education/${course.slug}`}
                  onClick={onClose}
                  className="text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
                >
                  Open full program page
                </Link>
                <Link to="/contact" onClick={onClose} className="text-sm font-semibold text-stone-600 underline-offset-2 hover:underline">
                  Contact admissions
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
