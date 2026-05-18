import { motion } from 'framer-motion';
import { Award, Shield, Lock, CreditCard } from 'lucide-react';

const badges = [
  { icon: Award, label: 'ISO 27001', sub: 'Information security management' },
  { icon: Shield, label: 'SOC 2', sub: 'Trust services criteria' },
  { icon: Lock, label: 'GDPR', sub: 'Data protection alignment' },
  { icon: CreditCard, label: 'PCI DSS', sub: 'Payment card security' },
];

export default function ComplianceTrustSection() {
  return (
    <section className="py-10 bg-stone-100 border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#7C3AED] mb-6">
          Frameworks &amp; standards we align with
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {badges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-white border border-stone-200/90 px-4 py-4 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0EA5E9]">
                <b.icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.6} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-stone-900 text-sm sm:text-base" style={{ fontFamily: 'var(--font-display)' }}>
                  {b.label}
                </p>
                <p className="text-xs text-stone-500 leading-snug mt-0.5 line-clamp-2">{b.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
