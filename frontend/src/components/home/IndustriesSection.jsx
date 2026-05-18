import { motion } from 'framer-motion';
import { Landmark, HeartPulse, ShoppingCart, Building2, Cpu } from 'lucide-react';

const industries = [
  { name: 'Financial services', Icon: Landmark, gradient: 'from-[#0EA5E9] to-[#7C3AED]', accent: '#0EA5E9', hoverBg: 'rgba(14, 165, 233, 0.14)' },
  { name: 'Healthcare', Icon: HeartPulse, gradient: 'from-[#7C3AED] to-[#F97316]', accent: '#7C3AED', hoverBg: 'rgba(124, 58, 237, 0.12)' },
  { name: 'E‑commerce', Icon: ShoppingCart, gradient: 'from-[#F97316] to-[#0EA5E9]', accent: '#F97316', hoverBg: 'rgba(249, 115, 22, 0.14)' },
  { name: 'Government', Icon: Building2, gradient: 'from-[#0EA5E9] to-[#F97316]', accent: '#0EA5E9', hoverBg: 'rgba(14, 165, 233, 0.14)' },
  { name: 'Technology', Icon: Cpu, gradient: 'from-[#7C3AED] to-[#0EA5E9]', accent: '#7C3AED', hoverBg: 'rgba(124, 58, 237, 0.12)' },
];

export default function IndustriesSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">Industries</span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Sector experience that fits your context
          </h2>
          <p className="mt-3 text-stone-600">
            We've helped organizations across regulated and high-risk sectors build and maintain strong security postures.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6"
        >
          {industries.map(({ name, Icon, gradient, accent, hoverBg }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 120 }}
              whileHover={{ y: -8, scale: 1.05, transition: { duration: 0.3 } }}
              className="group relative industries-card"
            >
              {/* Gradient border / glow wrapper */}
              <div
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}
              />
              <motion.div
                className="relative px-5 py-4 rounded-2xl bg-white border border-stone-200/80 text-stone-700 font-medium flex items-center gap-3 overflow-hidden transition-[border-color] duration-300"
                whileHover={{ borderColor: 'transparent', transition: { duration: 0.25 } }}
              >
                {/* Hover background — single nice color per card (sky / purple / orange) */}
                <div
                  className="industries-card-hover-bg absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ backgroundColor: hoverBg }}
                  aria-hidden
                />
                {/* Gradient overlay on hover (subtle) */}
                <div
                  className={`industries-card-gradient absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl pointer-events-none`}
                  aria-hidden
                />
                {/* Shine sweep — runs via CSS on group hover */}
                <div className="industries-card-shine absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                  <div className="industries-card-shine-bar absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                </div>
                <span
                  className="relative z-10 inline-flex w-10 h-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <span className="relative z-10 font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">
                  {name}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
