import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Shield, Handshake, BarChart3, Search, PencilRuler, Cog, Activity, Globe2, Users, Clock } from 'lucide-react';
import { aboutTeamImage, aboutGalleryImages } from '../lib/siteImages';
import RemoteImage from '../components/ui/RemoteImage';

const MotionLink = motion(Link);

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
  { year: '2020', title: 'Foundation', desc: 'Anmel Inc was founded in Monrovia with a focus on secure web engineering and helping local businesses harden their digital infrastructure. Our first engagements centered on application security and secure deployment practices.', color: '#0EA5E9' },
  { year: '2022', title: 'Enterprise expansion', desc: 'We launched formal enterprise security assessment and compliance readiness services. We supported our first financial and healthcare clients through gap assessments and remediation roadmaps.', color: '#7C3AED' },
  { year: '2024', title: 'Regional leader', desc: 'Recognized as a leading cybersecurity partner across the region, we now serve clients in multiple sectors with end-to-end security programs, from discovery through ongoing monitoring and defense.', color: '#F97316' },
];

const values = [
  { title: 'Mission', text: 'To empower organizations with intelligent security solutions that protect data, build trust, and enable growth. We believe strong security is a business enabler, not a bottleneck.', color: '#7C3AED', icon: Target },
  { title: 'Vision', text: 'A world where every digital infrastructure is resilient, compliant, and engineered for security by default. We work toward that future one engagement at a time.', color: '#0EA5E9', icon: Eye },
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
      {/* Hero — full impact */}
      <section className="relative overflow-hidden">
        <motion.div
          className="h-1 w-full bg-gradient-to-r from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div
              className="max-w-xl"
              variants={heroContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.span variants={heroItem} className="inline-block text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em] mb-4">
                About Anmel Inc
              </motion.span>
              <motion.h1 variants={heroItem} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.08] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Security Intelligence.{' '}
                <span className="text-[#7C3AED]">Engineering Excellence.</span>
              </motion.h1>
              <motion.p variants={heroItem} className="mt-6 text-lg text-stone-600 leading-relaxed">
                We are a cybersecurity and secure web engineering company based in Monrovia, Liberia. Our team combines deep technical expertise with a commitment to protecting the digital assets of businesses worldwide—whether you are a startup, a regulated enterprise, or a government body.
              </motion.p>
              <motion.p variants={heroItem} className="mt-4 text-stone-600 leading-relaxed">
                We don’t just point out risks; we help you fix them, document them, and maintain them. That’s why our clients stay with us for the long term.
              </motion.p>
              <motion.div variants={heroItem}>
                <MotionLink
                  to="/contact"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] shadow-lg shadow-orange-200/40 transition-colors"
                >
                  Get in touch
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </MotionLink>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 28 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#7C3AED]/20 blur-sm" aria-hidden />
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] max-h-[420px]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <RemoteImage
                  src={aboutTeamImage}
                  alt="Anmel Inc team collaboration"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fallbackSeed="Anmel Inc-about-hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent pointer-events-none" />
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
              <motion.span variants={heroItem} className="inline-block text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em]">
                Who we are
              </motion.span>
              <motion.h2 variants={heroItem} className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
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
            <motion.div
              initial={{ opacity: 0, x: 28, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={viewport}
              transition={{ type: 'spring', stiffness: 90, damping: 17 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.35 } }}
              className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-stone-200/70 aspect-[4/3]"
            >
              <RemoteImage
                src={aboutGalleryImages.collaboration}
                alt="Team collaborating on security architecture"
                className="w-full h-full object-cover"
                fallbackSeed="Anmel Inc-about-collab"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/25 to-transparent pointer-events-none" />
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
            <motion.span variants={heroItem} className="inline-block text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              Purpose
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Mission & Vision
            </motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 32, rotateX: -6 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 85, damping: 17 }}
                  whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="group relative rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300"
                >
                  <motion.div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-2xl origin-top"
                    style={{ backgroundColor: v.color }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="p-8 pl-10">
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${v.color}18` }}
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                      transition={{ duration: 0.45 }}
                    >
                      <Icon className="w-7 h-7" style={{ color: v.color }} strokeWidth={1.8} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)', color: v.color }}>{v.title}</h3>
                    <p className="mt-4 text-stone-600 leading-relaxed">{v.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Photo gallery */}
      <section className="py-[var(--spacing-section)] bg-stone-100/80 border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <motion.span variants={heroItem} className="inline-block text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              In the field
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-3 text-2xl sm:text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              How engagements look day to day
            </motion.h2>
            <motion.p variants={heroItem} className="mt-3 text-stone-600">
              Workshops, architecture reviews, and hands-on testing—documented so your teams can act without guesswork.
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { src: aboutGalleryImages.operations, alt: 'Security operations and monitoring context', seed: 'about-ops' },
              { src: aboutGalleryImages.consultation, alt: 'Consultation and working session', seed: 'about-consult' },
              { src: aboutGalleryImages.collaboration, alt: 'Collaborative planning', seed: 'about-team' },
            ].map((item, i) => (
              <motion.div
                key={item.seed}
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={viewport}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 90, damping: 16 }}
                whileHover={{ y: -10, scale: 1.02, transition: { type: 'spring', stiffness: 350, damping: 18 } }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-[var(--shadow-card)] ring-1 ring-stone-200/80"
              >
                <RemoteImage src={item.src} alt={item.alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" fallbackSeed={item.seed} />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent pointer-events-none"
                  initial={{ opacity: 0.6 }}
                  whileHover={{ opacity: 0.85 }}
                />
              </motion.div>
            ))}
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
            <motion.span variants={heroItem} className="inline-block text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">
              Values
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
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
              <motion.span variants={heroItem} className="inline-block text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">
                Delivery
              </motion.span>
              <motion.h2 variants={heroItem} className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
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
            <motion.div
              initial={{ opacity: 0, x: 32, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={viewport}
              transition={{ type: 'spring', stiffness: 85, damping: 17 }}
              whileHover={{ scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-stone-200/70 aspect-[4/3] lg:sticky lg:top-32"
            >
              <RemoteImage
                src={aboutGalleryImages.operations}
                alt="Security operations environment"
                className="w-full h-full object-cover"
                fallbackSeed="Anmel Inc-about-ops"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/35 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey — creative timeline */}
      <section className="relative py-[var(--spacing-section)] overflow-hidden bg-gradient-to-b from-stone-100 via-white to-stone-50">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#0EA5E9]/10 blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#7C3AED]/10 blur-3xl"
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1.05, 1, 1.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="mb-12 lg:mb-16 text-center lg:text-left"
          >
            <motion.span variants={heroItem} className="inline-block text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em]">
              Story
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Our journey
            </motion.h2>
            <motion.p variants={heroItem} className="mt-4 text-stone-600 max-w-2xl mx-auto lg:mx-0 text-lg">
              From a focused team in Monrovia to a trusted partner for enterprises—three chapters of growth, one thread of excellence.
            </motion.p>
          </motion.div>

          {/* Desktop: horizontal path */}
          <div className="hidden lg:block relative pb-8">
            <div className="absolute left-[8%] right-[8%] top-[53px] h-[3px] -translate-y-1/2 rounded-full overflow-hidden bg-stone-200/80">
              <motion.div
                className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="grid grid-cols-3 gap-6 relative">
              {timeline.map((item, i) => (
                <motion.article
                  key={item.year}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, delay: i * 0.12 }}
                  className="relative pt-4"
                >
                  <motion.div
                    className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-2xl shadow-lg ring-4 ring-white"
                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
                    whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{item.year}</span>
                  </motion.div>
                  <div className="absolute left-1/2 top-[53px] z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md" style={{ backgroundColor: item.color }} />
                  <motion.div
                    className="relative rounded-3xl bg-white/90 p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm border border-stone-200/60"
                    whileHover={{ y: -6, boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.18)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  >
                    <div
                      className="absolute inset-x-6 top-0 h-1 rounded-full opacity-90"
                      style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                    />
                    <h3 className="mt-2 text-xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                    <p className="mt-4 text-stone-600 leading-relaxed text-[15px]">{item.desc}</p>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Mobile / tablet: vertical stack with animated rail */}
          <div className="lg:hidden relative pl-2">
            <div className="absolute left-[22px] top-3 bottom-3 w-[3px] rounded-full bg-stone-200 overflow-hidden">
              <motion.div
                className="w-full h-full origin-top bg-gradient-to-b from-[#0EA5E9] via-[#7C3AED] to-[#F97316]"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                  className="relative pl-14"
                >
                  <motion.div
                    className="absolute left-0 top-2 flex h-11 w-11 items-center justify-center rounded-xl shadow-md ring-2 ring-white z-10"
                    style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-xs font-bold text-white tabular-nums">{item.year}</span>
                  </motion.div>
                  <motion.div
                    className="rounded-2xl border border-stone-200/80 bg-white/95 p-6 shadow-[var(--shadow-card)] backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>{item.title}</h3>
                    <p className="mt-3 text-stone-600 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                </motion.div>
              ))}
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
            <motion.span variants={heroItem} className="inline-block text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">
              Approach
            </motion.span>
            <motion.h2 variants={heroItem} className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Our methodology
            </motion.h2>
            <motion.p variants={heroItem} className="mt-4 text-stone-600 max-w-2xl">
              A repeatable, security-first loop—animated at every step so your program keeps pace with real risk.
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
          <motion.h2 variants={heroItem} className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
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
