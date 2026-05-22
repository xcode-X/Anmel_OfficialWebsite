import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, ChevronRight, ShieldCheck, Users, Rocket,
  Headphones, LayoutGrid, Shield, Lock, FileCheck, Cloud, Activity,
  GraduationCap, MapPin, Clock, Award,
} from 'lucide-react';
import { getServices, getServiceBySlug } from '../lib/servicesData';
import { servicesHeroImage, capabilityImages } from '../lib/siteImages';
import RemoteImage from '../components/ui/RemoteImage';
import MotionLink from '../components/ui/MotionLink';
const viewport = { once: true, margin: '-60px' };

const iconMap = {
  'security-assessment': Shield,
  'secure-development': Lock,
  compliance: FileCheck,
  monitoring: Activity,
  'cloud-security': Cloud,
  training: GraduationCap,
};

const consultantStats = [
  { value: '150+', label: 'Assessments delivered' },
  { value: '40+', label: 'Enterprise clients' },
  { value: '4+', label: 'Years consulting' },
  { value: '24h', label: 'Typical response' },
];

const trustPoints = [
  { icon: Shield, title: 'Security first', desc: 'Offensive testing meets practical remediation—not slide decks.' },
  { icon: Users, title: 'Senior consultants', desc: 'You work with the people who run the assessment, not account layers.' },
  { icon: Rocket, title: 'Actionable output', desc: 'Prioritized findings your team can fix this sprint.' },
  { icon: Headphones, title: 'Ongoing support', desc: 'We stay through verification and retesting when you need us.' },
];

function ServiceOverviewCard({ service, idx, Icon }) {
  return (
    <motion.a
      href={`#${service.slug}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ delay: idx * 0.06, type: 'spring', stiffness: 90, damping: 18 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-stone-300/80 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <RemoteImage
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          fallbackSeed={`svc-card-${service.slug}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/10 to-transparent" />
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${service.color}, ${service.color}66)` }}
        />
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ background: `linear-gradient(145deg, ${service.color}, ${service.color}cc)` }}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
            {String(idx + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h3
          className="text-lg font-bold text-stone-900 group-hover:text-stone-800 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {service.title}
        </h3>
        <p className="mt-2.5 text-sm text-stone-600 leading-relaxed line-clamp-2">
          {service.shortDescription}
        </p>

        {service.features?.length > 0 && (
          <ul className="mt-4 space-y-2 flex-1">
            {service.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-stone-700 leading-snug">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <span className="line-clamp-1">{f.split('(')[0].trim()}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">
            View details
          </span>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:translate-x-0.5"
            style={{ backgroundColor: service.color }}
          >
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      <div
        className="h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: `linear-gradient(90deg, ${service.color}, ${service.color}44)` }}
      />
    </motion.a>
  );
}

function SectionHeading({ label, title, labelClass = 'text-purple', titleClass = 'text-stone-900', center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <span className={`inline-block whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] ${labelClass}`}>{label}</span>
      <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold whitespace-nowrap ${titleClass}`} style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const services = useMemo(() => getServices(), []);

  const handleSecurityCheck = (e) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    let targetUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;
    navigate(`/application-security-checker?url=${encodeURIComponent(targetUrl)}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-[#0A0C14] text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-[#5D1C6A]/25 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#3CD1AD] mb-6 whitespace-nowrap">
                <Shield className="w-3.5 h-3.5" strokeWidth={2.2} />
                Security Consultant · Monrovia & remote
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.1rem] font-bold leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Securing digital assets.
                <br />
                <span className="text-[#A78BFA]">Delivering</span>{' '}
                <span className="text-[#3CD1AD]">trusted solutions.</span>
              </h1>
              <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-lg">
                Expert cybersecurity consulting, digital forensics, and secure engineering for enterprises and organizations across West Africa and beyond.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <MotionLink
                  to="/contact"
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F59E0B] text-stone-900 font-bold hover:bg-[#FBBF24] transition-colors shadow-lg shadow-orange-900/30"
                >
                  Request consultant
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </MotionLink>
                <a
                  href="#services-list"
                  onClick={(e) => { e.preventDefault(); document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/25 font-semibold hover:bg-white/5 transition-colors"
                >
                  Our services
                  <LayoutGrid className="w-4 h-4" />
                </a>
              </div>

              <form onSubmit={handleSecurityCheck} className="mt-10 max-w-md">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3CD1AD]" />
                  Quick site check
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="yourcompany.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 min-w-0 bg-white/10 border border-white/15 text-white text-sm px-4 py-3 rounded-xl focus:border-[#3CD1AD] focus:outline-none placeholder:text-stone-500"
                  />
                  <button type="submit" className="bg-white text-stone-900 text-sm font-bold px-5 py-3 rounded-xl hover:bg-stone-100 transition shrink-0">
                    Check
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Creative hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative h-[380px] sm:h-[440px] lg:h-[480px]"
            >
              <motion.div
                aria-hidden
                className="absolute inset-6 rounded-[2rem] border border-dashed border-white/15"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-x-6 top-6 bottom-20 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                style={{ clipPath: 'polygon(0 0, 100% 4%, 100% 100%, 0 96%)' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <RemoteImage src={servicesHeroImage} alt="Security operations workspace" className="w-full h-full object-cover" loading="eager" fallbackSeed="svc-hero-main" />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0C14]/75 via-[#5D1C6A]/20 to-transparent" />
              </motion.div>
              <motion.div
                className="absolute bottom-12 left-0 w-[48%] rounded-xl overflow-hidden shadow-2xl ring-4 ring-[#0A0C14]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.04, y: -4 }}
              >
                <RemoteImage src={capabilityImages.pentest} alt="Penetration testing" className="w-full aspect-[4/3] object-cover" fallbackSeed="svc-hero-accent" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
              </motion.div>
              <motion.div
                className="absolute top-4 right-2 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur shadow-xl text-stone-900"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Certified</p>
                <p className="text-sm font-bold">OWASP · ISO aligned</p>
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-4 px-5 py-3 rounded-2xl bg-[#5D1C6A] shadow-xl ring-1 ring-white/10"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>98%</p>
                <p className="text-[10px] uppercase tracking-wider text-white/70">Client retention</p>
              </motion.div>
              <motion.div
                aria-hidden
                className="absolute top-1/3 right-8 w-14 h-14 rounded-2xl bg-[#2FA084]/90 flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <Shield className="w-7 h-7 text-white" strokeWidth={2} />
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-[#2FA084] via-[#5D1C6A] to-[#F59E0B]" aria-hidden />
      </section>

      {/* Stats */}
      <section className="py-12 bg-stone-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {consultantStats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ delay: i * 0.08 }}>
              <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</p>
              <p className="mt-1 text-sm text-stone-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service overview grid */}
      <section className="py-[var(--spacing-section)] bg-white" id="services-list">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Our services" title="Six ways we help you reduce real risk." labelClass="text-[#2FA084]" center />
          <p className="mt-4 text-center text-stone-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Every engagement is senior-led. Pick a starting point—or combine services into a program.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => {
              const Icon = iconMap[s.slug] || Shield;
              return (
                <ServiceOverviewCard key={s.slug} service={s} idx={idx} Icon={Icon} />
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed service sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {services.map((s, idx) => {
          const Icon = iconMap[s.slug] || Shield;
          const flip = idx % 2 === 1;
          return (
            <motion.section
              key={s.slug}
              id={s.slug}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              className="py-[var(--spacing-block)] border-b border-stone-200 last:border-0 scroll-mt-28"
            >
              <div className={`grid lg:grid-cols-2 gap-12 items-start ${flip ? 'lg:direction-rtl' : ''}`}>
                <div className={flip ? 'lg:order-2' : ''}>
                  <span className="inline-block whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em]" style={{ color: s.color }}>Service</span>
                  <h2 className="mt-2 text-3xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>{s.title}</h2>
                  <p className="mt-4 text-stone-600 leading-relaxed">{s.description}</p>
                  {s.idealFor && (
                    <p className="mt-4 text-sm text-stone-500 italic border-l-2 pl-4" style={{ borderColor: s.color }}>
                      Ideal for: {s.idealFor}
                    </p>
                  )}
                  <div className="mt-6 rounded-xl border border-stone-200/80 bg-stone-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Target outcome</p>
                    <p className="text-stone-700 text-sm leading-relaxed">{s.outcomes}</p>
                  </div>
                  {s.features?.length > 0 && (
                    <ul className="mt-6 grid sm:grid-cols-2 gap-2">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: s.color }} strokeWidth={2} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={`/services/${s.slug}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-colors" style={{ backgroundColor: s.color }}>
                      Full service page <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-50 transition">
                      Inquire
                    </Link>
                  </div>
                </div>
                <div className={`space-y-6 ${flip ? 'lg:order-1' : ''}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-[var(--shadow-card)] ring-1 ring-stone-200/80 group">
                    <RemoteImage
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      fallbackSeed={`svc-detail-${s.slug}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
                    <div
                      className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-xl px-3 py-2 bg-white/95 backdrop-blur-sm shadow-md"
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </span>
                      <span className="text-sm font-semibold text-stone-800">{s.title}</span>
                    </div>
                  </div>
                  {s.process?.length > 0 && (
                    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[var(--shadow-card)]">
                      <h3 className="font-bold text-stone-900 mb-5 flex items-center gap-2 whitespace-nowrap">
                        <Icon className="w-5 h-5" style={{ color: s.color }} strokeWidth={1.75} />
                        Methodology
                      </h3>
                      <div className="space-y-4 relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-100" aria-hidden />
                        {s.process.map((p) => (
                          <div key={p.step} className="flex gap-4 relative">
                            <span className="w-8 h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0 z-10" style={{ backgroundColor: s.color }}>{p.step}</span>
                            <div>
                              <span className="font-semibold text-stone-900 text-sm">{p.title}</span>
                              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{p.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Why choose us */}
      <section className="py-[var(--spacing-section)] bg-[#0A0C14] text-white relative overflow-hidden">
        <motion.div aria-hidden className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#5D1C6A]/20 blur-3xl" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading label="Why Anmel" title="Consulting that ships outcomes—not anxiety." labelClass="text-[#3CD1AD]" titleClass="text-white" center />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-[#2FA084]/20 flex items-center justify-center text-[#3CD1AD] mb-4">
                  <t.icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-white whitespace-nowrap">{t.title}</h3>
                <p className="mt-2 text-sm text-stone-400 leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-stone-400">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3CD1AD]" /> Monrovia, Liberia</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#3CD1AD]" /> Response within 24h</span>
            <span className="flex items-center gap-2"><Award className="w-4 h-4 text-[#3CD1AD]" /> Senior-led engagements</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-b-[50%] bg-purple-pale opacity-50 pointer-events-none" aria-hidden />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to strengthen your security?
          </h2>
          <p className="mt-4 text-stone-600">Tell us about your environment. We will recommend the right starting point—no obligation.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#F59E0B] text-stone-900 font-bold hover:bg-[#FBBF24] transition shadow-lg">
            Get a consultation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceDetailBody({ slug }) {
  const item = useMemo(() => getServiceBySlug(slug), [slug]);
  const notFound = !item;

  if (notFound) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>Service not found</h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">The service you are looking for does not exist.</p>
        <Link to="/services" className="mt-6 px-6 py-3 rounded-xl bg-[#2FA084] text-white font-semibold hover:opacity-90 transition">
          View all services
        </Link>
      </div>
    );
  }

  const lead = item.shortDescription?.trim() || '';
  const fullDescription = item.description?.trim() || '';
  const showOverview = fullDescription.length > 0 && (fullDescription !== lead || fullDescription.length > lead.length + 20);
  const Icon = iconMap[item.slug] || Shield;

  return (
    <div className="pt-28 bg-white">
      <section className="relative min-h-[min(420px,70vh)] overflow-hidden">
        <div className="absolute inset-0">
          <RemoteImage src={item.image} alt="" className="h-full w-full object-cover" loading="eager" fallbackSeed={`svc-hero-${slug}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-stone-950/70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(93,28,106,0.3),transparent)]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 flex flex-col justify-end min-h-[min(420px,70vh)]">
          <nav className="text-sm text-white/75" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li className="text-white/40" aria-hidden>/</li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li className="text-white/40" aria-hidden>/</li>
              <li className="text-white/95 font-medium truncate max-w-[min(100%,320px)]">{item.title}</li>
            </ol>
          </nav>
          <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200 whitespace-nowrap">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              Security consultant
            </div>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              {item.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {lead || fullDescription.slice(0, 220)}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3.5 text-sm font-semibold text-stone-900 shadow-lg hover:bg-[#FBBF24] transition">
                Discuss this service
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition">
                All services
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">
          <div className="space-y-14">
            {showOverview && (
              <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}>
                <h2 className="text-2xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>Overview</h2>
                <p className="mt-4 text-stone-600 leading-relaxed text-[17px]">{fullDescription}</p>
                {item.idealFor && <p className="mt-4 text-sm text-stone-500 italic">Best suited for: {item.idealFor}</p>}
              </motion.section>
            )}
            {item.outcomes && (
              <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] whitespace-nowrap">Target outcomes</h2>
                <div className="mt-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
                  <p className="text-stone-800 text-lg leading-relaxed italic">{item.outcomes}</p>
                </div>
              </motion.section>
            )}
            {item.features?.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}>
                <h2 className="text-2xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>What is included</h2>
                <ul className="mt-6 grid sm:grid-cols-2 gap-4">
                  {item.features.map((f, i) => (
                    <li key={i} className="flex gap-3 rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3.5 text-[15px] text-stone-700 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5D1C6A]" strokeWidth={2} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
            {item.process?.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport}>
                <h2 className="text-2xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>Methodology</h2>
                <div className="mt-6 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
                  <div className="relative space-y-8">
                    <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-200 via-stone-200 to-transparent" />
                    {item.process.map((p) => (
                      <div key={p.step} className="relative flex gap-4">
                        <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-xs font-bold text-white shadow-md">{p.step}</span>
                        <div className="pt-0.5">
                          <span className="font-semibold text-stone-900">{p.title}</span>
                          <p className="mt-1 text-sm text-stone-600 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}
          </div>
          <aside className="lg:sticky lg:top-32 space-y-6">
            <div className="rounded-2xl overflow-hidden aspect-video ring-1 ring-stone-200/80 shadow-[var(--shadow-card)]">
              <RemoteImage src={item.image} alt={item.title} className="w-full h-full object-cover" fallbackSeed={`svc-aside-${slug}`} />
            </div>
            <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-violet-50 via-white to-sky-50/40 p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>Ready to scope this?</h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Share your environment and constraints—we will tailor deliverables, timelines, and reporting to your team.
              </p>
              <Link to="/contact" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] py-3.5 text-sm font-semibold text-stone-900 shadow-lg hover:bg-[#FBBF24] transition">
                Get a consultation
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            <Link to="/services" className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:border-violet-200 hover:bg-violet-50/50 transition">
              <ChevronRight className="h-4 w-4 rotate-180" strokeWidth={2} />
              Back to all services
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  return <ServiceDetailBody key={slug} slug={slug} />;
}
