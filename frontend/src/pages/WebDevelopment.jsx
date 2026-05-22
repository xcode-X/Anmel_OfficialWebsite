import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, ChevronDown, Star, Code2, ExternalLink,
  Mail, Phone, MapPin, Github, Linkedin, Twitter, Quote, Sparkles,
} from 'lucide-react';
import api, { testimonialsApi } from '../lib/api';
import RemoteImage from '../components/ui/RemoteImage';
import MotionLink from '../components/ui/MotionLink';
import {
  webDevStats, webServices, featuredProjects, processSteps, technologies,
  pricingTiers, webDevFaqs, fallbackTestimonials, webDevHeroImage,
  webDevAboutPrimary, webDevAboutAccent,
} from '../lib/webDevData';

const viewport = { once: true, margin: '-60px' };

const accentStyles = {
  sky: { bar: 'bg-[#2FA084]', dot: 'bg-[#2FA084]', badge: 'bg-[#E6F7F3] text-[#2FA084]', avatar: 'linear-gradient(135deg, #2FA084, #3CD1AD)', hex: '#2FA084' },
  purple: { bar: 'bg-[#5D1C6A]', dot: 'bg-[#5D1C6A]', badge: 'bg-[#F9F2FB] text-[#5D1C6A]', avatar: 'linear-gradient(135deg, #5D1C6A, #8C2FA0)', hex: '#5D1C6A' },
  orange: { bar: 'bg-[#F59E0B]', dot: 'bg-[#F59E0B]', badge: 'bg-[#FEF3C7] text-[#D97706]', avatar: 'linear-gradient(135deg, #F59E0B, #FBBF24)', hex: '#F59E0B' },
};

function SectionLabel({ children, color = 'text-[#5D1C6A]' }) {
  return (
    <span className={`inline-block whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] ${color}`}>
      {children}
    </span>
  );
}

function SectionHeading({ label, title, labelColor, titleClassName = 'text-stone-900', align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <SectionLabel color={labelColor}>{label}</SectionLabel>
      <h2 className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold whitespace-nowrap ${titleClassName}`}>
        {title}
      </h2>
    </div>
  );
}

export default function WebDevelopment() {
  const [faqOpen, setFaqOpen] = useState(-1);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', subject: 'Web development project', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const apply = (d) => {
      const list = Array.isArray(d) && d.length > 0 ? d.slice(0, 3) : fallbackTestimonials;
      setTestimonials(list);
    };
    testimonialsApi.list().then(apply).catch(() => setTestimonials(fallbackTestimonials));
    return testimonialsApi.subscribe((rows) => apply(rows));
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    setFormError('');
    try {
      await api.post('/contact', form);
      setFormStatus('success');
      setForm({ name: '', email: '', company: '', phone: '', subject: 'Web development project', message: '' });
    } catch (err) {
      setFormStatus('error');
      setFormError(err.message || 'Something went wrong. Please try again.');
    }
  };

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <div className="pt-28 bg-white min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0C14] text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-[#5D1C6A]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#2FA084]/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#3CD1AD] mb-6">
                <Code2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                Web Development · Monrovia & remote
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.08] tracking-tight max-w-xl">
                Websites and apps that look sharp—and hold up under real traffic.
              </h1>
              <p className="mt-6 text-lg text-stone-300 leading-relaxed max-w-lg">
                We design and build for teams who care about speed, security, and maintainability. No template dumps. No disappearing after launch.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <MotionLink
                  to="#contact"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#F59E0B] text-stone-900 font-bold hover:bg-[#FBBF24] transition-colors shadow-lg shadow-orange-900/30"
                >
                  Start a project
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </MotionLink>
                <MotionLink
                  to="#portfolio"
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  See our work
                </MotionLink>
              </div>
              <p className="mt-6 text-sm text-stone-500">
                Typical response within one business day · Free scoping call
              </p>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative h-[340px] sm:h-[400px] lg:h-[440px]"
            >
              <motion.div
                aria-hidden
                className="absolute inset-4 rounded-3xl border border-dashed border-white/15"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-x-4 top-4 bottom-16 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                <RemoteImage
                  src={webDevHeroImage}
                  alt="Web development workspace"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fallbackSeed="webdev-hero"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0C14]/70 via-transparent to-[#5D1C6A]/30" />
                {/* Fake browser chrome — human touch */}
                <div className="absolute top-0 inset-x-0 flex items-center gap-1.5 px-4 py-3 bg-stone-900/80 backdrop-blur border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 flex-1 h-5 rounded-md bg-white/10 text-[10px] text-stone-400 flex items-center px-2 font-mono">
                    anmelinc.com/project
                  </span>
                </div>
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-6 px-5 py-3 rounded-xl bg-white text-stone-900 shadow-xl"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <p className="text-2xl font-bold text-[#2FA084]" style={{ fontFamily: 'var(--font-display)' }}>98%</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">On-time delivery</p>
              </motion.div>
              <motion.div
                className="absolute top-12 -left-2 px-4 py-2 rounded-lg bg-[#5D1C6A] text-white text-xs font-semibold shadow-lg"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                React · Node · Secure by default
              </motion.div>
            </motion.div>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-[#2FA084] via-[#5D1C6A] to-[#F59E0B]" aria-hidden />
      </section>

      {/* ── Stats ── */}
      <section className="py-12 bg-stone-900 border-b border-white/5" aria-label="Success metrics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {webDevStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: i * 0.08 }}
                className="text-center lg:text-left"
              >
                <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-stone-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-[var(--spacing-section)] bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <motion.div
              className="lg:col-span-5 order-2 lg:order-1"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
            >
              <SectionHeading label="About our web team" title="Built by engineers who also run security assessments." />
              <p className="mt-5 text-stone-600 leading-relaxed">
                Anmel Inc started in cybersecurity. That means our web projects ship with sane auth patterns, dependency hygiene, and performance budgets—not as afterthoughts.
              </p>
              <p className="mt-4 text-stone-600 leading-relaxed">
                We are a small senior-led studio in Monrovia working with startups, NGOs, and enterprise teams across West Africa and beyond. You talk to the people writing the code.
              </p>
              <ul className="mt-8 space-y-3">
                {['Weekly demos, not monthly status emails', 'Staging links before every release', 'Documentation your team can use'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-stone-700 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#2FA084] shrink-0 mt-0.5" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-[#5D1C6A] font-semibold hover:underline underline-offset-4">
                More about Anmel Inc
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              className="lg:col-span-7 order-1 lg:order-2 relative h-[380px] sm:h-[420px]"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewport}
            >
              <motion.div
                aria-hidden
                className="absolute -top-4 -left-4 w-32 h-32 rounded-full border-2 border-dashed border-[#2FA084]/40"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                aria-hidden
                className="absolute -bottom-6 right-0 w-48 h-48 rounded-full bg-[#5D1C6A]/15 blur-3xl"
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-x-8 top-4 bottom-16 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-stone-200/80"
                style={{ clipPath: 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.02 }}
              >
                <RemoteImage src={webDevAboutPrimary} alt="Developer writing code" className="w-full h-full object-cover" fallbackSeed="webdev-about-primary" />
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/45 via-transparent to-[#2FA084]/20" />
                <div className="absolute top-3 left-3 right-3 rounded-lg bg-stone-900/85 backdrop-blur px-3 py-2 font-mono text-[10px] sm:text-xs text-[#3CD1AD] border border-white/10">
                  <span className="text-[#F59E0B]">const</span> build = () =&gt; secure + fast;
                </div>
              </motion.div>
              <motion.div
                className="absolute bottom-8 left-0 w-[46%] rounded-xl overflow-hidden shadow-2xl ring-4 ring-white"
                initial={{ opacity: 0, y: 20, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                viewport={viewport}
                transition={{ delay: 0.3, type: 'spring', stiffness: 90 }}
                whileHover={{ rotate: 0, scale: 1.04, y: -4 }}
              >
                <RemoteImage src={webDevAboutAccent} alt="Web design and development workspace" className="w-full aspect-[4/3] object-cover" fallbackSeed="webdev-about-accent" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
              </motion.div>
              <motion.div
                className="absolute top-6 right-2 px-4 py-2 rounded-xl bg-white shadow-lg ring-1 ring-stone-200 flex items-center gap-2"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E34F26]" />
                  <span className="w-2 h-2 rounded-full bg-[#1572B6]" />
                  <span className="w-2 h-2 rounded-full bg-[#F7DF1E]" />
                </span>
                <span className="text-xs font-bold text-stone-800">HTML · CSS · JS</span>
              </motion.div>
              <motion.div
                className="absolute bottom-0 right-4 px-5 py-3 rounded-2xl bg-stone-900 text-white shadow-xl"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-xl font-bold text-[#3CD1AD]" style={{ fontFamily: 'var(--font-display)' }}>4+ yrs</p>
                <p className="text-[10px] uppercase tracking-wider text-stone-400">Shipping web products</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-[var(--spacing-section)] bg-white" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <SectionHeading label="Services" title="What we build—and how we think about it." labelColor="text-[#0EA5E9]" />
            <p className="text-stone-600 max-w-md lg:text-right text-sm leading-relaxed">
              Full-stack delivery from first wireframe to production deploy. Pick a lane or combine them.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 28, rotateX: -4 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={viewport}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 90, damping: 18 }}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-500"
                >
                  <div className="relative h-44 overflow-hidden">
                    <RemoteImage
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fallbackSeed={`svc-${idx}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/25 to-transparent" />
                    <motion.div
                      className="absolute top-4 left-4 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md bg-white/90 shadow-lg"
                      whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: service.color }} strokeWidth={1.75} />
                    </motion.div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                      style={{ backgroundColor: service.color }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-stone-900 whitespace-nowrap">{service.title}</h3>
                    <p className="mt-2 text-sm text-stone-600 leading-relaxed">{service.description}</p>
                    <ul className="mt-4 space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: service.color }} strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Portfolio ── */}
      <section className="py-[var(--spacing-section)] bg-stone-50" id="portfolio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <SectionHeading label="Featured work" title="Projects we are proud to put our name on." labelColor="text-[#F59E0B]" />
            <p className="mt-4 text-stone-600">
              A sample of recent builds. Client names anonymized where required—details available on request.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 lg:grid-rows-2 gap-5 lg:gap-6">
            {featuredProjects.map((project, idx) => (
              <motion.article
                key={project.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: idx * 0.1 }}
                className={`group relative rounded-2xl overflow-hidden bg-stone-900 min-h-[280px] ${project.span}`}
              >
                <RemoteImage
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  fallbackSeed={project.slug}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/50 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3CD1AD]">{project.category}</span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-white whitespace-nowrap">{project.title}</h3>
                  <p className="mt-2 text-sm text-stone-300 leading-relaxed max-w-md">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-stone-200 backdrop-blur">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-4 text-xs text-stone-400">
                      {Object.entries(project.metrics).map(([k, v]) => (
                        <span key={k}><strong className="text-white font-semibold">{v}</strong> {k}</span>
                      ))}
                    </div>
                    <motion.a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.04, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-stone-900 text-xs font-bold hover:bg-[#3CD1AD] hover:text-stone-900 transition-colors shadow-lg"
                    >
                      {project.liveLabel}
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </motion.a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 text-[#5D1C6A] font-semibold hover:underline underline-offset-4"
            >
              Browse full case studies
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Process — roadmap ── */}
      <section className="py-[var(--spacing-section)] bg-white overflow-hidden" id="process">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionHeading
              label="How we work"
              title="A process that respects your timeline and your team."
              align="center"
            />
          </div>

          {/* Desktop horizontal roadmap */}
          <div className="hidden lg:block relative pt-8 pb-4">
            <svg viewBox="0 0 960 80" preserveAspectRatio="none" className="absolute top-[52px] left-[8%] right-[8%] h-16 w-[84%] overflow-visible" aria-hidden>
              <motion.path
                d="M 0 40 Q 120 0, 240 40 T 480 40 T 720 40 T 960 40"
                fill="none"
                stroke="url(#roadGrad)"
                strokeWidth="3"
                strokeDasharray="8 6"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2FA084" />
                  <stop offset="50%" stopColor="#5D1C6A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>
            <div className="grid grid-cols-4 gap-6 relative">
              {processSteps.map((step, i) => {
                const Icon = step.icon;
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, y: isEven ? 20 : 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 80 }}
                    className={`relative ${isEven ? 'mt-0' : 'mt-16'}`}
                  >
                    <motion.div
                      className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ring-4 ring-white relative z-10"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)` }}
                      whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    >
                      <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                    </motion.div>
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-5 hover:shadow-[var(--shadow-card)] hover:border-stone-300 transition-all h-full">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>{step.num}</span>
                      <h3 className="mt-1 text-lg font-bold text-stone-900 whitespace-nowrap">{step.title}</h3>
                      <p className="mt-2 text-sm text-stone-600 leading-relaxed">{step.desc}</p>
                      <p className="mt-3 text-[11px] font-semibold text-stone-500">{step.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Mobile / tablet vertical roadmap */}
          <div className="lg:hidden relative max-w-lg mx-auto pl-2">
            <div className="absolute left-[26px] top-4 bottom-4 w-[3px] rounded-full bg-stone-200 overflow-hidden">
              <motion.div
                className="w-full h-full origin-top bg-gradient-to-b from-[#2FA084] via-[#5D1C6A] to-[#F59E0B]"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="space-y-10">
              {processSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-16"
                  >
                    <motion.div
                      className="absolute left-0 top-1 flex h-[52px] w-[52px] items-center justify-center rounded-xl shadow-md ring-4 ring-white z-10"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}
                      whileHover={{ scale: 1.08 }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </motion.div>
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50 p-5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: step.color }}>{step.num} · {step.title}</span>
                      <p className="mt-2 text-sm text-stone-600 leading-relaxed">{step.desc}</p>
                      <p className="mt-3 text-[11px] font-semibold text-stone-500">{step.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Technologies — colorful stack ── */}
      <section className="py-[var(--spacing-section)] bg-[#0A0C14] text-white relative overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#5D1C6A]/20 blur-3xl"
          animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading label="Stack" title="Tools we reach for every week." labelColor="text-[#3CD1AD]" titleClassName="text-white" />
              <p className="mt-4 text-stone-400 leading-relaxed max-w-md">
                From HTML and CSS foundations to React and cloud deploy—we pick proven tech unless your problem genuinely needs something else.
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {technologies.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 14 }}
                  whileHover={{ y: -6, scale: 1.08, rotate: [0, -3, 3, 0] }}
                  className="group rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm text-center cursor-default"
                >
                  <motion.div
                    className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-[10px] font-black tracking-tight shadow-lg"
                    style={{ backgroundColor: tech.bg, color: tech.fg }}
                    animate={{ boxShadow: [`0 4px 14px ${tech.bg}44`, `0 8px 24px ${tech.bg}66`, `0 4px 14px ${tech.bg}44`] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  >
                    {tech.abbr}
                  </motion.div>
                  <p className="font-semibold text-xs text-white leading-tight">{tech.name}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5 group-hover:text-stone-400 transition-colors">{tech.category}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials — redesigned ── */}
      <section className="py-[var(--spacing-section)] bg-stone-50 relative overflow-hidden" id="testimonials">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#F9F2FB] opacity-60 blur-3xl pointer-events-none" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mb-12">
            <SectionHeading label="Client feedback" title="What clients say after launch." labelColor="text-[#5D1C6A]" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {displayTestimonials.map((t, i) => {
              const accentKey = t.accent || ['sky', 'purple', 'orange'][i % 3];
              const style = accentStyles[accentKey] || accentStyles.sky;
              const initials = t.name ? t.name.split(' ').map((w) => w[0]).join('').slice(0, 2) : '?';
              return (
                <motion.article
                  key={t._id || t.name || i}
                  initial={{ opacity: 0, y: 28, rotate: i === 1 ? 0 : i === 0 ? -1 : 1 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={viewport}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 90 }}
                  whileHover={{ y: -6 }}
                  className="relative rounded-3xl overflow-hidden bg-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] ring-1 ring-stone-200/80 flex flex-col"
                >
                  <div className="h-2 w-full" style={{ background: style.avatar }} />
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <Quote className="w-10 h-10 shrink-0 opacity-20" style={{ color: style.hex }} strokeWidth={1.5} />
                      <div className="flex gap-0.5" aria-label={`${t.rating || 5} out of 5 stars`}>
                        {[...Array(t.rating || 5)].map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" strokeWidth={0} />
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-stone-700 text-[15px] leading-relaxed flex-1">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    {t.outcome && (
                      <div className={`mt-5 inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${style.badge}`}>
                        <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                        {t.outcome}
                      </div>
                    )}
                    <footer className="mt-6 pt-5 border-t border-dashed border-stone-200 flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
                        style={{ background: style.avatar }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <cite className="not-italic font-bold text-stone-900 text-sm block truncate">{t.name}</cite>
                        <p className="text-xs text-stone-500 truncate">{t.role}</p>
                        {t.company && <p className="text-xs font-medium text-stone-600 truncate">{t.company}</p>}
                      </div>
                    </footer>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-[var(--spacing-section)] bg-stone-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <SectionHeading label="Pricing" title="Clear starting points—not hidden fees." labelColor="text-[#0EA5E9]" align="center" />
            <p className="mt-4 text-stone-600 text-sm">
              Every project is scoped after discovery. These ranges help you budget before we talk.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 flex flex-col ${
                  tier.highlighted
                    ? 'bg-[#0A0C14] text-white ring-2 ring-[#2FA084] shadow-xl scale-[1.02]'
                    : 'bg-white border border-stone-200/90 shadow-[var(--shadow-card)]'
                }`}
              >
                <h3 className="text-lg font-bold">{tier.name}</h3>
                <p className={`mt-2 text-3xl font-bold ${tier.highlighted ? 'text-[#3CD1AD]' : 'text-stone-900'}`} style={{ fontFamily: 'var(--font-display)' }}>
                  {tier.price}
                </p>
                <p className={`mt-1 text-xs ${tier.highlighted ? 'text-stone-400' : 'text-stone-500'}`}>{tier.period}</p>
                <p className={`mt-4 text-sm leading-relaxed ${tier.highlighted ? 'text-stone-300' : 'text-stone-600'}`}>
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${tier.highlighted ? 'text-stone-200' : 'text-stone-700'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${tier.highlighted ? 'text-[#3CD1AD]' : 'text-[#2FA084]'}`} strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="#contact"
                  className={`mt-8 block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    tier.highlighted
                      ? 'bg-[#F59E0B] text-stone-900 hover:bg-[#FBBF24]'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-[var(--spacing-section)] bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionHeading label="FAQ" title="Questions we get before kickoff." labelColor="text-[#F59E0B]" align="center" />
          </div>
          <div className="space-y-3">
            {webDevFaqs.map((item, i) => {
              const isOpen = faqOpen === i;
              return (
                <div key={item.q} className="rounded-xl border border-stone-200/90 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-semibold text-stone-900 hover:bg-stone-50 transition"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base">{item.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-[#5D1C6A] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="py-16 bg-gradient-to-br from-[#5D1C6A] to-[#3d1248] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #2FA084 0%, transparent 50%)' }} aria-hidden />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold whitespace-nowrap">
            Have a brief? Send it over—we will tell you honestly if we are a fit.
          </h2>
          <p className="mt-4 text-stone-200 max-w-xl mx-auto">
            No sales pressure. A 30-minute call to understand scope, timeline, and budget range.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="#contact" className="px-8 py-4 rounded-xl bg-[#F59E0B] text-stone-900 font-bold hover:bg-[#FBBF24] transition-colors">
              Get a project estimate
            </Link>
            <Link to="/case-studies" className="px-8 py-4 rounded-xl border border-white/30 font-semibold hover:bg-white/10 transition-colors">
              View case studies
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="py-[var(--spacing-section)] bg-stone-50" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14">
            <div>
              <SectionHeading label="Contact" title="Tell us what you are building." />
              <p className="mt-4 text-stone-600 leading-relaxed">
                Share your idea, timeline, and any links you have. We reply within one business day with next steps.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3 text-stone-700">
                  <Mail className="w-5 h-5 text-[#2FA084]" strokeWidth={1.75} />
                  <a href="mailto:contact@anmelinc.com" className="hover:text-[#5D1C6A] transition">contact@anmelinc.com</a>
                </li>
                <li className="flex items-center gap-3 text-stone-700">
                  <MapPin className="w-5 h-5 text-[#2FA084]" strokeWidth={1.75} />
                  Monrovia, Liberia · Remote worldwide
                </li>
                <li className="flex items-center gap-3 text-stone-700">
                  <Phone className="w-5 h-5 text-[#2FA084]" strokeWidth={1.75} />
                  Response within 24 hours
                </li>
              </ul>
              <div className="mt-8 flex gap-3">
                {[
                  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                  { icon: Github, href: 'https://github.com', label: 'GitHub' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:text-[#5D1C6A] hover:border-[#5D1C6A]/30 transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              className="rounded-2xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wd-name" className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
                  <input id="wd-name" name="name" required value={form.name} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 outline-none transition text-sm" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="wd-email" className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                  <input id="wd-email" name="email" type="email" required value={form.email} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 outline-none transition text-sm" placeholder="you@company.com" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="wd-company" className="block text-sm font-medium text-stone-700 mb-1.5">Company</label>
                  <input id="wd-company" name="company" value={form.company} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 outline-none transition text-sm" placeholder="Company name" />
                </div>
                <div>
                  <label htmlFor="wd-phone" className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                  <input id="wd-phone" name="phone" type="tel" value={form.phone} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 outline-none transition text-sm" placeholder="+231 ..." />
                </div>
              </div>
              <div>
                <label htmlFor="wd-message" className="block text-sm font-medium text-stone-700 mb-1.5">Project details *</label>
                <textarea id="wd-message" name="message" required rows={4} value={form.message} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-[#2FA084] focus:ring-2 focus:ring-[#2FA084]/20 outline-none transition resize-none text-sm" placeholder="What are you building? Timeline? Budget range?" />
              </div>
              <input type="hidden" name="subject" value={form.subject} />
              {formStatus === 'success' && <p className="text-[#2FA084] font-semibold text-sm">Thanks—we will be in touch soon.</p>}
              {formStatus === 'error' && <p className="text-red-600 text-sm">{formError}</p>}
              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F59E0B] text-stone-900 font-bold hover:bg-[#FBBF24] disabled:opacity-50 transition shadow-md"
              >
                {formStatus === 'sending' ? 'Sending…' : 'Send project inquiry'}
              </button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ── Page footer strip (links before global footer) ── */}
      <section className="py-10 bg-[#0A0C14] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <p className="text-stone-400 text-sm max-w-md">
              Anmel Inc — secure web development from Monrovia. Part of our broader cybersecurity practice.
            </p>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Web development page links">
              {[
                { to: '/about', label: 'About' },
                { to: '/services', label: 'Security services' },
                { to: '/case-studies', label: 'Portfolio' },
                { to: '/contact', label: 'Contact' },
                { to: '/education?track=web-development', label: 'Web dev courses' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="text-stone-400 hover:text-[#3CD1AD] transition">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}
