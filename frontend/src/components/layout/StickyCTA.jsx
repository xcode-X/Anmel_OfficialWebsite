import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Hand } from 'lucide-react';

export default function StickyCTA() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  const cta = isHome
    ? {
        to: '/education',
        label: 'Apply Now',
        ariaLabel: 'Apply now for a program',
        className:
          'flex items-center gap-2 px-5 py-3 rounded-full bg-sky text-white font-semibold text-sm shadow-[var(--shadow-sky)] hover:bg-sky-light transition hover:scale-105 active:scale-100',
      }
    : {
        to: '/contact',
        label: 'Free Consultation',
        ariaLabel: 'Get a free security consultation',
        className:
          'flex items-center gap-2 px-5 py-3 rounded-full bg-orange text-white font-semibold text-sm shadow-[var(--shadow-orange)] hover:bg-orange-light transition hover:scale-105 active:scale-100',
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.8 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        to={cta.to}
        aria-label={cta.ariaLabel}
        className={`${cta.className} ${isHome ? 'apply-cta-clickable' : ''}`}
      >
        {isHome && (
          <span className="relative inline-flex items-center justify-center">
            <span className="apply-cta-ripple absolute h-7 w-7 rounded-full bg-white/30" aria-hidden />
            <Hand className="apply-cta-hand w-4 h-4" strokeWidth={2} />
          </span>
        )}
        {isHome && <GraduationCap className="w-4 h-4" strokeWidth={2} />}
        <span>{cta.label}</span>
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </Link>
    </motion.div>
  );
}
