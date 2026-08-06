import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  GraduationCap,
  Code2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

const pillars = [
  {
    id: 'education',
    title: 'Education Consultant',
    badge: 'Study Abroad & Scholarships',
    icon: GraduationCap,
    accent: '#2FA084',
    image: '/images/anmel_education_hero.png',
    headline: 'Unlock Global Academic Opportunities',
    desc: 'Expert guidance for international university admissions, 100% tuition scholarships, visa processing, and personalized student counseling worldwide.',
    stats: [
      { value: '500+', label: 'Partner Universities' },
      { value: '$5M+', label: 'Scholarships Secured' },
      { value: '98%', label: 'Visa Approval Rate' },
    ],
    ctaText: 'Explore Education Services',
    ctaLink: '/education-consultant',
  },
  {
    id: 'webdev',
    title: 'Web Development',
    badge: 'Full-Stack Software Engineering',
    icon: Code2,
    accent: '#5D1C6A',
    image: '/images/anmel_webdev_hero.png',
    headline: 'High-Performance Web & Mobile Apps',
    desc: 'Custom web application design, modern full-stack development, cloud deployment, and scalable digital architectures built for speed and security.',
    stats: [
      { value: '150+', label: 'Web Applications Built' },
      { value: '99.9%', label: 'Uptime & Speed Score' },
      { value: '24/7', label: 'Continuous Support' },
    ],
    ctaText: 'Explore Web Development',
    ctaLink: '/web-development',
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security Consultant',
    badge: 'Enterprise Digital Defense',
    icon: Shield,
    accent: '#0EA5E9',
    image: '/images/anmel_cybersecurity_hero.png',
    headline: 'Proactive Vulnerability & Risk Protection',
    desc: 'Application penetration testing, ISO 27001 / SOC 2 compliance readiness, continuous threat monitoring, and AI-assisted vulnerability scanners.',
    stats: [
      { value: '0', label: 'Unpatched Vulnerabilities' },
      { value: 'ISO 27001', label: 'Compliance Ready' },
      { value: 'Instant', label: 'Security Audits' },
    ],
    ctaText: 'Explore Cybersecurity',
    ctaLink: '/services',
  },
];

const generalStats = [
  { value: '10,000+', label: 'Students & Clients Empowered' },
  { value: '150+', label: 'Web & Security Projects' },
  { value: '$5M+', label: 'Scholarships Secured' },
  { value: '98%', label: 'Client & Student Satisfaction' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('education');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const currentPillar = pillars.find((p) => p.id === activeTab) || pillars[0];

  const handleSecurityCheck = (e) => {
    e.preventDefault();
    const raw = websiteUrl.trim();
    if (!raw) return;
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    navigate(`/application-security-checker?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="hero-dark relative min-h-screen flex items-center overflow-hidden pt-28 pb-20">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#5D1C6A]/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full bg-[#2FA084]/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[#0EA5E9]/15 blur-[110px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Top Company Badge */}
        <div className="flex justify-center lg:justify-start mb-6">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex flex-wrap items-center gap-2 bg-white/5 border border-white/12 text-white/90 px-4 py-2 rounded-full text-xs font-semibold tracking-wider backdrop-blur-md shadow-lg"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FA084] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FA084]" />
            </span>
            <span className="text-white font-bold">Anmel Inc</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">Education Consultant</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">Web Development</span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">Cyber Security Consultant</span>
          </motion.div>
        </div>

        {/* Main Headline */}
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
          <div className="lg:col-span-8">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight"
            >
              Empowering Global Growth Through{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2FA084] via-[#0EA5E9] to-[#9333EA]">
                Education, Web Dev & Security.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-base sm:text-lg text-white/75 leading-relaxed max-w-3xl"
            >
              Anmel Inc is a multi-disciplinary global enterprise. We guide students to international university degrees, engineer cutting-edge web applications, and protect digital assets with enterprise cybersecurity.
            </motion.p>
          </div>

          <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
            <Link to="/contact" className="btn-primary flex-1 sm:flex-initial justify-center text-sm py-3.5 px-6">
              Contact Anmel Experts
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <Link to="/about" className="btn-secondary flex-1 sm:flex-initial justify-center text-sm py-3.5 px-6">
              About Anmel
            </Link>
          </div>
        </div>

        {/* ── 3-PILLAR INTERACTIVE SHOWCASE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-white/12 bg-stone-950/70 backdrop-blur-xl shadow-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Pillar Tabs */}
          <div className="flex flex-wrap gap-3 pb-6 border-b border-white/10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = activeTab === pillar.id;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActiveTab(pillar.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-white/15 text-white border border-white/20 shadow-lg'
                      : 'bg-white/4 text-white/60 hover:bg-white/8 hover:text-white border border-transparent'
                  }`}
                  style={{
                    borderColor: isActive ? pillar.accent : 'transparent',
                  }}
                >
                  <span
                    className="p-1.5 rounded-lg text-white"
                    style={{ backgroundColor: pillar.accent }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <span>{pillar.title}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pillar.accent }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPillar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="mt-6 grid lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Details */}
              <div className="lg:col-span-6 space-y-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white"
                  style={{
                    backgroundColor: `${currentPillar.accent}33`,
                    color: currentPillar.accent,
                    border: `1px solid ${currentPillar.accent}55`,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {currentPillar.badge}
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {currentPillar.headline}
                </h2>

                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                  {currentPillar.desc}
                </p>

                {/* Pillar Micro Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {currentPillar.stats.map((st) => (
                    <div key={st.label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-white" style={{ color: currentPillar.accent }}>
                        {st.value}
                      </p>
                      <p className="text-[11px] text-white/50 font-medium mt-0.5">{st.label}</p>
                    </div>
                  ))}
                </div>

                {/* Specific Action Widgets based on Pillar */}
                {currentPillar.id === 'cybersecurity' ? (
                  <form onSubmit={handleSecurityCheck} className="pt-2">
                    <p className="text-white/80 text-xs font-semibold mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky" /> Instant Free Website Security Scan
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourdomain.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="flex-1 min-w-0 bg-white/8 text-white text-sm px-4 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-sky"
                      />
                      <button
                        type="submit"
                        className="bg-sky hover:bg-sky-light text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shrink-0"
                      >
                        Run Scan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Link
                      to={currentPillar.ctaLink}
                      className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl text-white transition shadow-lg"
                      style={{ backgroundColor: currentPillar.accent }}
                    >
                      {currentPillar.ctaText}
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </Link>
                    {currentPillar.id === 'education' && (
                      <Link
                        to="/student-application"
                        className="inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/15 transition"
                      >
                        Apply for Admission
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                    {currentPillar.id === 'webdev' && (
                      <Link
                        to="/contact?subject=Web+Development+Quote"
                        className="inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/15 transition"
                      >
                        Request Project Quote
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Right Pillar Hero Image */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                  <img
                    src={currentPillar.image}
                    alt={currentPillar.title}
                    className="w-full h-72 sm:h-80 lg:h-96 object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Anmel Pillar Excellence
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {currentPillar.title}
                      </span>
                    </div>
                    <Link
                      to={currentPillar.ctaLink}
                      className="p-2 rounded-lg text-white hover:scale-105 transition"
                      style={{ backgroundColor: currentPillar.accent }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* General Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/10 border border-white/10 rounded-2xl bg-white/3 overflow-hidden backdrop-blur-sm"
        >
          {generalStats.map((st) => (
            <div key={st.label} className="p-5 text-center hover:bg-white/5 transition">
              <p className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {st.value}
              </p>
              <p className="text-white/50 text-xs mt-1 font-medium">{st.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
