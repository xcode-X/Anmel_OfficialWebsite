import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, FileCheck, Cloud, Activity, GraduationCap, ArrowRight, Settings,
} from 'lucide-react';
import api from '../../lib/api';
import { deferIdle } from '../../lib/deferIdle';

const iconMap = {
  'security-assessment': Shield,
  'secure-development': Lock,
  'compliance': FileCheck,
  'monitoring': Activity,
  'cloud-security': Cloud,
  'training': GraduationCap,
};

const defaultIcon = Settings;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      api.get('/services')
        .then((d) => { if (!cancelled) { setServices(Array.isArray(d) ? d : []); setLoaded(true); } })
        .catch(() => { if (!cancelled) { setServices([]); setLoaded(true); } });
    }, 300);
    return () => { cancelled = true; cancel(); };
  }, []);

  if (!loaded || services.length === 0) return null;

  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl -z-10"
        style={{ background: 'radial-gradient(ellipse, rgba(47,160,132,0.06) 0%, rgba(93,28,106,0.05) 50%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-block text-sky font-semibold text-xs uppercase tracking-[0.22em] mb-4">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Security Intelligence Meets{' '}
            <span className="gradient-text">Engineering Excellence</span>
          </h2>
          <p className="mt-5 text-stone-600 text-lg leading-relaxed">
            End-to-end cybersecurity and secure web engineering tailored to your risk profile.
            We combine deep technical expertise with modern engineering practices.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((s) => {
            const Icon = iconMap[s.slug] || defaultIcon;
            return (
              <motion.div
                key={s.slug || s._id}
                variants={item}
                transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to={`/services/${s.slug}`}
                  className="group block h-full bg-offwhite rounded-[var(--radius-card)] p-7 border border-border hover:border-sky/30 hover:shadow-[var(--shadow-hover)] hover:bg-white transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky to-purple scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                  <span className="inline-flex w-13 h-13 items-center justify-center rounded-2xl bg-sky/10 text-sky group-hover:bg-sky group-hover:text-white transition-all duration-300" aria-hidden="true">
                    <Icon className="w-6 h-6" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-stone-900 group-hover:text-purple transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-stone-600 leading-relaxed text-sm">
                    {s.shortDescription || s.description || ''}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-orange group-hover:gap-2.5 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-purple font-semibold text-sm border border-purple/25 bg-purple-pale rounded-full px-6 py-3 hover:bg-purple hover:text-white hover:border-transparent transition-all duration-200"
          >
            View all security services
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
