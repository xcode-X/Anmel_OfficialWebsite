import { motion } from 'framer-motion';
import { Award, Zap, Headphones } from 'lucide-react';

const metrics = [
  { value: '98%', label: 'Client satisfaction', color: 'sky' },
  { value: '150+', label: 'Projects delivered', color: 'purple' },
  { value: '24hr', label: 'Avg. response time', color: 'orange' },
];

const points = [
  {
    text: 'Elite security talent',
    icon: Award,
    description:
      'Our team brings years of hands-on experience in penetration testing, secure development, and compliance. We stay current with emerging threats and frameworks so you get actionable, up-to-date guidance.',
    details: ['Certified practitioners', 'Cross-industry experience', 'Plain-language reporting'],
    accentColor: 'sky',
  },
  {
    text: 'Proven methodologies',
    icon: Zap,
    description:
      'We use repeatable, risk-based approaches—from scoping and assessment through remediation and handover. Every engagement follows documented processes so outcomes are consistent and defensible.',
    details: ['Structured scoping', 'Phased remediation roadmaps', 'Runbooks and documentation'],
    accentColor: 'purple',
  },
  {
    text: 'Continuous monitoring',
    icon: Headphones,
    description:
      'Security is not a one-off project. We help you establish ongoing detection, response, and improvement so you can sustain controls and adapt as your environment and threats evolve.',
    details: ['SIEM and detection design', 'Incident response playbooks', 'Regular health checks'],
    accentColor: 'orange',
  },
];

const accentMap = {
  sky:    { bg: 'bg-sky/10',    icon: 'text-sky',    bar: 'bg-sky',    dot: 'bg-sky',    hover: 'hover:border-sky/40 hover:shadow-sky/10' },
  purple: { bg: 'bg-purple/10', icon: 'text-purple', bar: 'bg-purple', dot: 'bg-purple', hover: 'hover:border-purple/40 hover:shadow-purple/10' },
  orange: { bg: 'bg-orange/10', icon: 'text-orange', bar: 'bg-orange', dot: 'bg-orange', hover: 'hover:border-orange/40 hover:shadow-orange/10' },
};

const metricAccentMap = {
  sky:    'text-sky',
  purple: 'text-purple',
  orange: 'text-orange',
};

const metricBarMap = {
  sky:    'bg-sky',
  purple: 'bg-purple',
  orange: 'bg-orange',
};

export default function WhyAnmelSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-offwhite relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-pale opacity-60 -translate-y-1/2 translate-x-1/4" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 rounded-full bg-purple-pale opacity-50 translate-y-1/2 -translate-x-1/4" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-block text-sky font-semibold text-xs uppercase tracking-[0.22em] mb-4">
            Why Anmel Inc
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-[1.12] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Partner Built for{' '}
            <span className="text-purple">Long-Term</span>{' '}
            Resilience
          </h2>
          <p className="mt-5 text-stone-600 text-lg leading-relaxed">
            We combine deep security expertise with modern engineering practices. Every solution
            is built for resilience, compliance, and long-term trust.
          </p>
        </motion.header>

        {/* metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          className="grid sm:grid-cols-3 gap-5 mb-14"
        >
          {metrics.map((m, i) => {
            const textClass = metricAccentMap[m.color];
            const barClass = metricBarMap[m.color];
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative bg-white rounded-[var(--radius-card)] p-7 border border-border shadow-[var(--shadow-card)] text-center overflow-hidden hover:shadow-[var(--shadow-hover)] transition-shadow duration-300"
              >
                <p
                  className={`text-4xl sm:text-5xl font-bold tabular-nums ${textClass}`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {m.value}
                </p>
                <p className="mt-2 text-stone-600 font-medium text-sm">{m.label}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${barClass} opacity-80`} aria-hidden />
              </motion.div>
            );
          })}
        </motion.div>

        {/* value-prop cards */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold text-purple uppercase tracking-[0.22em]">What you get</p>
          <p className="mt-2 text-stone-600 max-w-xl mx-auto text-sm">
            When you work with Anmel Inc you get more than a report — you get a partner committed
            to measurable outcomes and lasting resilience.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {points.map((pt, i) => {
            const Icon = pt.icon;
            const a = accentMap[pt.accentColor];
            return (
              <motion.div
                key={pt.text}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className={`group relative bg-white rounded-[var(--radius-card)] border border-border p-6 sm:p-7 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] ${a.hover} transition-all duration-300`}
              >
                {/* top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${a.bar} rounded-t-[var(--radius-card)] opacity-0 group-hover:opacity-90 transition-opacity duration-300`} aria-hidden />

                {/* icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${a.bg}`}>
                  <Icon className={`w-7 h-7 ${a.icon}`} strokeWidth={1.8} />
                </div>

                <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  {pt.text}
                </h3>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">{pt.description}</p>

                <ul className="mt-5 space-y-2.5">
                  {pt.details.map((d) => (
                    <li key={d} className="flex items-center gap-2.5 text-sm text-stone-600">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.dot}`} />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
