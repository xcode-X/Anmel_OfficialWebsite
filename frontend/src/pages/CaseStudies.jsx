import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock, Sparkles, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { deferIdle } from '../lib/deferIdle';
import { subscribeContentStream } from '../lib/contentStream';
import RemoteImage from '../components/ui/RemoteImage';


export function CaseStudiesList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const url = category ? `/case-studies?category=${encodeURIComponent(category)}` : '/case-studies';
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      api.get(url).then((d) => { if (!cancelled) { setCases(Array.isArray(d) ? d : []); setLoading(false); } }).catch(() => { if (!cancelled) { setCases([]); setLoading(false); } });
    };
    if (category) { run(); return () => { cancelled = true; }; }
    const cancel = deferIdle(run, 400);
    return () => { cancelled = true; cancel(); };
  }, [category]);

  useEffect(() => {
    return subscribeContentStream((resource) => {
      if (resource !== 'case-studies') return;
      const url = category ? `/case-studies?category=${encodeURIComponent(category)}` : '/case-studies';
      api.get(url).then((d) => setCases(Array.isArray(d) ? d : [])).catch(() => {});
    });
  }, [category]);

  const list = cases;
  const categories = [...new Set(list.map((c) => c.category).filter(Boolean))];

  return (
    <div className="pt-28 bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50 pb-[var(--spacing-section)] pt-8">
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-[min(1200px,100%)] -translate-x-1/2 rounded-[50%_50%_0_0_/100%_100%_0_0] bg-gradient-to-t from-sky-100/40 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-violet-700 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} />
            Case studies
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.25rem]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Proof of Our Work
          </motion.h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
            Measurable outcomes from real engagements—how we scoped the problem, shipped the fix, and left teams with
            stronger controls and documentation.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone-500">
            Filter by focus area to find examples closest to your sector. Each story includes challenge, approach, and
            results.
          </p>
        </div>
      </section>

      <section className="py-[var(--spacing-block)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="mr-2 hidden text-sm font-medium text-stone-500 sm:inline">Filter:</span>
            <button type="button" onClick={() => setCategory('')} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${!category ? 'bg-stone-900 text-white shadow-md shadow-stone-900/15 ring-2 ring-stone-900' : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200/80 hover:bg-stone-200 hover:text-stone-900'}`}>All</button>
            {categories.map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${category === cat ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/20 ring-2 ring-[#F97316]' : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200/80 hover:bg-stone-200 hover:text-stone-900'}`}>{cat}</button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-24">
              <svg className="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
          )}

          {!loading && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
                <Briefcase className="w-7 h-7 text-violet-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-stone-800">No case studies yet</h3>
              <p className="mt-2 text-stone-500 max-w-sm">Case studies published from the admin dashboard will appear here.</p>
            </div>
          )}

          <motion.div layout className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c, i) => (
              <motion.div
                key={c.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 120, damping: 18 }}
                className="group case-study-list-card h-full"
              >
                <Link
                  to={`/case-studies/${c.slug}`}
                  className="case-study-list-inner relative flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_10px_28px_-14px_rgba(15,23,42,0.22)] ring-1 ring-stone-900/[0.03] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-[0_30px_60px_-20px_rgba(15,23,42,0.24),0_0_0_1px_rgba(124,58,237,0.08)]"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${c.accent || '#0ea5e9'}12 0%, transparent 45%, ${c.accent || '#7c3aed'}0f 100%)`,
                    }}
                  />
                  <div className="relative aspect-[16/9] overflow-hidden bg-stone-200">
                    {c.image && (
                      <RemoteImage
                        src={c.image}
                        alt={`${c.title} — case study`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        fallbackSeed={`cs-${c.slug}`}
                      />
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/25 to-transparent transition-opacity duration-300 group-hover:from-stone-950/90"
                      aria-hidden
                    />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-3xl">
                      <div className="case-study-list-shine absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 skew-x-12 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm backdrop-blur-sm"
                        style={{ backgroundColor: `${c.accent || '#0ea5e9'}e6` }}
                      >
                        {c.category}
                      </span>
                      {c.clientSector && (
                        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md ring-1 ring-white/10">
                          {c.clientSector}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col p-6">
                    <h3
                      className="text-[1.35rem] font-bold leading-[1.3] text-stone-900 transition-colors duration-200 group-hover:text-violet-800"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {c.title}
                    </h3>
                    {(c.excerpt || c.resultSnippet) && (
                      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-stone-600">
                        {c.excerpt || c.resultSnippet}
                      </p>
                    )}
                    {c.resultSnippet && c.excerpt && (
                      <p className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/85 px-3.5 py-2.5 text-sm font-medium text-emerald-900">
                        <span className="text-emerald-700">Outcome:</span> {c.resultSnippet}
                      </p>
                    )}
                    {c.metrics && c.metrics.length > 0 && (
                      <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-stone-100 pt-5">
                        {c.metrics.slice(0, 3).map((m, j) => (
                          <div
                            key={j}
                            className="rounded-2xl bg-stone-50 px-2 py-3 text-center ring-1 ring-stone-100 transition-colors group-hover:bg-white"
                          >
                            <div className="text-lg font-bold tabular-nums leading-none" style={{ color: c.accent || '#0f172a' }}>
                              {m.value}
                            </div>
                            <div className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-wide text-stone-500">
                              {m.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-5">
                      {c.duration && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                          {c.duration}
                        </span>
                      )}
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                        style={{ color: c.accent || '#0EA5E9' }}
                      >
                        Read story
                        <ArrowUpRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          strokeWidth={2}
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/40 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Have a similar challenge?
          </h2>
          <p className="mt-3 text-stone-600">
            Tell us your context—industry, systems, and goals—and we’ll suggest a practical path and engagement model.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#0EA5E9] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-[#0284C7] hover:shadow-xl hover:shadow-sky-500/30"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function CaseStudyDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setItem(null);
    api.get(`/case-studies/${slug}`)
      .then((data) => setItem(data))
      .catch(() => { setItem(null); setNotFound(true); });
  }, [slug]);

  useEffect(() => {
    return subscribeContentStream((resource) => {
      if (resource !== 'case-studies' || !slug) return;
      api.get(`/case-studies/${slug}`).then(setItem).catch(() => {});
    });
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>Case study not found</h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">The case study you’re looking for doesn’t exist or has been moved.</p>
        <Link to="/case-studies" className="mt-6 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7] transition">
          View all case studies
        </Link>
      </div>
    );
  }

  if (!item) return <div className="pt-28 min-h-screen flex items-center justify-center bg-white text-stone-600">Loading...</div>;

  return (
    <div className="pt-28 bg-white">
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-[50%_0_50%_50%_/50%_50%_0_50%] bg-[#EDE9FE] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/case-studies" className="text-[#0EA5E9] text-sm font-semibold hover:underline">← Case Studies</Link>
          <span className="block mt-4 text-[#7C3AED] text-sm font-semibold uppercase tracking-wider">{item.category}</span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            {item.title}
          </h1>
          {item.image && (
            <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200/80 aspect-[21/9] max-h-[280px] bg-stone-100">
              <RemoteImage src={item.image} alt={`Case study: ${item.title}`} className="w-full h-full object-cover" loading="lazy" fallbackSeed={`csd-${slug}`} />
            </div>
          )}
          {item.client && <p className="mt-4 text-stone-600">Client: {item.client}</p>}
          <p className="mt-2 text-stone-500 text-sm max-w-2xl">An overview of the challenge we addressed, the approach we took, and the outcomes achieved. Details are anonymized to protect client confidentiality.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/education"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7] shadow-lg shadow-sky-200/60 transition"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-white transition"
            >
              Talk to us first
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-[var(--spacing-block)] space-y-12">
        {item.challenge && (
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Challenge</h2>
            <p className="mt-2 text-stone-600">{item.challenge}</p>
          </div>
        )}
        {item.solution && (
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Solution</h2>
            <p className="mt-2 text-stone-600">{item.solution}</p>
          </div>
        )}
        {item.results && (
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Results</h2>
            <p className="mt-2 text-stone-600">{item.results}</p>
          </div>
        )}
        {item.metrics?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {item.metrics.map((m, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-4 text-center border border-stone-200/80">
                <div className="text-2xl font-bold text-[#0EA5E9]">{m.value}</div>
                <div className="text-sm text-stone-500">{m.label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/education" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7] shadow-lg shadow-sky-200/60 transition">
            Apply Now
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] shadow-lg shadow-orange-200/50 transition">
            Start your project
          </Link>
        </div>
        <div className="pt-12 mt-12 border-t border-stone-200">
          <p className="text-stone-500 text-sm">Have a similar challenge? We can help you achieve comparable outcomes. <Link to="/contact" className="text-[#0EA5E9] font-medium hover:underline">Get in touch</Link> to discuss your context.</p>
        </div>
      </div>
    </div>
  );
}
