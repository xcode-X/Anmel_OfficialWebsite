import { motion } from 'framer-motion';
import { Building2, Shield } from 'lucide-react';

const clients = [
  'Financial services',
  'Healthcare',
  'E‑commerce',
  'Government',
  'Technology',
  'Energy & utilities',
];

export default function ClientSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden" aria-labelledby="clients-heading">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <Shield className="w-4 h-4" strokeWidth={2} />
            Trusted by
          </span>
          <h2 id="clients-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Organizations that put security first
          </h2>
          <p className="mt-4 text-stone-600">
            From startups to enterprises across West Africa and beyond. We help regulated and high-risk sectors build and maintain strong security postures.
          </p>
        </motion.header>

        {/* Client / sector pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4"
        >
          {clients.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 border border-stone-200/80 text-stone-700 font-medium text-sm hover:border-[#0EA5E9]/40 hover:bg-[#E0F2FE]/50 hover:text-stone-900 transition-all duration-300"
            >
              <Building2 className="w-4 h-4 text-[#0EA5E9]" strokeWidth={1.8} />
              {name}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-stone-500"
        >
          Including banks & credit unions, hospitals & health systems, retail & marketplaces, public sector, SaaS & software, and critical infrastructure.
        </motion.p>
      </div>
    </section>
  );
}
