import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import { publicApi } from '../../lib/api';
import { deferIdle } from '../../lib/deferIdle';
import { getServices } from '../../lib/servicesData';
import { getServiceNavPreviewImage, educationHeroImage, getCourseHeroImage, servicesHeroImage } from '../../lib/siteImages';
import RemoteImage from '../ui/RemoteImage';
import logoAnmel from '../../images/logo_anmel_transparent.png';

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/web-development', label: 'Web Development' },
  { to: '/education-consultant', label: 'Education Consultant' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/blog', label: 'Blog' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesPreviewSlug, setServicesPreviewSlug] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [educationOpen, setEducationOpen] = useState(false);
  const [educationPreviewSlug, setEducationPreviewSlug] = useState(null);

  const navServices = useMemo(() => getServices(), []);

  const navCourses = useMemo(() => coursesList, [coursesList]);

  /** On light pages, always use solid bar + dark links. On home only, white links until scroll. */
  const navSolid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      publicApi.courses().then((d) => { if (!cancelled) setCoursesList(Array.isArray(d) ? d : []); }).catch(() => { });
    }, 400);
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);


  const previewCourse = educationPreviewSlug
    ? navCourses.find((c) => c.slug === educationPreviewSlug)
    : null;
  const educationPreviewCaption = previewCourse?.shortDescription?.trim() || '';

  const previewActiveService = servicesPreviewSlug
    ? navServices.find((x) => x.slug === servicesPreviewSlug)
    : null;
  const previewCaption =
    previewActiveService?.shortDescription?.trim()
    || (typeof previewActiveService?.description === 'string' && previewActiveService.description.length > 0
      ? (previewActiveService.description.length > 120
        ? `${previewActiveService.description.slice(0, 118)}…`
        : previewActiveService.description)
      : '');

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ${navSolid
          ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm border-b border-stone-200/70'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoAnmel} alt="Anmel Inc" className={`h-12 sm:h-14 md:h-16 w-auto object-contain transition-all`} />
          </Link>

          <nav className="hidden xl:flex items-center gap-5 overflow-visible">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Link to="/about" className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform`}>
                About
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Link to="/web-development" className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform`}>
                Web Development
              </Link>
            </motion.div>
            <div
              className="relative z-[60]"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => {
                setServicesOpen(false);
                setServicesPreviewSlug(null);
              }}
            >
              <Link
                to="/services"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform inline-flex items-center gap-0.5`}
              >
                Security Consultant
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
              </Link>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-[70] w-[min(580px,calc(100vw-1.5rem))] pt-3"
                  >
                    {/* Bridge: keeps pointer inside trigger zone between label and panel */}
                    <div className="absolute inset-x-0 top-0 h-3 -translate-y-full" aria-hidden />
                    <div className="rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-[0_24px_48px_-12px_rgba(93,28,106,0.16),0_0_0_1px_rgba(255,255,255,0.8)_inset] flex min-h-[280px] flex-col sm:min-h-[300px] sm:flex-row">
                      <div className="relative flex-1 min-w-0 bg-gradient-to-br from-purple-pale via-white to-sky-pale/40 p-5 sm:p-6">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-purple/15 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-sky/10 blur-2xl" />
                        <div className="relative">
                          <div onMouseEnter={() => setServicesPreviewSlug(null)}>
                            <div className="flex items-center gap-2 text-purple">
                              <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} />
                              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Solutions</span>
                            </div>
                            <h3 className="mt-2 text-lg font-bold tracking-tight text-stone-900 sm:text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                              Explore our services
                            </h3>
                            <p className="mt-1 max-w-sm text-sm leading-relaxed text-stone-600">
                              From assessments to cloud hardening — pick a track or see everything in one place.
                            </p>
                            <Link
                              to="/services"
                              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-purple)] transition hover:bg-purple-light"
                              onClick={() => setServicesOpen(false)}
                            >
                              All services
                              <ArrowRight className="h-4 w-4" strokeWidth={2} />
                            </Link>
                          </div>
                          <ul className="mt-5 max-h-[min(340px,58vh)] space-y-1.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(167,139,250,0.5)_transparent]">
                            {navServices.map((s) => {
                              const desc = typeof s.description === 'string' ? s.description : '';
                              const blurb = s.shortDescription
                                || (desc.length > 110 ? `${desc.slice(0, 108)}…` : desc);
                              return (
                                <li key={s.slug}>
                                  <Link
                                    to={`/services/${s.slug}`}
                                    className="group flex items-start gap-3 rounded-xl border border-stone-200/60 bg-white/70 px-3 py-2.5 shadow-sm transition hover:border-purple/30 hover:bg-white hover:shadow-md hover:shadow-purple/8"
                                    onMouseEnter={() => setServicesPreviewSlug(s.slug)}
                                    onClick={() => setServicesOpen(false)}
                                  >
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-pale text-purple ring-1 ring-purple/15">
                                      <ChevronRight className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2.5} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-sm font-semibold text-stone-900 group-hover:text-purple">{s.title}</span>
                                      {blurb ? (
                                        <span className="mt-0.5 block text-xs leading-snug text-stone-500 line-clamp-2">{blurb}</span>
                                      ) : null}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                      <div className="relative w-full shrink-0 overflow-hidden sm:w-[200px] lg:w-[220px]">
                        <div className="relative h-full min-h-[200px] sm:absolute sm:inset-0 sm:min-h-0">
                          <AnimatePresence initial={false}>
                            <motion.div
                              key={servicesPreviewSlug ?? 'default'}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute inset-0"
                            >
                              <RemoteImage
                                src={getServiceNavPreviewImage(servicesPreviewSlug)}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                                fallbackSeed={`nav-svc-${servicesPreviewSlug || 'all'}`}
                              />
                            </motion.div>
                          </AnimatePresence>
                          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-purple/90 via-purple/20 to-transparent sm:bg-gradient-to-l" />
                          <div className="absolute inset-x-0 bottom-0 z-[2] p-4 text-center sm:text-left">
                            <AnimatePresence initial={false} mode="wait">
                              <motion.div
                                key={servicesPreviewSlug ?? 'default'}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="flex min-h-[6.25rem] flex-col justify-end"
                              >
                                {servicesPreviewSlug ? (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">Preview</p>
                                    <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm">
                                      {previewActiveService?.title || 'Service'}
                                    </p>
                                    {previewCaption ? (
                                      <p className="mt-1 line-clamp-3 text-xs leading-snug text-white/85">{previewCaption}</p>
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Anmel Inc</p>
                                    <p className="mt-1 text-sm font-semibold leading-snug text-white drop-shadow-sm">
                                      Security that scales with you
                                    </p>
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Link to="/education-consultant" className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform`}>
                Education Consultant
              </Link>
            </motion.div>
            <div
              className="relative z-[60]"
              onMouseEnter={() => setEducationOpen(true)}
              onMouseLeave={() => {
                setEducationOpen(false);
                setEducationPreviewSlug(null);
              }}
            >
              <Link
                to="/education"
                aria-expanded={educationOpen}
                aria-haspopup="true"
                className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform inline-flex items-center gap-0.5`}
              >
                Academy
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${educationOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
              </Link>
              <AnimatePresence>
                {educationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-[70] w-[min(640px,calc(100vw-1.5rem))] pt-3"
                  >
                    <div className="absolute inset-x-0 top-0 h-3 -translate-y-full" aria-hidden />
                    <div className="rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-[0_24px_48px_-12px_rgba(47,160,132,0.14)] flex min-h-[260px] flex-col sm:min-h-[280px] sm:flex-row">
                      <div className="relative flex-1 min-w-0 bg-gradient-to-br from-sky-pale via-white to-purple-pale/40 p-5 sm:p-6 max-h-[min(420px,70vh)] overflow-y-auto overscroll-contain [scrollbar-width:thin]">
                        <div className="pointer-events-none absolute -left-6 top-0 h-32 w-32 rounded-full bg-sky/15 blur-2xl" />
                        <div onMouseEnter={() => setEducationPreviewSlug(null)}>
                          <div className="flex items-center gap-2 text-sky">
                            <GraduationCap className="h-4 w-4 shrink-0" strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Programs</span>
                          </div>
                          <h3 className="mt-2 text-lg font-bold tracking-tight text-stone-900 sm:text-xl" style={{ fontFamily: 'var(--font-display)' }}>
                            Cybersecurity, web & UX/UI
                          </h3>
                          <p className="mt-1 max-w-sm text-sm leading-relaxed text-stone-600">
                            Cohort courses with live labs—hover a program to preview.
                          </p>
                          <Link
                            to="/education"
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-sky px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sky)] transition hover:bg-sky-light"
                            onClick={() => setEducationOpen(false)}
                          >
                            Full catalog
                            <ArrowRight className="h-4 w-4" strokeWidth={2} />
                          </Link>
                        </div>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple">Cybersecurity</p>
                            <ul className="mt-2 space-y-1">
                              <li>
                                <Link
                                  to="/education?track=cybersecurity"
                                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-stone-800 hover:bg-white/90 hover:text-purple transition"
                                  onClick={() => setEducationOpen(false)}
                                >
                                  All cybersecurity programs
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-sky">Web development</p>
                            <ul className="mt-2 space-y-1">
                              <li>
                                <Link
                                  to="/education?track=web-development"
                                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-stone-800 hover:bg-white/90 hover:text-sky transition"
                                  onClick={() => setEducationOpen(false)}
                                >
                                  All web development programs
                                </Link>
                              </li>
                            </ul>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-orange">UX / UI design</p>
                            <ul className="mt-2 space-y-1">
                              <li>
                                <Link
                                  to="/education?track=ux-design"
                                  className="block rounded-lg px-2 py-1.5 text-sm font-medium text-stone-800 hover:bg-white/90 hover:text-orange transition"
                                  onClick={() => setEducationOpen(false)}
                                >
                                  All UX / UI programs
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="relative w-full shrink-0 overflow-hidden sm:w-[200px] lg:w-[220px]">
                        <div className="relative h-full min-h-[200px] sm:absolute sm:inset-0 sm:min-h-0">
                          <AnimatePresence initial={false}>
                            <motion.div
                              key={educationPreviewSlug ?? 'default'}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0"
                            >
                              <RemoteImage
                                src={educationPreviewSlug ? getCourseHeroImage(educationPreviewSlug) : educationHeroImage}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                                fallbackSeed={`nav-edu-${educationPreviewSlug || 'all'}`}
                              />
                            </motion.div>
                          </AnimatePresence>
                          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-sky/90 via-sky/20 to-transparent sm:bg-gradient-to-l" />
                          <div className="absolute inset-x-0 bottom-0 z-[2] p-4 text-center sm:text-left">
                            <AnimatePresence initial={false} mode="wait">
                              <motion.div
                                key={educationPreviewSlug ?? 'default'}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.18 }}
                                className="min-h-[5.5rem] flex flex-col justify-end"
                              >
                                {educationPreviewSlug ? (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">Preview</p>
                                    <p className="mt-1 line-clamp-2 text-sm font-semibold text-white drop-shadow-sm">
                                      {previewCourse?.title || 'Course'}
                                    </p>
                                    {educationPreviewCaption ? (
                                      <p className="mt-1 line-clamp-3 text-xs leading-snug text-white/85">{educationPreviewCaption}</p>
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Anmel Inc</p>
                                    <p className="mt-1 text-sm font-semibold text-white drop-shadow-sm">Learn by building</p>
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Link to="/case-studies" className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform`}>
                Case Studies
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Link to="/blog" className={`text-[13.5px] font-semibold tracking-wide whitespace-nowrap ${navSolid ? 'text-stone-800' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'} hover:text-purple transition-colors relative after:absolute after:left-0 after:bottom-[-2px] after:h-0.5 after:bg-purple after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform`}>
                Blog
              </Link>
            </motion.div>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-[var(--radius-button)] bg-orange text-white font-semibold text-sm hover:bg-[#D97706] transition shadow-lg shadow-orange/30"
            >
              Get Consultation
            </Link>
            <button
              type="button"
              className={`xl:hidden p-2 rounded-lg ${navSolid ? 'text-stone-800 hover:bg-stone-100' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] hover:bg-white/10'}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] xl:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl border-l border-stone-200 p-8 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center">
                <img src={logoAnmel} alt="Anmel Inc" className="h-10 w-auto object-contain rounded-md" />
                <button type="button" onClick={() => setMobileOpen(false)} className="p-2 text-stone-600 hover:text-stone-900" aria-label="Close menu">
                  <X className="w-5 h-5" strokeWidth={1.8} />
                </button>
              </div>
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="text-lg text-stone-600 hover:text-purple font-medium">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-stone-200 pt-4 mt-2">
                <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Security Consultant</span>
                <Link to="/services" onClick={() => setMobileOpen(false)} className="block mt-2 text-lg text-purple font-medium">All security services</Link>
                <ul className="mt-2 space-y-1">
                  {navServices.map((s) => (
                    <li key={s.slug}>
                      <Link to={`/services/${s.slug}`} onClick={() => setMobileOpen(false)} className="block py-1.5 text-stone-600 hover:text-sky font-medium">
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-xl overflow-hidden aspect-[2/1] max-h-32 bg-stone-100">
                  <RemoteImage src={servicesHeroImage} alt="" className="w-full h-full object-cover" loading="lazy" fallbackSeed="nav-services-mobile" />
                </div>
              </div>
              <div className="border-t border-stone-200 pt-4 mt-2">
                <span className="text-sm font-semibold text-stone-500 uppercase tracking-wider">Academy</span>
                <Link to="/education" onClick={() => setMobileOpen(false)} className="block mt-2 text-lg text-sky font-medium">
                  All programs
                </Link>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-purple">Cybersecurity</p>
                <ul className="mt-1 space-y-0.5">
                  <li>
                    <Link
                      to="/education?track=cybersecurity"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-sm text-stone-600 hover:text-purple"
                    >
                      All cybersecurity programs
                    </Link>
                  </li>
                </ul>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-sky">Web development</p>
                <ul className="mt-1 space-y-0.5">
                  <li>
                    <Link
                      to="/education?track=web-development"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-sm text-stone-600 hover:text-sky"
                    >
                      All web development programs
                    </Link>
                  </li>
                </ul>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-orange">UX / UI design</p>
                <ul className="mt-1 space-y-0.5">
                  <li>
                    <Link
                      to="/education?track=ux-design"
                      onClick={() => setMobileOpen(false)}
                      className="block py-1 text-sm text-stone-600 hover:text-orange"
                    >
                      All UX / UI programs
                    </Link>
                  </li>
                </ul>
                <div className="mt-4 rounded-xl overflow-hidden aspect-[2/1] max-h-32 bg-stone-100">
                  <RemoteImage src={educationHeroImage} alt="" className="w-full h-full object-cover" loading="lazy" fallbackSeed="nav-education-mobile" />
                </div>
              </div>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="mt-4 py-3 rounded-xl bg-orange text-white font-semibold text-center">
                Get Consultation
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
