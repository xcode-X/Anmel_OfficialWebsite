import { motion } from 'framer-motion';
import { Award, Zap, Headphones, GraduationCap, Code2, ShieldCheck, CheckCircle2 } from 'lucide-react';

const metrics = [
  { value: '10,000+', label: 'Students Placed Worldwide', color: 'sky' },
  { value: '150+', label: 'Web & Cloud Applications Built', color: 'purple' },
  { value: '99.9%', label: 'Security & Uptime Assurance', color: 'orange' },
];

const points = [
  {
    text: 'Global Education Pathways',
    icon: GraduationCap,
    description:
      'We partner with over 500 accredited international universities in the US, UK, Canada, Europe, and Australia to secure admissions and full scholarships for deserving students.',
    details: ['100% Tuition Scholarship Guidance', 'Direct University Placement', 'Complete Visa Support'],
    accentColor: 'sky',
  },
  {
    text: 'Custom Web & Software Engineering',
    icon: Code2,
    description:
      'From responsive web applications to enterprise cloud portals and high-conversion e-commerce systems, our software engineers build modern products tailored to your goals.',
    details: ['Modern Full-Stack Architecture', 'Responsive Mobile-First UI/UX', 'Cloud Deployment & DevOps'],
    accentColor: 'purple',
  },
  {
    text: 'Enterprise Cyber Security Defense',
    icon: ShieldCheck,
    description:
      'Protecting applications, user data, and IT infrastructure against cyber threats with penetration testing, security audits, ISO compliance, and instant web scans.',
    details: ['Web & API Penetration Testing', 'ISO 27001 & SOC 2 Audits', 'Instant Website Security Checker'],
    accentColor: 'orange',
  },
];

const accentMap = {
  sky:    { bg: 'bg-[#2FA084]/10', icon: 'text-[#2FA084]', bar: 'bg-[#2FA084]', dot: 'bg-[#2FA084]', hover: 'hover:border-[#2FA084]/40 hover:shadow-[#2FA084]/10' },
  purple: { bg: 'bg-[#5D1C6A]/10', icon: 'text-[#5D1C6A]', bar: 'bg-[#5D1C6A]', dot: 'bg-[#5D1C6A]', hover: 'hover:border-[#5D1C6A]/40 hover:shadow-[#5D1C6A]/10' },
  orange: { bg: 'bg-[#0EA5E9]/10', icon: 'text-[#0EA5E9]', bar: 'bg-[#0EA5E9]', dot: 'bg-[#0EA5E9]', hover: 'hover:border-[#0EA5E9]/40 hover:shadow-[#0EA5E9]/10' },
};

const metricAccentMap = {
  sky:    'text-[#2FA084]',
  purple: 'text-[#5D1C6A]',
  orange: 'text-[#0EA5E9]',
};

const metricBarMap = {
  sky:    'bg-[#2FA084]',
  purple: 'bg-[#5D1C6A]',
  orange: 'bg-[#0EA5E9]',
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
          <span className="inline-block text-[#2FA084] font-bold text-xs uppercase tracking-[0.22em] mb-4">
            Why Choose Anmel Inc
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-[1.12] tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Integrated Solutions for{' '}
            <span className="text-[#5D1C6A]">Global Success</span>
          </h2>
          <p className="mt-5 text-stone-600 text-lg leading-relaxed">
            At Anmel Inc, we unite Education Consultancy, Web Development, and Cybersecurity Consulting under one roof—giving students, businesses, and institutions a single partner for global growth.
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
          <p className="text-xs font-semibold text-[#5D1C6A] uppercase tracking-[0.22em]">Our Core Advantage</p>
          <p className="mt-2 text-stone-600 max-w-xl mx-auto text-sm">
            Partnering with Anmel Inc means working with experienced advisors, software engineers, and security specialists committed to excellence.
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
                    <li key={d} className="flex items-center gap-2.5 text-sm text-stone-600 font-medium">
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
