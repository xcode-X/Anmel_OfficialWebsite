import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  Lock,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const securityChecks = [
  { label: 'SSL / TLS Certificate', status: 'Secure', ok: true },
  { label: 'Security Headers', status: '3 Missing', ok: false },
  { label: 'Data Encryption', status: 'Enabled', ok: true },
  { label: 'Vulnerability Scan', status: 'Clean', ok: true },
];

const stats = [
  { value: '150+', label: 'Projects Delivered' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '24hr', label: 'Avg. Response' },
  { value: '12+', label: 'Industries Served' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleSecurityCheck = (e) => {
    e.preventDefault();
    const raw = websiteUrl.trim();
    if (!raw) return;
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    navigate(`/application-security-checker?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="hero-dark relative min-h-screen flex items-center overflow-hidden">
      {/* ── decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-purple/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-sky/12 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple/5 blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: copy ── */}
          <div>
            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-sky px-4 py-2 rounded-full text-xs font-semibold tracking-wider mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky" />
              </span>
              Trusted Cybersecurity Partner · Monrovia, Liberia
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-5xl sm:text-6xl lg:text-[64px] font-bold text-white leading-[1.04] tracking-tight"
            >
              Securing{' '}
              <span className="text-sky">Digital</span>{' '}
              Assets.
              <br />
              <span className="text-orange">Delivering</span>{' '}
              Trusted Solutions.
            </motion.h1>

            {/* description */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-6 text-base sm:text-lg text-white/65 leading-relaxed max-w-xl"
            >
              Expert cybersecurity consulting, digital forensics, and secure web development
              for enterprises across Liberia and beyond.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/contact" className="btn-primary">
                Get Free Consultation
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link to="/services" className="btn-secondary">
                Explore Services
              </Link>
            </motion.div>

            {/* trust pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {['ISO 27001', 'SOC 2', 'GDPR Compliant', 'PCI DSS'].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/50 bg-white/5 border border-white/8 px-3 py-1 rounded-full"
                >
                  <CheckCircle2 className="w-3 h-3 text-sky/70" strokeWidth={2.5} />
                  {badge}
                </span>
              ))}
            </motion.div>

            {/* security checker widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="mt-10 border-t border-white/10 pt-8 max-w-md"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-sky" strokeWidth={2} />
                <span className="text-white/90 text-sm font-semibold">Free Website Security Scan</span>
              </div>
              <p className="text-white/40 text-xs mb-3">Instant analysis — no sign-up required.</p>
              <form onSubmit={handleSecurityCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 min-w-0 bg-white/6 text-white text-sm px-4 py-3 rounded-xl border border-white/12 focus:border-sky/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/30"
                />
                <button
                  type="submit"
                  className="bg-sky hover:bg-sky-light text-white text-sm font-bold px-5 py-3 rounded-xl transition-all duration-200 shrink-0 shadow-lg shadow-sky/20"
                >
                  Scan
                </button>
              </form>
            </motion.div>
          </div>

          {/* ── RIGHT: security dashboard card ── */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[500px]">
            {/* main card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 60, damping: 14 }}
              className="relative w-full max-w-[400px] glass-dark rounded-3xl p-6 shadow-2xl"
            >
              {/* card header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider">Live Dashboard</p>
                  <p className="text-white font-bold text-base mt-0.5">Security Overview</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky/15 border border-sky/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-sky" strokeWidth={2} />
                </div>
              </div>

              {/* score ring */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-white/4 rounded-2xl border border-white/6">
                <div className="relative w-[72px] h-[72px] shrink-0">
                  <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5.5" />
                    <circle
                      cx="36" cy="36" r="28"
                      fill="none"
                      stroke="#2FA084"
                      strokeWidth="5.5"
                      strokeDasharray="175.9"
                      strokeDashoffset="31.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg leading-none">82</span>
                  </div>
                </div>
                <div>
                  <p className="text-sky font-semibold text-sm">Good Posture</p>
                  <p className="text-white/45 text-xs mt-1 leading-relaxed">
                    3 recommendations to strengthen your defences
                  </p>
                </div>
              </div>

              {/* check rows */}
              <div className="space-y-1">
                {securityChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {check.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-sky shrink-0" strokeWidth={2} />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange shrink-0" strokeWidth={2} />
                      )}
                      <span className="text-white/75 text-sm">{check.label}</span>
                    </div>
                    <span className={`text-xs font-semibold ${check.ok ? 'text-sky' : 'text-orange'}`}>
                      {check.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* card footer */}
              <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between">
                <span className="text-white/35 text-xs">Last scanned: just now</span>
                <Link
                  to="/application-security-checker"
                  className="text-xs font-semibold text-sky hover:text-sky-light transition-colors flex items-center gap-1"
                >
                  Full report <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                </Link>
              </div>
            </motion.div>

            {/* floating badge — top right */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.75, type: 'spring', stiffness: 80 }}
              className="absolute top-4 -right-6 glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-purple/25 flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-light" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white text-xs font-bold">ISO 27001</p>
                <p className="text-white/45 text-[10px]">Certified</p>
              </div>
            </motion.div>

            {/* floating badge — bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 80 }}
              className="absolute bottom-8 -left-6 glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-orange/15 flex items-center justify-center">
                <Activity className="w-4 h-4 text-orange" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white text-xs font-bold">24/7 Monitoring</p>
                <p className="text-white/45 text-[10px]">Active protection</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/8 border border-white/8 rounded-2xl overflow-hidden"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-5 text-center bg-white/3 hover:bg-white/5 transition-colors">
              <p className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </p>
              <p className="text-white/45 text-xs mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
