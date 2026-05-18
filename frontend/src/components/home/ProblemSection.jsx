import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Lock, Globe } from 'lucide-react';

const stats = [
  { value: '76%', label: 'of breaches involve human error', color: '#F97316', icon: AlertTriangle },
  { value: '43%', label: 'of attacks target small business', color: '#7C3AED', icon: ShieldAlert },
  { value: '287', label: 'days avg. to identify a breach', color: '#0EA5E9', icon: Lock },
];

const risks = [
  { text: 'Unpatched vulnerabilities', icon: ShieldAlert },
  { text: 'Weak access controls', icon: Lock },
  { text: 'Unsecured APIs', icon: Globe },
];

export default function ProblemSection() {
  return (
    <section className="py-[var(--spacing-section)] relative overflow-hidden bg-white">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F97316] via-[#7C3AED] to-[#0EA5E9]" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header block — full width, strong typography */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em] mb-4 whitespace-nowrap">
            The Reality
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-[1.12] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Cyber Threats Are Evolving.{' '}
            <span className="text-[#F97316]">Is Your Business Ready?</span>
          </h2>
          <p className="mt-6 text-stone-600 text-lg leading-relaxed">
            Ransomware, phishing, supply-chain attacks, and insider threats are increasing in frequency and sophistication. Without proactive security engineering—and clear ownership of risks—your data, customer trust, and regulatory standing are at risk.
          </p>
        </motion.header>

        {/* Two-column content: left = copy + risks, right = stat cards */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <p className="text-stone-600 leading-relaxed">
              Many organizations discover critical gaps only after an incident or during an audit. We help you get ahead: identify weaknesses, prioritize remediation, and build defenses that scale with your business.
            </p>
            <div className="mt-10 p-6 rounded-2xl bg-stone-50 border border-stone-200/80">
              <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Common exposure points</p>
              <ul className="space-y-3">
                {risks.map((item, i) => {
                  const RiskIcon = item.icon;
                  return (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 text-stone-700"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-[#F97316] shrink-0">
                      <RiskIcon className="w-4 h-4" strokeWidth={2} />
                    </span>
                    {item.text}
                  </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="lg:col-span-2 space-y-5"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative bg-white rounded-2xl p-6 border border-stone-200/80 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-stone-300 transition-all duration-300 overflow-hidden cursor-default"
                >
                  <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: stat.color }} />
                  <div className="pl-4 flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${stat.color}18` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <div
                        className="text-2xl sm:text-3xl font-bold tabular-nums"
                        style={{ color: stat.color, fontFamily: 'var(--font-display)' }}
                      >
                        {stat.value}
                      </div>
                      <p className="mt-1 text-sm text-stone-500 leading-snug">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
