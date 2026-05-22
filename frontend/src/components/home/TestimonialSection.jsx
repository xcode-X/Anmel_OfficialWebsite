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

function TestimonialAvatar({ testimonial, index, style }) {
  const [imgOk, setImgOk] = useState(false);
  const avatarSrc = testimonial.avatar || testimonial.image;
  const initials = testimonial.name
    ? testimonial.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 ring-2 ring-white shadow-md relative">
      {avatarSrc && (
        <RemoteImage
          src={avatarSrc}
          alt={testimonial.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imgOk ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          fallbackSeed={`avatar-${index}`}
          onLoad={() => setImgOk(true)}
          onError={() => setImgOk(false)}
        />
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center text-white font-bold text-xs ${avatarSrc && imgOk ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ background: style.avatar }}
        aria-hidden={avatarSrc && imgOk}
      >
        {initials}
      </div>
    </div>
  );
}

function TestimonialCard({ t, i }) {
  const accentKey = t.accent || fallbackAccentKeys[i % fallbackAccentKeys.length];
  const style = accentStyles[accentKey] || accentStyles.sky;
  const subtitle = [t.role, t.company].filter(Boolean).join(' · ');
  const meta = [t.program, t.uni].filter(Boolean).join(' · ') || [t.sector, t.location].filter(Boolean).join(' · ');

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl border border-stone-200/80 bg-white shadow-[var(--shadow-card)] overflow-hidden hover:shadow-[var(--shadow-hover)] transition-shadow duration-300"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${style.bar}`} />
      <div className="p-5 sm:p-6 pl-7">
        <span className="text-4xl font-serif text-stone-200 leading-none select-none" aria-hidden="true">"</span>
        <blockquote className="mt-1 text-stone-700 leading-relaxed text-sm sm:text-[15px]">
          {t.quote}
        </blockquote>
        {t.outcome && (
          <div className={`mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {t.outcome}
          </div>
        )}
        <footer className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3">
          <TestimonialAvatar testimonial={t} index={i} style={style} />
          <div className="min-w-0">
            <cite className="not-italic font-semibold text-stone-900 block text-sm">{t.name}</cite>
            {subtitle && <p className="text-xs text-stone-500 truncate">{subtitle}</p>}
            {meta && <p className="text-[11px] text-stone-400 mt-0.5 truncate">{meta}</p>}
          </div>
        </footer>
      </div>
      <div className={`absolute top-3 right-3 w-12 h-12 rounded-full opacity-10 ${style.dot}`} />
    </motion.article>
  );
}

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    testimonialsApi.list()
      .then((d) => { setTestimonials(Array.isArray(d) ? d : []); setLoaded(true); })
      .catch(() => { setTestimonials([]); setLoaded(true); });
    const cleanup = testimonialsApi.subscribe((rows) => {
      if (Array.isArray(rows) && rows.length > 0) {
        setTestimonials(rows);
        setLoaded(true);
      }
    });
    return cleanup;
  }, []);

  if (!loaded || testimonials.length === 0) return null;

  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden" aria-labelledby="testimonials-heading">
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 rounded-[60%_40%_50%_50%_/50%_60%_40%_50%] bg-sky-pale opacity-50" aria-hidden />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-48 h-48 sm:w-64 sm:h-64 rounded-[30%_70%_70%_30%_/30%_30%_70%_70%] bg-purple-pale opacity-40" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-12"
        >
          <span className="text-purple font-semibold text-xs uppercase tracking-[0.22em]">Testimonials</span>
          <h2 id="testimonials-heading" className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            What People Say
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 px-2">
            Hear from leaders who partnered with Anmel Inc to strengthen their security posture and build lasting resilience.
          </p>
        </motion.header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t._id || t.name || i} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
