import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Briefcase } from 'lucide-react';
import api from '../../lib/api';
import { deferIdle } from '../../lib/deferIdle';
import RemoteImage from '../ui/RemoteImage';

export default function CaseStudyPreview() {
  const [cases, setCases] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      api.get('/case-studies')
        .then((d) => { if (!cancelled) { setCases(Array.isArray(d) ? d.slice(0, 3) : []); setLoaded(true); } })
        .catch(() => { if (!cancelled) { setCases([]); setLoaded(true); } });
    }, 400);
    return () => { cancelled = true; cancel(); };
  }, []);

  if (!loaded || cases.length === 0) return null;

  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-end flex-wrap gap-4 mb-12"
        >
          <div>
            <span className="text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.15em]">Case Studies</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Proof of Our Work
            </h2>
            <p className="mt-2 text-stone-600 max-w-xl">Real outcomes from real engagements—challenges we solved and results we delivered for clients across sectors.</p>
          </div>
          <Link to="/case-studies" className="text-[#0EA5E9] font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1">
            View all case studies
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </motion.div>

        <div className="flex gap-6 overflow-x-auto pb-5 -mx-4 px-4 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
          {cases.map((c, i) => (
            <motion.div
              key={c._id || c.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -8 }}
              className="group relative shrink-0 w-[min(368px,88vw)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <Link to={`/case-studies/${c.slug}`} className="block">
                <article className="relative overflow-hidden rounded-[1.35rem] border border-stone-200/80 bg-white shadow-[0_16px_38px_-22px_rgba(15,23,42,0.45)] transition-all duration-300 group-hover:border-violet-200 group-hover:shadow-[0_28px_56px_-26px_rgba(15,23,42,0.45)]">
                  <div className="aspect-[16/10] relative overflow-hidden bg-stone-100">
                    {c.image && (
                      <RemoteImage
                        src={c.image}
                        alt={`Case study: ${c.title}`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        fallbackSeed={`case-${c.slug}`}
                      />
                    )}
                    {!c.image && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-sky-50">
                        <Briefcase className="w-10 h-10 text-violet-200" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `linear-gradient(145deg, ${c.accent || '#0EA5E9'}22 0%, transparent 48%, #7c3aed1f 100%)` }} />
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
                      {c.category && (
                        <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-sm" style={{ backgroundColor: `${c.accent || '#0EA5E9'}e8` }}>
                          {c.category}
                        </span>
                      )}
                      {c.clientSector && (
                        <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm">
                          {c.clientSector}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-[1.35rem] font-bold leading-tight text-white transition-colors duration-200 group-hover:text-sky-200" style={{ fontFamily: 'var(--font-display)' }}>
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  <div className="relative p-5 sm:p-6">
                    {(c.excerpt || c.resultSnippet) && (
                      <p className="text-sm leading-relaxed text-stone-600 line-clamp-2">{c.excerpt || c.resultSnippet}</p>
                    )}
                    {c.resultSnippet && (
                      <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
                        <span className="text-emerald-700">Outcome:</span> {c.resultSnippet}
                      </p>
                    )}
                    {c.metrics && c.metrics.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {c.metrics.slice(0, 2).map((m, j) => (
                          <div key={j} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                            <div className="text-base font-bold leading-none tabular-nums" style={{ color: c.accent || '#0EA5E9' }}>{m.value}</div>
                            <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-stone-500">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
                      {c.duration ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                          {c.duration} engagement
                        </span>
                      ) : <span />}
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5" style={{ color: c.accent || '#0EA5E9' }}>
                        View case study
                        <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
