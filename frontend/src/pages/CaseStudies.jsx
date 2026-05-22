import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Briefcase, Building2, Clock, Target,
  ShieldCheck, Wrench, BarChart3, CheckCircle2,
} from 'lucide-react';
import { publicCaseStudiesApi } from '../lib/api';
import { getCaseStudyCardImage } from '../lib/siteImages';
import { deferIdle } from '../lib/deferIdle';
import { subscribeContentStream } from '../lib/contentStream';
import RemoteImage from '../components/ui/RemoteImage';

const sectorExamples = [
  'Financial services',
  'Healthcare',
  'SaaS & technology',
  'Education',
  'Government contractors',
  'Retail & e-commerce',
];

function normalizeCaseStudy(c) {
  if (!c) return c;
  return {
    ...c,
    image: getCaseStudyCardImage(c),
    metrics: Array.isArray(c.metrics) ? c.metrics : [],
  };
}

function accentColor(accent) {
  return accent || '#0F766E';
}

function CaseStudyCard({ study, index, featured = false }) {
  const accent = accentColor(study.accent);

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="group"
      >
        <Link
          to={`/case-studies/${study.slug}`}
          className="relative block overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_8px_40px_-16px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_56px_-20px_rgba(15,23,42,0.16)]"
        >
          <div className="grid lg:grid-cols-2">
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden bg-stone-100">
              {study.image ? (
                <RemoteImage
                  src={study.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading="eager"
                  fallbackSeed={`cs-f-${study.slug}`}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-100" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-900/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-stone-950/20" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-800">
                  Featured
                </span>
                {study.category && (
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: `${accent}e6` }}
                  >
                    {study.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
              {study.clientSector && (
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {study.clientSector}
                </p>
              )}
              <h2
                className="mt-3 text-2xl sm:text-3xl font-bold text-stone-900 leading-snug group-hover:text-stone-700 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {study.title}
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed line-clamp-4">
                {study.excerpt || study.resultSnippet || study.challenge}
              </p>
              {study.metrics?.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {study.metrics.slice(0, 3).map((m, j) => (
                    <div key={j} className="rounded-xl bg-stone-50 px-2 py-3 text-center ring-1 ring-stone-100">
                      <p className="text-lg font-bold tabular-nums leading-none" style={{ color: accent }}>{m.value}</p>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-stone-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:gap-3"
                  style={{ backgroundColor: accent }}
                >
                  Read full story
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
                {study.duration && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                    <Clock className="h-4 w-4" />
                    {study.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group h-full"
    >
      <Link
        to={`/case-studies/${study.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition-all duration-400 hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          {study.image ? (
            <RemoteImage
              src={study.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              fallbackSeed={`cs-${study.slug}`}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-stone-200 to-stone-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 right-4 flex flex-wrap items-start justify-between gap-2">
            {study.category && (
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: `${accent}e6` }}
              >
                {study.category}
              </span>
            )}
            {study.clientSector && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                {study.clientSector}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3
            className="text-xl font-bold text-stone-900 leading-snug group-hover:text-stone-700 transition-colors line-clamp-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {study.title}
          </h3>
          {(study.excerpt || study.resultSnippet) && (
            <p className="mt-3 text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1">
              {study.excerpt || study.resultSnippet}
            </p>
          )}
          {study.metrics?.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-stone-100 pt-5">
              {study.metrics.slice(0, 3).map((m, j) => (
                <div key={j} className="text-center">
                  <p className="text-base font-bold tabular-nums" style={{ color: accent }}>{m.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-stone-500 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
            {study.duration ? (
              <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                <Clock className="h-3.5 w-3.5" />
                {study.duration}
              </span>
            ) : <span />}
            <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: accent }}>
              View case
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function CaseStudiesList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const loadCases = useCallback(() => {
    publicCaseStudiesApi
      .list(category)
      .then((d) => { setCases(Array.isArray(d) ? d.map(normalizeCaseStudy) : []); setLoading(false); })
      .catch(() => { setCases([]); setLoading(false); });
  }, [category]);

  useEffect(() => {
    let cancelled = false;
    if (category) {
      loadCases();
      return () => { cancelled = true; };
    }
    const cancel = deferIdle(() => { if (!cancelled) loadCases(); }, 400);
    return () => { cancelled = true; cancel(); };
  }, [loadCases, category]);

  useEffect(() => {
    const cleanup = publicCaseStudiesApi.subscribe(
      (rows) => {
        setCases(Array.isArray(rows) ? rows.map(normalizeCaseStudy) : []);
        setLoading(false);
      },
      category,
    );
    return cleanup;
  }, [category]);

  const categories = [...new Set(cases.map((c) => c.category).filter(Boolean))];
  const featured = cases[0];
  const rest = featured ? cases.slice(1) : cases;

  if (loading) {
    return (
      <div className="pt-28 min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-24 animate-pulse space-y-8">
          <div className="h-12 w-72 bg-stone-200 rounded-lg" />
          <div className="h-5 w-full max-w-xl bg-stone-200 rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-stone-200 overflow-hidden">
                <div className="aspect-[16/10] bg-stone-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-full bg-stone-200 rounded" />
                  <div className="h-16 bg-stone-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 bg-gradient-to-b from-stone-50 via-white to-white min-h-screen">
      {/* Hero */}
      <header className="relative border-b border-stone-200/80 overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-teal-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500">
              <Briefcase className="h-4 w-4 text-teal-700" strokeWidth={2} />
              Anmel Inc. · Client work
            </p>
            <h1
              className="mt-4 text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-stone-900 tracking-tight leading-[1.08]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Case Studies
            </h1>
            <p className="mt-5 max-w-2xl text-lg sm:text-xl text-stone-600 leading-relaxed">
              Documented engagements from security assessments, compliance programmes, and software delivery — with the context, approach, and measurable outcomes.
            </p>
            <p className="mt-3 max-w-xl text-sm text-stone-500 leading-relaxed">
              Client names are anonymised where required. Each study follows the same structure so you can compare scope and results across sectors.
            </p>
          </motion.div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        {categories.length > 0 && (
          <nav className="sticky top-[4.5rem] z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 mr-2 hidden sm:inline">Sector / type</span>
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${!category ? 'bg-stone-900 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              All work
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                  category === cat
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}

        {!loading && cases.length === 0 && (
          <div className="py-24 text-center">
            <Briefcase className="w-12 h-12 text-stone-300 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-stone-800">No case studies published yet</h2>
            <p className="mt-2 text-stone-500 max-w-md mx-auto">New client work will appear here once published from the admin dashboard.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_280px] gap-12 lg:gap-16 py-12 sm:py-16">
          <div>
            {featured && (
              <section className="mb-14">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Highlighted engagement</p>
                <CaseStudyCard study={featured} featured />
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-8">
                  {category ? `${category} projects` : 'More client work'}
                </h2>
                <motion.div layout className="grid gap-8 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {rest.map((c, i) => (
                      <CaseStudyCard key={c.slug} study={c} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          {cases.length > 0 && (
            <aside className="space-y-8 lg:pt-2">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">Sectors we serve</h3>
                <ul className="space-y-2">
                  {sectorExamples.map((s) => (
                    <li key={s} className="text-sm text-stone-600 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" strokeWidth={2} />
                      {s}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white"
              >
                <ShieldCheck className="h-8 w-8 text-teal-400 mb-4" strokeWidth={1.75} />
                <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Planning a similar project?</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Share your environment, timeline, and constraints. We will suggest a scope that fits — whether that is a point-in-time assessment or ongoing support.
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-300 hover:text-teal-200 transition-colors"
                >
                  Discuss your context
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/services" className="mt-3 block text-sm text-white/50 hover:text-white/80 transition-colors">
                  Browse services →
                </Link>
              </motion.div>
            </aside>
          )}
        </div>

        {/* Bottom CTA */}
        <section className="border-t border-stone-200 py-14 sm:py-16 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[1.75rem] border border-stone-200 bg-gradient-to-br from-teal-50/80 via-white to-violet-50/60 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                Ready to build your own success story?
              </h2>
              <p className="mt-3 text-stone-600 leading-relaxed">
                We work with in-house teams and leadership on security, compliance, and delivery challenges. Tell us what you are trying to solve — we will respond with a practical next step.
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex flex-wrap gap-3 shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-all hover:gap-3"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/case-studies"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 hover:border-stone-400 transition-colors"
              >
                Review all studies
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function DetailSection({ icon: Icon, title, children, accent }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className="relative"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 pt-1" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
      </div>
      <div className="pl-0 sm:pl-14 text-stone-600 leading-relaxed whitespace-pre-line">{children}</div>
    </motion.section>
  );
}

export function CaseStudyDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const loadDetail = useCallback(() => {
    if (!slug) return;
    setNotFound(false);
    publicCaseStudiesApi
      .getBySlug(slug)
      .then((data) => setItem(normalizeCaseStudy(data)))
      .catch(() => { setItem(null); setNotFound(true); });
  }, [slug]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (!item?.category) return;
    publicCaseStudiesApi
      .list(item.category)
      .then((data) => {
        setRelated(
          (Array.isArray(data) ? data : [])
            .map(normalizeCaseStudy)
            .filter((c) => c.slug !== slug)
            .slice(0, 3),
        );
      })
      .catch(() => setRelated([]));
  }, [item?.category, slug]);

  useEffect(() => {
    const cleanup = publicCaseStudiesApi.subscribe((rows) => {
      const match = (Array.isArray(rows) ? rows : []).find((c) => c.slug === slug);
      if (match) {
        setItem(normalizeCaseStudy(match));
        setNotFound(false);
      }
    });
    const cleanupMeta = subscribeContentStream((resource) => {
      if (resource === 'case-studies') loadDetail();
    });
    return () => {
      cleanup();
      cleanupMeta();
    };
  }, [slug, loadDetail]);

  if (notFound) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>Case study not found</h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">This project may have been removed or the link is incorrect.</p>
        <Link to="/case-studies" className="mt-8 text-sm font-semibold text-stone-900 border-b border-stone-900 pb-0.5 hover:text-stone-600 transition">
          Back to case studies
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-28 min-h-screen bg-white">
        <div className="mx-auto max-w-3xl px-4 py-24 animate-pulse space-y-4">
          <div className="h-4 w-32 bg-stone-100 rounded" />
          <div className="h-12 w-full bg-stone-100 rounded" />
          <div className="h-64 bg-stone-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const accent = accentColor(item.accent);

  return (
    <div className="pt-28 bg-white min-h-screen">
      {/* Hero */}
      <header className="border-b border-stone-200 bg-gradient-to-b from-stone-50/90 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link to="/case-studies" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
            ← All case studies
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {item.category && (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: accent }}
              >
                {item.category}
              </span>
            )}
            {item.clientSector && (
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                {item.clientSector}
              </span>
            )}
            {item.duration && (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-500">
                <Clock className="h-4 w-4" />
                {item.duration}
              </span>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-stone-900 leading-[1.12] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.title}
          </motion.h1>

          {item.client && (
            <p className="mt-4 text-stone-600">
              <span className="font-semibold text-stone-800">Client:</span> {item.client}
            </p>
          )}

          {(item.excerpt || item.resultSnippet) && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-5 text-lg text-stone-600 leading-relaxed max-w-3xl"
            >
              {item.excerpt || item.resultSnippet}
            </motion.p>
          )}

          <p className="mt-4 text-sm text-stone-400 max-w-2xl">
            Details may be anonymised to protect client confidentiality. Outcomes reflect the agreed scope at the time of engagement.
          </p>
        </div>
      </header>

      {item.image && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
        >
          <div className="aspect-[21/9] overflow-hidden rounded-2xl bg-stone-100 shadow-lg ring-1 ring-stone-900/5">
            <RemoteImage
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
              fallbackSeed={`csd-${slug}`}
            />
          </div>
        </motion.div>
      )}

      {/* Metrics strip */}
      {item.metrics?.length > 0 && (
        <section className="border-y border-stone-200 bg-stone-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6 text-center">Key outcomes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {item.metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bg-white border border-stone-200 px-4 py-6 text-center shadow-sm"
                >
                  <p className="text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: accent, fontFamily: 'var(--font-display)' }}>
                    {m.value}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-stone-500">{m.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Body sections */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-14 sm:space-y-16">
        {item.challenge && (
          <DetailSection icon={Target} title="The challenge" accent={accent}>
            {item.challenge}
          </DetailSection>
        )}
        {item.solution && (
          <DetailSection icon={Wrench} title="Our approach" accent={accent}>
            {item.solution}
          </DetailSection>
        )}
        {item.results && (
          <DetailSection icon={BarChart3} title="Results" accent={accent}>
            {item.results}
          </DetailSection>
        )}

        {item.beforeAfter?.before && item.beforeAfter?.after && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-stone-200 overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
              <div className="p-6 sm:p-8 bg-red-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">Before</p>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line">{item.beforeAfter.before}</p>
              </div>
              <div className="p-6 sm:p-8 bg-emerald-50/50">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">After</p>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line">{item.beforeAfter.after}</p>
              </div>
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <section className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-900 to-stone-800 p-8 sm:p-10 text-white">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Facing a similar challenge?
          </h2>
          <p className="mt-3 text-white/70 leading-relaxed text-sm sm:text-base">
            We can walk through how this engagement was scoped, what changed in the first 30 days, and what a comparable programme would look like for your organisation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 hover:bg-stone-100 transition-colors"
            >
              Talk to our team
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              View services
            </Link>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="pt-8 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Related work in {item.category}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r, i) => (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/case-studies/${r.slug}`}
                    className="group block rounded-xl border border-stone-200 p-4 hover:border-stone-300 hover:shadow-md transition-all h-full"
                  >
                    <p className="text-sm font-bold text-stone-900 leading-snug group-hover:text-stone-600 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                      {r.title}
                    </p>
                    {r.clientSector && (
                      <p className="mt-2 text-xs text-stone-500">{r.clientSector}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <Link to="/case-studies" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">
          ← Back to all case studies
        </Link>
      </div>
    </div>
  );
}
