import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { testimonialsApi } from '../../lib/api';
import RemoteImage from '../ui/RemoteImage';

const accentStyles = {
  sky:    { bar: 'bg-sky',    dot: 'bg-sky',    badge: 'bg-sky-pale text-sky',       avatar: 'linear-gradient(135deg, #2FA084, #3CD1AD)' },
  purple: { bar: 'bg-purple', dot: 'bg-purple', badge: 'bg-purple-pale text-purple', avatar: 'linear-gradient(135deg, #5D1C6A, #8C2FA0)' },
  orange: { bar: 'bg-orange', dot: 'bg-orange', badge: 'bg-orange-pale text-orange', avatar: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
};

const fallbackAccentKeys = ['sky', 'purple', 'orange'];

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    testimonialsApi.list()
      .then((d) => { setTestimonials(Array.isArray(d) ? d : []); setLoaded(true); })
      .catch(() => { setTestimonials([]); setLoaded(true); });
    const cleanup = testimonialsApi.subscribe((rows) => {
      setTestimonials(rows);
      setLoaded(true);
    });
    return cleanup;
  }, []);

  if (!loaded || testimonials.length === 0) return null;

  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden" aria-labelledby="testimonials-heading">
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-[60%_40%_50%_50%_/50%_60%_40%_50%] bg-sky-pale opacity-50" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-64 h-64 rounded-[30%_70%_70%_30%_/30%_30%_70%_70%] bg-purple-pale opacity-40" aria-hidden />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-pale opacity-50" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-purple font-semibold text-xs uppercase tracking-[0.22em]">Testimonials</span>
          <h2 id="testimonials-heading" className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            What People Say
          </h2>
          <p className="mt-4 text-stone-600">
            Hear from leaders who partnered with Anmel Inc to strengthen their security posture and build lasting resilience.
          </p>
        </motion.header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => {
            const accentKey = t.accent || fallbackAccentKeys[i % fallbackAccentKeys.length];
            const style = accentStyles[accentKey] || accentStyles.sky;
            const initials = t.name ? t.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?';
            return (
              <motion.article
                key={t._id || t.name || i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-stone-200/80 bg-white shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-hover)] transition-all duration-300"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${style.bar}`} />
                <div className="p-6 sm:p-8 pl-8">
                  <span className="text-5xl font-serif text-stone-200 leading-none select-none" aria-hidden="true">"</span>
                  <blockquote className="mt-2 text-stone-700 leading-relaxed text-[15px] sm:text-base">
                    {t.quote}
                  </blockquote>
                  {t.outcome && (
                    <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {t.outcome}
                    </div>
                  )}
                  <footer className="mt-6 pt-6 border-t border-stone-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0 ring-2 ring-white shadow-md relative">
                      {t.avatar && (
                        <RemoteImage src={t.avatar} alt={t.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" fallbackSeed={`avatar-${i}`} />
                      )}
                      <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-sm ${t.avatar ? 'avatar-fallback' : ''}`} style={{ background: style.avatar }} aria-hidden={!!t.avatar}>
                        {initials}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <cite className="not-italic font-semibold text-stone-900 block">{t.name}</cite>
                      {t.role && <p className="text-sm text-stone-500">{t.role}</p>}
                      {t.company && <p className="text-sm text-stone-600 font-medium mt-0.5">{t.company}</p>}
                      {(t.sector || t.location) && (
                        <p className="text-xs text-stone-400 mt-1">
                          {[t.sector, t.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </footer>
                </div>
                <div className={`absolute top-4 right-4 w-16 h-16 rounded-full opacity-10 ${style.dot}`} />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
