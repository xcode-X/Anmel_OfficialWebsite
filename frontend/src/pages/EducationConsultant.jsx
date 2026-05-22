import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Bell, CheckCircle2, Users, PlayCircle, Globe2, BookOpen, MapPin, X, Building2, Quote, Star, Award, DollarSign, Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { universitiesApi, testimonialsApi } from '../lib/api';
import { subscribeContentStream } from '../lib/contentStream';
import FeaturedUniversityCard from '../components/education/FeaturedUniversityCard';
import ScholarshipSectionHero from '../components/scholarships/ScholarshipSectionHero';

const announcements = [
  { id: 1, date: 'May 14', text: 'Fall 2026 Admissions are now officially open for UK & Canada!' },
  { id: 2, date: 'May 10', text: 'New 100% Scholarship opportunities added for STEM students in Australia.' },
  { id: 3, date: 'May 05', text: 'Join our Virtual Study Abroad Fair this weekend. Register now!' },
];

const stats = [
  { label: 'Partner Universities', value: '500+' },
  { label: 'Students Placed', value: '10,000+' },
  { label: 'Scholarships Secured', value: '$5M+' },
  { label: 'Visa Success Rate', value: '98%' },
];

// Universities fetched from API

const process = [
  { step: '01', title: 'Profile Evaluation', desc: 'Comprehensive analysis of your academic background and career goals.' },
  { step: '02', title: 'University Selection', desc: 'Shortlisting the best-fit institutions tailored to your profile.' },
  { step: '03', title: 'Application Processing', desc: 'Assistance with SOPs, LORs, and direct university applications.' },
  { step: '04', title: 'Visa Assistance', desc: 'Expert guidance on financial documentation and visa interview preparation.' },
  { step: '05', title: 'Pre-Departure', desc: 'A complete guide to accommodation, travel, and adjusting to your new life.' }
];

export default function EducationConsultant() {
  const [activeVideo, setActiveVideo] = useState(null);
  const [openCoursesUni, setOpenCoursesUni] = useState(null);
  const [partnerUniversities, setPartnerUniversities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [unisLoading, setUnisLoading] = useState(true);
  const [uniDbDown, setUniDbDown] = useState(false);

  const loadUniversities = useCallback(async () => {
    try {
      const data = await universitiesApi.list();
      setUniDbDown(false);
      setPartnerUniversities(Array.isArray(data) ? data : []);
    } catch {
      setUniDbDown(true);
      setPartnerUniversities([]);
    } finally {
      setUnisLoading(false);
    }
    return true;
  }, []);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await testimonialsApi.list();
        setTestimonials(Array.isArray(data) ? data : []);
      } catch {
        setTestimonials([]);
      }
    };
    loadTestimonials();

    loadUniversities();

    const cleanups = [];
    cleanups.push(
      universitiesApi.subscribe((rows) => {
        setPartnerUniversities(rows);
        setUniDbDown(false);
        setUnisLoading(false);
      }),
    );
    cleanups.push(
      testimonialsApi.subscribe((rows) => {
        setTestimonials(rows);
      }),
    );
    cleanups.push(
      subscribeContentStream((resource) => {
        if (resource === 'universities') loadUniversities();
        if (resource === 'testimonials') loadTestimonials();
      }),
    );

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        loadTestimonials();
        loadUniversities();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cleanups.forEach((fn) => fn());
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadUniversities]);

  const toggleCourses = (id) => {
    setOpenCoursesUni(openCoursesUni === id ? null : id);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 min-h-[95vh] flex flex-col justify-center overflow-hidden grid-bg">
        {/* Subtle bottom dark fade gradient for smooth fold transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none" />

        {/* Sub Navigation Bar - Light Theme Styled */}
        <div className="absolute top-24 left-0 right-0 z-20 border-y border-stone-200/80 bg-white/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-14 text-sm font-medium text-stone-700 overflow-x-auto [scrollbar-width:none]">
              <div className="flex space-x-8 shrink-0">
                <a href="#why-study-abroad" className="hover:text-purple transition-colors py-4">Why Study Abroad</a>
                <a href="#universities" className="hover:text-purple transition-colors py-4">Universities</a>
                <a href="#process" className="hover:text-purple transition-colors py-4">Admissions</a>
                <a href="#scholarships" className="hover:text-purple transition-colors py-4 relative">
                  Scholarships
                  <span className="absolute top-2 -right-3 w-2 h-2 bg-orange rounded-full animate-ping"></span>
                </a>
                <a href="#online-degrees" className="hover:text-purple transition-colors py-4">Online Degree Program</a>
              </div>
              <div className="flex space-x-6 shrink-0 border-l border-stone-200 pl-6">
                <Link to="/student-application" className="flex items-center gap-2 hover:text-purple transition-colors py-4">
                  <Users className="w-4 h-4" /> Student Login
                </Link>
                <Link to="/agent-login" className="flex items-center gap-2 hover:text-purple transition-colors py-4">
                  <Building2 className="w-4 h-4" /> Agent Portal
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 w-full grid lg:grid-cols-[1fr_420px] gap-12 items-center">
          <div className="max-w-2xl flex flex-col justify-center">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center self-start gap-2 bg-stone-950 text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider shadow-sm mb-6"
            >
              <Globe2 className="w-4 h-4 text-orange" />
              <span>Anmel Study Abroad Partner</span>
            </motion.div>

            {/* Typography Heading exactly matching the mockup */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-stone-900 leading-[1.12] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Your Future at <br/>
              <span className="text-orange">Global</span> <span className="text-sky">Institutions</span>
            </motion.h1>

            {/* Description Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl"
            >
              Expert guidance for international admissions, scholarships, and visa processing. Partnering with top universities to bring the world to your fingertips.
            </motion.p>
            
            {/* CTA Buttons - Pill Shaped */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/student-application"
                className="inline-flex items-center justify-center gap-2 bg-stone-950 hover:bg-black text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 transition-all duration-200"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
              </Link>
              
              <a
                href="#consultation"
                className="inline-flex items-center justify-center gap-2 border border-stone-300 hover:border-stone-400 bg-white/50 text-stone-700 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-white transition-all duration-200"
              >
                <span>Book Consultation</span>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Hero Graphic overlapping solid circle and marquee announcements */}
          <div className="relative mt-8 lg:mt-0 flex flex-col items-center justify-center min-h-[550px]">
            {/* Solid Amber Circle Graphic Backdrop */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
              className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full bg-orange z-0 shadow-lg shadow-orange/10"
            />

            {/* Hero Image - Big and Transparent Cutout */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 45 }}
              className="relative z-10 w-full max-w-[420px] drop-shadow-[0_20px_50px_rgba(245,158,11,0.2)] select-none pointer-events-none pb-20"
            >
              <img 
                src="/happy_student_no_bg.png" 
                alt="Happy Student celebrating admission" 
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            {/* Real-time Notification Board (Overlapping at the bottom) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -left-6 right-6 lg:-left-8 lg:right-8 bg-[#340E3C]/95 backdrop-blur-xl border border-purple/35 rounded-3xl p-6 h-[250px] flex flex-col shadow-2xl overflow-hidden z-20"
            >
              <div className="flex items-center gap-3 border-b border-purple/30 pb-3 mb-3 relative z-10">
                <div className="relative">
                  <Bell className="w-5 h-5 text-sky" />
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange animate-ping" />
                </div>
                <h3 className="text-white font-bold tracking-wide text-sm">Live Announcements</h3>
              </div>
              
              <div className="flex-1 overflow-hidden relative mask-image-vertical">
                <div className="animate-marquee-vertical flex flex-col gap-4 absolute w-full">
                  {[...announcements, ...announcements].map((ann, idx) => (
                    <div key={`${ann.id}-${idx}`} className="group cursor-default bg-[#2A0B30]/50 p-3 rounded-xl border border-purple/20 hover:border-sky/50 transition-colors">
                      <span className="text-[10px] font-bold text-orange uppercase tracking-wider block mb-1">{ann.date}</span>
                      <p className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">{ann.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#2A0B30] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-sky-400 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process / Admissions */}
      <section id="process" className="py-28 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
              Streamlined Admission Process
            </h2>
            <p className="mt-4 text-slate-600 text-lg">We handle the heavy lifting so you can focus on your studies.</p>
          </div>
          <div className="grid lg:grid-cols-5 gap-8">
            {process.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative group">
                {i !== process.length - 1 && <div className="hidden lg:block absolute top-10 left-[60%] w-full h-px bg-slate-200 border-t border-dashed border-slate-300" />}
                <div className="relative z-10 w-20 h-20 mx-auto rounded-full bg-white border-2 border-orange-500 flex items-center justify-center text-2xl font-bold text-orange-600 shadow-xl mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  {p.step}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2 text-slate-900">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Scholarships Section */}
      <section id="scholarships" className="py-28 bg-white border-y border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-12 xl:gap-14 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                Scholarship Opportunities
              </h2>

              <div className="mt-6 space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
                <p>
                  We connect students with a wide range of funding options — from <strong className="text-slate-800 font-semibold">merit-based</strong> and <strong className="text-slate-800 font-semibold">need-based</strong> awards to <strong className="text-slate-800 font-semibold">full</strong> and <strong className="text-slate-800 font-semibold">partial</strong> scholarships offered by governments, partner universities, and external foundations across the UK, Canada, Australia, the US, and beyond.
                </p>
                <p>
                  Whether you are pursuing undergraduate, master&apos;s, or doctoral study, listings include fully funded packages, tuition-only grants, and living-allowance support for STEM, business, health sciences, and humanities programmes. New opportunities are added in <strong className="text-slate-800 font-semibold">real time</strong> as partner institutions release fresh intakes — click below to browse what is available right now.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Merit-based', 'Need-based', 'Fully Funded', 'Partial', 'Government', 'University'].map((type) => (
                  <span key={type} className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wide border border-sky-100">
                    {type}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/education-consultant/scholarships"
                  className="inline-flex items-center gap-2 text-white font-semibold bg-slate-900 px-6 py-3 rounded-full text-sm shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all"
                >
                  Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/student-application" className="inline-flex items-center gap-2 text-slate-600 font-semibold text-sm hover:text-slate-900 transition-colors">
                  Submit general application <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <ScholarshipSectionHero />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section id="universities" className="py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-sky-400/8 rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] bg-orange-400/8 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-600 mb-4">
              <Building2 className="w-4 h-4" />
              Global partners
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
              Featured Universities
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              Explore world-class campuses, programme options, and entry pathways at institutions we work with directly — updated live from our partner network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {unisLoading ? (
              // Skeleton cards while the first fetch is in-flight
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl animate-pulse">
                  <div className="h-64 bg-slate-200" />
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="flex gap-3">
                      <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
                      <div className="flex-1 h-10 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : partnerUniversities.length === 0 ? (
              <div className="lg:col-span-3 py-16 text-center text-slate-400">
                {uniDbDown ? (
                  <>
                    <Loader2 className="w-10 h-10 text-slate-300 mx-auto mb-4 animate-spin" />
                    <p className="text-base font-medium">Connecting to database…</p>
                    <p className="text-sm text-slate-300 mt-1">Universities will appear automatically once the connection is ready.</p>
                  </>
                ) : (
                  <>
                    <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-lg font-medium">Partner universities coming soon</p>
                  </>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {partnerUniversities.map((uni, idx) => (
                  <FeaturedUniversityCard
                    key={uni._id || uni.idName}
                    uni={uni}
                    index={idx}
                    onTour={setActiveVideo}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
      {testimonials.length > 0 && (
      <section className="py-28 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>Student Voices</h2>
            <p className="mt-4 text-slate-600 text-lg">Don't just take our word for it. Hear from our successful alumni.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => {
              const avatarSrc = t.avatar || t.image;
              const initials = t.name ? t.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
              return (
              <motion.div 
                key={t._id || i} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }} 
                className="bg-slate-50 p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300"
              >
                <Quote className="absolute top-8 right-8 w-12 h-12 text-slate-200 group-hover:text-sky-100 transition-colors" />
                <div className="flex gap-1 text-amber-400 mb-6 relative z-10">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-slate-700 text-lg leading-relaxed mb-8 relative z-10">"{t.quote}"</p>
                {t.outcome && (
                  <div className="mb-6 inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 text-xs font-semibold rounded-full px-3 py-1.5">
                    {t.outcome}
                  </div>
                )}
                <div className="mt-auto pt-6 flex items-center gap-4 border-t border-slate-200 relative z-10">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-sky-100 flex-shrink-0 flex items-center justify-center text-sky-700 font-bold">
                    {avatarSrc ? <img src={avatarSrc} alt={t.name} className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{t.name}</div>
                    {(t.role || t.company) && <div className="text-sm font-semibold text-sky-600">{[t.role, t.company].filter(Boolean).join(' · ')}</div>}
                    {t.program && <div className="text-sm font-semibold text-sky-600">{t.program}</div>}
                    {t.uni && <div className="text-xs text-slate-500 mt-0.5">{t.uni}</div>}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* Online Degree Program Stub */}
      <section id="online-degrees" className="py-28 bg-[#2A0B30] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Globe2 className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Online Degree Programs</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">Earn a world-class degree from anywhere in the world. Partnering with top institutions to offer fully accredited online bachelor's and master's degrees.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold px-8 py-4 rounded-xl hover:bg-sky-500 transition-colors">
            Explore Online Programs <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Interactive Consultation Booking */}
      <section id="consultation" className="py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#2A0B30] to-sky-950 rounded-[3rem] p-10 md:p-16 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-3xl rounded-full mix-blend-screen"></div>
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>Book a Free Strategy Session</h2>
                <p className="text-sky-100 text-lg mb-8 leading-relaxed">Speak with our expert education counselors to map out your study abroad journey. We'll evaluate your profile and recommend the best path forward.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 text-sky-100"><CheckCircle2 className="w-6 h-6 text-orange-500" /> Personalized Profile Evaluation</div>
                  <div className="flex items-center gap-4 text-sky-100"><CheckCircle2 className="w-6 h-6 text-orange-500" /> University & Course Selection</div>
                  <div className="flex items-center gap-4 text-sky-100"><CheckCircle2 className="w-6 h-6 text-orange-500" /> Scholarship Assessment</div>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" placeholder="Last Name" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <input type="email" placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="tel" placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500">
                    <option>Select Target Country</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>USA</option>
                  </select>
                  <button type="button" className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
                    Schedule Consultation
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
            <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
              <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="p-4 bg-[#2A0B30] border-b border-white/10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><PlayCircle className="w-5 h-5 text-sky-400"/> {activeVideo.name} Campus Tour</h3>
              </div>
              <div className="aspect-video w-full bg-slate-900">
                <video src={activeVideo.videoUrl} controls autoPlay className="w-full h-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 20s linear infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
        .mask-image-vertical {
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
      `}} />
    </div>
  );
}
