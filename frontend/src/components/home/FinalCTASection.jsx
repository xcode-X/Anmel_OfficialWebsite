import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Phone, CalendarDays } from 'lucide-react';

const perks = [
  { icon: CalendarDays, text: '30-min confidential call, no obligation' },
  { icon: Mail, text: 'Written security assessment summary' },
  { icon: Phone, text: 'Direct access to a senior consultant' },
];

export default function FinalCTASection() {
  return (
    <section className="relative overflow-hidden">
      {/* dark purple-to-navy gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#120820] via-[#0A0F1A] to-[#061018]" aria-hidden />
      {/* decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple/18 blur-[120px] -translate-x-1/4 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky/12 blur-[100px] translate-x-1/4 translate-y-1/3" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(47,160,132,1) 1px, transparent 1px), linear-gradient(to right, rgba(47,160,132,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-[var(--spacing-section)] relative z-10 text-center">
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-sky px-4 py-2 rounded-full text-xs font-semibold tracking-wider mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky animate-pulse" />
          Free Consultation — No Obligation
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Protect Your Digital{' '}
          <span className="text-orange">Infrastructure</span>{' '}
          Today.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="mt-5 text-white/60 text-lg max-w-xl mx-auto leading-relaxed"
        >
          Schedule a confidential consultation and get clarity on your security posture —
          plain language, no jargon.
        </motion.p>

        {/* perks */}
        <motion.ul
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14 }}
          className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3"
        >
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 text-sm text-white/55">
              <Icon className="w-4 h-4 text-sky shrink-0" strokeWidth={1.8} />
              {text}
            </li>
          ))}
        </motion.ul>

        {/* primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-orange hover:bg-orange-light text-white font-bold text-base shadow-[var(--shadow-orange)] hover:shadow-none transition-all duration-200 hover:-translate-y-0.5"
          >
            Schedule Confidential Consultation
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/80 font-semibold text-base hover:bg-white/8 hover:text-white hover:border-white/25 transition-all duration-200"
          >
            View our services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
