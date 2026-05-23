import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Shield, Handshake, BarChart3, Search, PencilRuler, Cog, Activity, Globe2, Users, Clock, Rocket, Building2, Trophy, Sparkles, MapPin, Lock } from 'lucide-react';
import { aboutHeroImage, aboutHeroAccent, aboutGalleryImages, heroImage } from '../lib/siteImages';
import { fieldEngagements } from '../lib/aboutFieldData';
import RemoteImage from '../components/ui/RemoteImage';
import MotionLink from '../components/ui/MotionLink';

/** Scroll-triggered sections: start slightly before entering view */
const viewport = { once: true, margin: '-70px' };

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const timeline = [
  {
    year: '2020',
    title: 'Foundation',
    desc: 'Anmel Inc was founded in Monrovia with a focus on secure web engineering and helping local businesses harden their digital infrastructure. Our first engagements centered on application security and secure deployment practices.',
    color: '#0EA5E9',
    icon: Rocket,
    metric: '12+',
    metricLabel: 'Founding clients',
    highlights: ['Founded in Monrovia', 'Secure web engineering focus', 'First app-security engagements'],
  },
  {
    year: '2022',
    title: 'Enterprise expansion',
    desc: 'We launched formal enterprise security assessment and compliance readiness services. We supported our first financial and healthcare clients through gap assessments and remediation roadmaps.',
    color: '#7C3AED',
    icon: Building2,
    metric: '40+',
    metricLabel: 'Enterprise engagements',
    highlights: ['Compliance readiness practice', 'Finance & healthcare wins', 'Senior-led delivery teams'],
  },
  {
    year: '2024',
    title: 'Regional leader',
    desc: 'Recognized as a leading cybersecurity partner across the region, we now serve clients in multiple sectors with end-to-end security programs, from discovery through ongoing monitoring and defense.',
    color: '#F97316',
    icon: Trophy,
    metric: '150+',
    metricLabel: 'Projects delivered',
    highlights: ['Regional cybersecurity leader', 'End-to-end security programs', 'Continuous monitoring & defense'],
  },
];

const values = [
  {
    title: 'Mission',
    subtitle: 'Protect. Enable. Grow.',
    text: 'To empower organizations with intelligent security solutions that protect data, build trust, and enable growth. We believe strong security is a business enabler, not a bottleneck.',
    color: '#7C3AED',
    icon: Target,
    highlights: ['Risk reduction with measurable outcomes', 'Security woven into delivery, not bolted on', 'Plain-language guidance for every stakeholder'],
  },
  {
    title: 'Vision',
    subtitle: 'Secure by default.',
    text: 'A world where every digital infrastructure is resilient, compliant, and engineered for security by default. We work toward that future one engagement at a time.',
    color: '#0EA5E9',
    icon: Eye,
    highlights: ['Resilient systems that survive real attacks', 'Compliance as a continuous practice', 'Engineering cultures that ship safely'],
  },
];

const principles = [
  { title: 'Transparency', desc: 'Clear findings, plain-language reports, and no hidden surprises.', icon: Shield },
  { title: 'Partnership', desc: 'We work alongside your team so knowledge stays in-house.', icon: Handshake },
  { title: 'Outcomes', desc: 'We measure success by risk reduction and your ability to sustain controls.', icon: BarChart3 },
];

const methodologySteps = [
  { step: 'Assess', desc: 'Discovery, scoping, and risk-based assessment.', hint: 'Map assets & threat model', icon: Search, color: '#0EA5E9' },
  { step: 'Design', desc: 'Architecture and remediation roadmap.', hint: 'Prioritize what matters first', icon: PencilRuler, color: '#7C3AED' },
  { step: 'Implement', desc: 'Phased execution and documentation.', hint: 'Ship fixes with evidence trails', icon: Cog, color: '#F97316' },
  { step: 'Monitor', desc: 'Ongoing detection and improvement.', hint: 'Tune detection & iterate', icon: Activity, color: '#0EA5E9' },
];

const stats = [
  { value: '4+', label: 'Years in operation' },
  { value: '150+', label: 'Projects delivered' },
  { value: '98%', label: 'Client satisfaction' },
  { value: '24h', label: 'Typical response time' },
];

export default function About() {
  return (
    <div className="pt-28 bg-white min-h-screen">
      {/* Hero — full impact with background image + black overlay */}
      <section className="relative overflow-hidden isolate">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <RemoteImage
            src={heroImage}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            loading="eager"
            fallbackSeed="about-hero-bg"
          />
          {/* Black overlay */}
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/40" />
        </div>

        <motion.div
          className="h-1 w-full bg-gradient-to-r from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div
              className="max-w-xl"
              variants={heroContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#64FFDA] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
                About Anmel Inc
              </motion.span>
              <motion.h1 variants={heroItem} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Security Intelligence.{' '}
                <span className="text-[#A78BFA]">Engineering Excellence.</span>
              </motion.h1>
              <motion.p variants={heroItem} className="mt-6 text-lg text-stone-200 leading-relaxed">
                We are a cybersecurity and secure web engineering company based in Monrovia, Liberia. Our team combines deep technical expertise with a commitment to protecting the digital assets of businesses worldwide whether you are a startup, a regulated enterprise, or a government body.
              </motion.p>
              <motion.p variants={heroItem} className="mt-4 text-stone-300 leading-relaxed">
                We don’t just point out risks; we help you fix them, document them, and maintain them. That’s why our clients stay with us for the long term.
              </motion.p>
              <motion.div variants={heroItem}>
                <MotionLink
                  to="/contact"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] shadow-lg shadow-orange-900/40 transition-colors"
                >
                  Get in touch
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </MotionLink>
              </motion.div>
            </motion.div>
            {/* Creative About hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 28 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[440px] sm:h-[480px] lg:h-[520px]"
            >
              {/* Rotating gradient halo */}
              <motion.div
                aria-hidden
                className="absolute -inset-6 rounded-[2.5rem] opacity-70 blur-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #0EA5E9, #7C3AED, #F97316, #0EA5E9)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              />

              {/* Counter-rotating dashed ring */}
              <motion.div
                aria-hidden
                className="absolute inset-2 rounded-[2rem] border-2 border-dashed border-white/25"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />

              {/* Main image — tilted creative frame */}
              <motion.div
                className="absolute inset-x-6 top-6 bottom-20 overflow-hidden rounded-[1.75rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] ring-2 ring-white/20"
                style={{ transform: 'rotate(-2deg)' }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [-2, 0, -2],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.02, rotate: 0 }}
              >
                <RemoteImage
                  src={aboutHeroImage}
                  alt="Anmel Inc cybersecurity engineering team at work"
                  className="w-full h-full object-cover scale-105"
                  loading="eager"
                  fallbackSeed="Anmel Inc-about-hero-primary"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/55 via-stone-900/10 to-[#7C3AED]/25 pointer-events-none" />

                {/* Animated shimmer sweep */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                  initial={{ x: '-120%' }}
                  animate={{ x: '220%' }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                />

                {/* Bottom glass caption on main image */}
                <div className="absolute inset-x-0 bottom-0 px-5 py-4 bg-gradient-to-t from-stone-900/90 via-stone-900/50 to-transparent">
                  <p className="text-white text-sm font-semibold">Secure engineering in action</p>
                  <p className="text-stone-300 text-xs mt-0.5">Code review · Architecture · Defense</p>
                </div>
              </motion.div>

              {/* Accent inset card */}
              <motion.div
                className="absolute bottom-16 left-0 w-[42%] aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/90"
                initial={{ opacity: 0, y: 24, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 4 }}
                transition={{ delay: 0.45, type: 'spring', stiffness: 90, damping: 16 }}
                whileHover={{ rotate: 0, scale: 1.05, y: -4 }}
              >
                <RemoteImage
                  src={aboutHeroAccent}
                  alt="Security assessment and analysis"
                  className="w-full h-full object-cover"
                  fallbackSeed="Anmel Inc-about-hero-accent"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent pointer-events-none" />
              </motion.div>

              {/* Security badge — top right */}
              <motion.div
                className="absolute top-0 right-2 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-white/50"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#7C3AED] shadow-md">
                  <Lock className="w-4 h-4 text-white" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Trusted</p>
                  <p className="text-xs font-bold text-stone-900">Cybersecurity Partner</p>
                </div>
              </motion.div>

              {/* Stat chip — bottom right */}
              <motion.div
                className="absolute bottom-0 right-4 px-5 py-3.5 rounded-2xl bg-stone-900/90 backdrop-blur-md text-white shadow-2xl ring-1 ring-white/15"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.06, y: -3 }}
              >
                <p className="text-3xl font-bold text-[#64FFDA] tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>150+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mt-0.5">Projects delivered</p>
              </motion.div>

              {/* Sparkle accent */}
              <motion.div
                aria-hidden
                className="absolute top-1/3 left-2 text-[#F97316]"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-7 h-7 drop-shadow-lg" />
              </motion.div>

              {/* Shield pulse dot */}
              <motion.div
                aria-hidden
                className="absolute bottom-32 right-[38%] flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED]/90 shadow-lg ring-4 ring-white/30"
                animate={{ scale: [1, 1.12, 1], boxShadow: ['0 0 0 0 rgba(124,58,237,0.5)', '0 0 0 12px rgba(124,58,237,0)', '0 0 0 0 rgba(124,58,237,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              >
                <Shield className="w-5 h-5 text-white" strokeWidth={2} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-stone-900 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={viewport}
        >
          <motion.div
            className="absolute top-0 left-1/2 w-[600px] h-[300px] rounded-full bg-[#0EA5E9] -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.92 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
                }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="text-center cursor-default"
              >
                <motion.div
                  className="text-3xl sm:text-4xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                  initial={false}
                >
                  {s.value}
                </motion.div>
                <div className="mt-1 text-sm text-stone-400">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Extended narrative + imagery */}
      <section className="py-[var(--spacing-section)] bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
              }}
            >
              <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em]">
                Who we are
              </motion.span>
              <motion.h2 variants={heroItem} className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                Built for serious security outcomes
              </motion.h2>
              <motion.p variants={heroItem} className="mt-5 text-stone-600 leading-relaxed">
                Anmel Inc is a specialist cybersecurity and secure engineering practice. We combine offensive testing, architecture
                review, and compliance programs so leadership sees both risk and a practical path to reduce it—not a pile of
                PDFs that never gets implemented.
              </motion.p>
              <motion.p variants={heroItem} className="mt-4 text-stone-600 leading-relaxed">
                Our consultants and engineers work in small, senior-led teams. That means you talk to people who actually run
                assessments and write remediation guidance, not layers of account managers. We invest in long-term
                relationships: many clients start with a focused assessment and expand into secure development coaching, cloud
                hardening, and detection improvements.
              </motion.p>
              <motion.p variants={heroItem} className="mt-4 text-stone-600 leading-relaxed">
                From Monrovia we coordinate regional delivery across West Africa and support remote-first engagements globally,
                with clear communication windows and secure collaboration practices for sensitive data.
              </motion.p>
            </motion.div>

            {/* Creative "Who we are" composition */}
            <motion.div
              initial={{ opacity: 0, x: 28, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={viewport}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              className="relative h-[420px] lg:h-[480px]"
            >
              <motion.div
                aria-hidden
                className="absolute -top-6 -left-6 w-40 h-40 rounded-full border-2 border-dashed border-[#0EA5E9]/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden
                className="absolute -bottom-10 -right-6 w-56 h-56 rounded-full bg-gradient-to-br from-[#7C3AED]/30 to-[#0EA5E9]/20 blur-3xl"
                animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.08, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.div
                className="absolute inset-x-6 top-6 bottom-6 overflow-hidden shadow-2xl ring-1 ring-stone-200/70"
                style={{ borderRadius: '48% 52% 38% 62% / 44% 36% 64% 56%' }}
                animate={{
                  y: [0, -10, 0],
                  borderRadius: [
                    '48% 52% 38% 62% / 44% 36% 64% 56%',
                    '38% 62% 52% 48% / 54% 46% 54% 46%',
                    '48% 52% 38% 62% / 44% 36% 64% 56%',
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.02 }}
              >
                <RemoteImage
                  src={aboutGalleryImages.collaboration}
                  alt="Team collaborating on security architecture"
                  className="w-full h-full object-cover"
                  fallbackSeed="Anmel Inc-about-collab"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/35 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              <motion.div
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur shadow-lg ring-1 ring-stone-200"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={viewport}
                transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 14 }}
                animate={{ y: [0, -6, 0] }}
              >
                <motion.span
                  className="flex w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span className="text-xs font-semibold text-stone-800 tracking-wide">Senior-led team</span>
              </motion.div>

              <motion.div
                className="absolute left-4 bottom-6 px-5 py-3 rounded-2xl bg-stone-900 text-white shadow-xl ring-1 ring-white/10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ delay: 0.7, type: 'spring', stiffness: 120 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <p className="text-2xl font-bold text-[#A78BFA]" style={{ fontFamily: 'var(--font-display)' }}>98%</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-300 mt-0.5">Client satisfaction</p>
              </motion.div>

              <motion.div
                aria-hidden
                className="absolute top-1/3 right-8 text-[#F97316]"
                animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision — premium cards */}
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden">
        <motion.div
          className="absolute -left-20 top-1/2 h-64 w-64 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none"
          animate={{ x: [0, 20, 0], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              Purpose
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              Mission & Vision
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 85, damping: 17 }}
                  whileHover={{ y: -10, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="group relative rounded-3xl overflow-hidden border border-stone-200/80 bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300"
                >
                  {/* Colored header band */}
                  <div
                    className="relative px-8 pt-8 pb-10 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${v.color}18 0%, ${v.color}08 50%, transparent 100%)` }}
                  >
                    <motion.div
                      aria-hidden
                      className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-60"
                      style={{ backgroundColor: v.color }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    />
                    <motion.div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/60"
                      style={{ background: `linear-gradient(145deg, ${v.color}, ${v.color}cc)` }}
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
                    </motion.div>
                    <p className="relative mt-5 text-xs font-bold uppercase tracking-[0.22em]" style={{ color: v.color }}>
                      {v.subtitle}
                    </p>
                    <h3 className="relative mt-1 text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                      {v.title}
                    </h3>
                  </div>

                  <div className="px-8 pb-8 -mt-4">
                    <p className="text-stone-600 leading-relaxed">{v.text}</p>
                    <ul className="mt-5 space-y-2.5">
                      {v.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-sm text-stone-700">
                          <span
                            className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: v.color }}
                          />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-6 h-[3px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}33)` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Photo gallery — "In the field" */}
      <section className="py-[var(--spacing-section)] bg-stone-100/80 border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              In the field
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-3 text-2xl sm:text-3xl font-bold text-stone-900 lg:whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              How engagements look day to day
            </motion.h2>
            <motion.p variants={heroItem} className="mt-3 text-stone-600">
              Workshops, architecture reviews, and hands-on testing documented so your teams can act without guesswork.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {fieldEngagements.map((item, i) => {
              const Icon = item.icon;
              return (
                <MotionLink
                  key={item.slug}
                  to={`/about/field/${item.slug}`}
                  initial={{ opacity: 0, y: 28, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 90, damping: 16 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                  className="group relative flex flex-col rounded-2xl overflow-hidden bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] ring-1 ring-stone-200/80 transition-shadow duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <RemoteImage
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fallbackSeed={item.seed}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-xs font-semibold shadow" style={{ color: item.color }}>
                      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      {item.tag}
                    </div>
                    <h3 className="absolute bottom-3 left-4 right-4 text-white text-xl font-bold drop-shadow" style={{ fontFamily: 'var(--font-display)' }}>
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                    <ul className="mt-4 space-y-2">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <span
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:gap-2.5"
                      style={{ color: item.color }}
                    >
                      View details
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                    </span>
                    <div
                      className="mt-4 h-[3px] rounded-full origin-left transition-transform duration-500 scale-x-50 group-hover:scale-x-100"
                      style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}33)` }}
                    />
                  </div>
                </MotionLink>
              );
            })}
          </div>
        </div>
      </section>

      {/* Principles — what we stand for */}
      <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#EDE9FE] opacity-40 -translate-y-1/2 translate-x-1/4"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">
              Values
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              What we stand for
            </motion.h2>
            <motion.p variants={heroItem} className="mt-4 text-stone-600">
              The principles that guide every engagement and decision we make.
            </motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {principles.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 95, damping: 17 }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className="relative rounded-2xl bg-stone-50 border border-stone-200/80 p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-[#0EA5E9]/40 transition-colors duration-300"
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[#0EA5E9]/10 flex items-center justify-center mx-auto mb-5"
                    whileHover={{ rotate: [0, 12, -12, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-7 h-7 text-[#0EA5E9]" strokeWidth={1.8} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery & reach */}
      <section className="py-[var(--spacing-section)] bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
            >
              <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">
                Delivery
              </motion.span>
              <motion.h2 variants={heroItem} className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900 lg:whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                Regional roots, global collaboration
              </motion.h2>
              <motion.p variants={heroItem} className="mt-4 text-stone-600 leading-relaxed">
                We structure each engagement with a named lead, a clear communication rhythm, and secure channels for sharing
                evidence and reports. Whether we are on-site for workshops or supporting you remotely, you get the same
                documentation standards and executive-ready summaries.
              </motion.p>
              <motion.ul
                className="mt-8 space-y-5 list-none p-0"
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
                }}
              >
                {[
                  { icon: Globe2, title: 'Coverage', text: 'West Africa–focused with remote delivery for international teams and partners.' },
                  { icon: Users, title: 'Who you work with', text: 'Senior consultants and engineers—consistent faces from kickoff through remediation.' },
                  { icon: Clock, title: 'Response', text: 'We target initial responses within one business day for active engagements and critical follow-ups.' },
                ].map((row) => (
                  <motion.li
                    key={row.title}
                    variants={heroItem}
                    className="flex gap-4"
                    whileHover={{ x: 8 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  >
                    <motion.span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0EA5E9]"
                      whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    >
                      <row.icon className="w-5 h-5" strokeWidth={1.7} aria-hidden />
                    </motion.span>
                    <div>
                      <p className="font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>{row.title}</p>
                      <p className="mt-1 text-sm text-stone-600 leading-relaxed">{row.text}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            {/* Creative Delivery composition */}
            <motion.div
              initial={{ opacity: 0, x: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={viewport}
              transition={{ type: 'spring', stiffness: 85, damping: 17 }}
              className="relative h-[440px] lg:h-[500px] lg:sticky lg:top-32"
            >
              {/* Orbiting ring */}
              <motion.div
                aria-hidden
                className="absolute inset-4 rounded-[40%] border border-dashed border-[#F97316]/35"
                animate={{ rotate: 360 }}
                transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden
                className="absolute inset-10 rounded-[45%] border border-[#0EA5E9]/25"
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              />

              {/* Glow */}
              <motion.div
                aria-hidden
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-t from-[#F97316]/25 to-[#0EA5E9]/15 blur-3xl"
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Main image — hex-style clip */}
              <motion.div
                className="absolute inset-x-8 top-8 bottom-16 overflow-hidden shadow-2xl ring-1 ring-stone-200/70"
                style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                animate={{ y: [0, -8, 0], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.02 }}
              >
                <RemoteImage
                  src={aboutGalleryImages.consultation}
                  alt="Global delivery and collaboration"
                  className="w-full h-full object-cover scale-110"
                  fallbackSeed="Anmel Inc-about-delivery"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-stone-900/40 via-transparent to-[#0EA5E9]/20 pointer-events-none" />
              </motion.div>

              {/* Floating globe badge */}
              <motion.div
                className="absolute top-0 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-stone-200"
                animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.1 }}
              >
                <Globe2 className="w-7 h-7 text-[#0EA5E9]" strokeWidth={1.8} />
              </motion.div>

              {/* Location pin chip */}
              <motion.div
                className="absolute left-2 top-1/3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/90 backdrop-blur text-white shadow-lg ring-1 ring-white/10"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewport}
                transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
                animate={{ x: [0, 4, 0] }}
              >
                <MapPin className="w-4 h-4 text-[#F97316]" strokeWidth={2} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">HQ</p>
                  <p className="text-xs font-semibold">Monrovia, Liberia</p>
                </div>
              </motion.div>

              {/* Remote delivery chip */}
              <motion.div
                className="absolute right-0 bottom-20 px-4 py-3 rounded-2xl bg-white shadow-xl ring-1 ring-stone-200"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 0.55, type: 'spring', stiffness: 110 }}
                whileHover={{ y: -4, scale: 1.03 }}
              >
                <p className="text-2xl font-bold text-[#7C3AED]" style={{ fontFamily: 'var(--font-display)' }}>24h</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-stone-500 mt-0.5">Response target</p>
              </motion.div>

              {/* Bottom caption bar */}
              <motion.div
                className="absolute inset-x-10 bottom-0 px-5 py-3 rounded-xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-stone-200 flex items-center justify-between gap-3"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 0.65 }}
              >
                <span className="text-xs font-semibold text-stone-700">West Africa & remote-first</span>
                <motion.span
                  className="flex items-center gap-1 text-xs font-bold text-[#0EA5E9]"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Global reach <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey — premium timeline */}
      <section className="relative py-[var(--spacing-section)] overflow-hidden bg-stone-950 text-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <motion.div
            className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#0EA5E9]/20 blur-3xl"
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#7C3AED]/25 blur-3xl"
            animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.05, 1, 1.05] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-[#F97316]/15 blur-3xl"
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="mb-14 lg:mb-20 text-center lg:text-left lg:max-w-2xl"
          >
            <motion.span variants={heroItem} className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#64FFDA] font-semibold text-xs uppercase tracking-[0.22em]">
              <Sparkles className="w-3.5 h-3.5" /> Story
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              Our journey
            </motion.h2>
            <motion.p variants={heroItem} className="mt-4 text-stone-300 text-lg leading-relaxed">
              From a focused team in Monrovia to a trusted partner for enterprises three chapters of growth, one thread of excellence.
            </motion.p>
          </motion.div>

          {/* Desktop: horizontal premium timeline */}
          <div className="hidden lg:block relative pb-4">
            {/* central rail */}
            <div className="absolute left-[8%] right-[8%] top-[68px] h-[2px] -translate-y-1/2 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="grid grid-cols-3 gap-8 relative">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.year}
                    initial={{ opacity: 0, y: 48 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18, delay: i * 0.14 }}
                    className="relative pt-2"
                  >
                    {/* Year badge */}
                    <motion.div
                      className="mx-auto mb-7 flex h-[88px] w-[88px] items-center justify-center rounded-2xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-4 ring-stone-950 relative"
                      style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}aa)` }}
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ type: 'spring', stiffness: 360, damping: 16 }}
                    >
                      <motion.div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl"
                        style={{ boxShadow: `0 0 0 0 ${item.color}66` }}
                        animate={{ boxShadow: [`0 0 0 0 ${item.color}66`, `0 0 0 14px ${item.color}00`] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
                      />
                      <span className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{item.year}</span>
                    </motion.div>

                    {/* connector dot on rail */}
                    <div
                      className="absolute left-1/2 top-[68px] z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px] ring-stone-950 shadow-md"
                      style={{ backgroundColor: item.color }}
                    />

                    {/* Card */}
                    <motion.div
                      className="relative rounded-3xl bg-white/[0.04] backdrop-blur-xl p-7 border border-white/10 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.55)] overflow-hidden"
                      whileHover={{ y: -8, borderColor: `${item.color}88`, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
                    >
                      {/* gradient halo */}
                      <div
                        aria-hidden
                        className="absolute -top-32 -right-20 h-56 w-56 rounded-full blur-3xl opacity-30"
                        style={{ backgroundColor: item.color }}
                      />
                      {/* top accent bar */}
                      <div
                        className="absolute inset-x-7 top-0 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                      />

                      {/* Icon + title */}
                      <div className="relative flex items-center gap-3 mb-4">
                        <motion.div
                          className="flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-white/15"
                          style={{ background: `linear-gradient(135deg, ${item.color}33, ${item.color}11)`, color: item.color }}
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                        >
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                      </div>

                      {/* Metric chip */}
                      <div className="relative flex items-baseline gap-2 mb-4">
                        <span
                          className="text-3xl font-bold tabular-nums"
                          style={{ fontFamily: 'var(--font-display)', color: item.color }}
                        >
                          {item.metric}
                        </span>
                        <span className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.metricLabel}</span>
                      </div>

                      <p className="relative text-stone-300 leading-relaxed text-[14.5px]">{item.desc}</p>

                      {/* Highlights */}
                      <ul className="relative mt-5 space-y-2">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-sm text-stone-200">
                            <span
                              className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          {/* Mobile / tablet: vertical stack with animated rail */}
          <div className="lg:hidden relative pl-2">
            <div className="absolute left-[26px] top-4 bottom-4 w-[3px] rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="w-full h-full origin-top bg-gradient-to-b from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="space-y-10">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                    className="relative pl-16"
                  >
                    <motion.div
                      className="absolute left-0 top-2 flex h-[52px] w-[52px] items-center justify-center rounded-xl shadow-lg ring-4 ring-stone-950 z-10"
                      style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </motion.div>
                    <motion.div
                      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.55)]"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                        <span
                          className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ring-1"
                          style={{ color: item.color, borderColor: `${item.color}55`, backgroundColor: `${item.color}15` }}
                        >
                          {item.year}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold tabular-nums" style={{ color: item.color, fontFamily: 'var(--font-display)' }}>{item.metric}</span>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-stone-400">{item.metricLabel}</span>
                      </div>
                      <p className="text-stone-300 text-sm leading-relaxed">{item.desc}</p>
                      <ul className="mt-4 space-y-1.5">
                        {item.highlights.map((h) => (
                          <li key={h} className="flex items-start gap-2 text-xs text-stone-200">
                            <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology — Approach cards */}
      <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#E0F2FE]/60 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-[#EDE9FE]/50 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="mb-14"
          >
            <motion.span variants={heroItem} className="inline-block whitespace-nowrap text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              Approach
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              Our methodology
            </motion.h2>
            <motion.p variants={heroItem} className="mt-4 text-stone-600 max-w-2xl">
              A repeatable, security-first loop animated at every step so your program keeps pace with real risk.
            </motion.p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4">
            {methodologySteps.map((m, i) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.step}
                  initial={{ opacity: 0, y: 28, rotateX: -6 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 90, damping: 18 }}
                  className="group relative [perspective:1000px]"
                >
                  {/* gradient border glow */}
                  <div
                    className="absolute -inset-[1px] rounded-2xl opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${m.color}66, ${m.color}33, transparent)`,
                    }}
                  />
                  <div className="relative h-full rounded-2xl bg-stone-50/90 p-6 pt-8 text-center shadow-[var(--shadow-card)] ring-1 ring-stone-200/70 transition-all duration-300 group-hover:ring-2 group-hover:shadow-[0_24px_48px_-12px_rgba(15,23,42,0.15)] overflow-hidden">
                    {/* top accent bar */}
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                      style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}88, transparent)` }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
                    />
                    {/* shimmer on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <motion.span
                      className="absolute top-3 right-3 text-3xl font-bold text-stone-200/90 group-hover:text-stone-300/80 transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                      whileHover={{ scale: 1.05 }}
                    >
                      0{i + 1}
                    </motion.span>
                    <motion.div
                      className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner"
                      style={{
                        background: `linear-gradient(145deg, ${m.color}22, ${m.color}08)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6)`,
                      }}
                      whileHover={{ rotate: [0, -6, 6, 0], scale: 1.08 }}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className="w-7 h-7" style={{ color: m.color }} strokeWidth={1.75} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-stone-900 relative z-[1]" style={{ fontFamily: 'var(--font-display)' }}>{m.step}</h3>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed relative z-[1]">{m.desc}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-400 group-hover:opacity-100 transition-opacity relative z-[1]" style={{ color: m.color }}>
                      {m.hint}
                    </p>
                  </div>
                  {/* arrow connector desktop */}
                  {i < methodologySteps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 z-20 w-4 h-4 items-center justify-center -translate-y-1/2 translate-x-1/2" aria-hidden>
                      <motion.div
                        initial={{ opacity: 0, x: -4 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.35 + i * 0.1 }}
                      >
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#7C3AED] transition-colors" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="mt-14 text-center"
          >
            <MotionLink
              to="/services"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] font-semibold hover:bg-[#0EA5E9]/20 transition-colors"
            >
              See our services in detail
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </motion.span>
            </MotionLink>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-stone-900 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={viewport}
        >
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#F97316]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
        >
          <motion.h2 variants={heroItem} className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to strengthen your security?
          </motion.h2>
          <motion.p variants={heroItem} className="mt-4 text-stone-400">
            Tell us about your environment and goals. We’ll recommend the right starting point.
          </motion.p>
          <motion.div variants={heroItem} className="mt-8 flex justify-center">
            <MotionLink
              to="/contact"
              whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.45)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] shadow-lg shadow-orange-500/25 transition-colors"
            >
              Start a conversation
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </MotionLink>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
