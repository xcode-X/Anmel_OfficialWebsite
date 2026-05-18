import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Sparkles, ShieldCheck, Users, Rocket, Headphones, LayoutGrid, Shield, Search, Code } from 'lucide-react';
import api from '../lib/api';
import { deferIdle } from '../lib/deferIdle';
import { subscribeContentStream } from '../lib/contentStream';
import { defaultServices } from '../lib/servicesData';
import { servicesHeroImage, getServiceNavPreviewImage } from '../lib/siteImages';
import RemoteImage from '../components/ui/RemoteImage';

/** Merge API payload with static defaults so detail pages always show full methodology & features when the DB row is partial. */
function mergeServiceDetail(apiData, slug) {
  const def = defaultServices.find((s) => s.slug === slug);
  if (!def) return apiData;
  return {
    ...def,
    ...apiData,
    title: apiData.title || def.title,
    shortDescription: (apiData.shortDescription && String(apiData.shortDescription).trim()) || def.shortDescription,
    description: (apiData.description && String(apiData.description).trim()) || def.description,
    outcomes:
      (apiData.outcomes && String(apiData.outcomes).trim()) || def.outcomes,
    features: Array.isArray(apiData.features) && apiData.features.length > 0 ? apiData.features : def.features,
    process: Array.isArray(apiData.process) && apiData.process.length > 0 ? apiData.process : def.process,
  };
}

const defaultServicesList = defaultServices;

export default function Services() {
  const navigate = useNavigate();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [services, setServices] = useState(defaultServicesList);

  const handleSecurityCheck = (e) => {
    e.preventDefault();
    if (!websiteUrl.trim()) return;
    
    let targetUrl = websiteUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    navigate(`/application-security-checker?url=${encodeURIComponent(targetUrl)}`);
  };

  useEffect(() => {
    let cancelled = false;
    const cancel = deferIdle(() => {
      if (cancelled) return;
      api.get('/services').then((d) => { if (!cancelled) setServices(d); }).catch(() => { });
    }, 400);
    return () => {
      cancelled = true;
      cancel();
    };
  }, []);

  useEffect(() => {
    return subscribeContentStream((resource) => {
      if (resource !== 'services') return;
      api.get('/services').then(setServices).catch(() => {});
    });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden grid-bg">
        {/* Subtle bottom dark fade gradient for smooth fold transition */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stone-50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* ── Left Column: Copy & Interactive Checker ── */}
            <div className="max-w-2xl flex flex-col justify-center">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center self-start gap-2 bg-[#5D1C6A]/10 border border-[#5D1C6A]/20 text-purple px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider shadow-sm mb-6"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Trusted Technology Partner in Liberia</span>
              </motion.div>

              {/* Typography Heading exactly matching the mockup */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-stone-900 leading-[1.12] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Securing <span className="text-purple">Digital</span> Assets.
                <br />
                <span className="text-purple">Delivering</span> Trusted Solutions.
              </motion.h1>

              {/* Subtitle Description */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.16 }}
                className="mt-6 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl"
              >
                Expert cybersecurity consulting, digital forensics investigations, and modern web development solutions for enterprises and organizations.
              </motion.p>

              {/* CTA Buttons - Pill Shaped */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-purple hover:bg-purple-light text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-lg shadow-purple/10 hover:shadow-purple/20 transition-all duration-200"
                >
                  <span>Request Consultant</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
                </Link>
                
                <a
                  href="#services-list"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('services-list')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 border border-stone-300 hover:border-stone-400 bg-white/50 text-stone-700 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-white transition-all duration-200"
                >
                  <span>Our Services</span>
                  <LayoutGrid className="w-4 h-4 text-stone-500" strokeWidth={2.2} />
                </a>
              </motion.div>

              {/* ── Live Interactive Security Widget ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="mt-10 border-t border-stone-200 pt-8 max-w-md"
              >
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple" />
                  Live Web Site Status Check
                </h3>
                <p className="text-xs text-stone-500 mt-1 mb-4 leading-relaxed">
                  Ensure your website is secure, fast, and always online. Input your URL to check the vulnerability status.
                </p>
                
                <form onSubmit={handleSecurityCheck} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Your Website URL"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="flex-1 min-w-0 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-800 text-xs px-4 py-3 rounded-xl border border-stone-200 focus:border-purple focus:outline-none transition-all duration-200 placeholder:text-stone-400"
                  />
                  <button
                    type="submit"
                    className="bg-stone-950 hover:bg-black text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all duration-200 shrink-0"
                  >
                    Check Status
                  </button>
                </form>
              </motion.div>

            </div>

            {/* ── Right Column: Interactive Overlay Collage ── */}
            <div className="relative flex items-center justify-center min-h-[500px] lg:min-h-[580px] mt-10 lg:mt-0 select-none">
              
              {/* Solid Purple Circle Backdrop */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15, delay: 0.2 }}
                className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-purple z-0 shadow-lg shadow-purple/10"
              />

              {/* Armchair Consultant Cutout - Clean, high resolution */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 45, damping: 15, delay: 0.35 }}
                className="relative z-10 w-full max-w-[430px] drop-shadow-[0_20px_50px_rgba(93,28,106,0.15)] pb-12 pointer-events-none"
              >
                <img
                  src="/armchair_consultant.png"
                  alt="Anmel Inc Security Expert"
                  className="w-full h-auto object-contain pointer-events-none"
                />
              </motion.div>

              {/* 3D Floating Shield Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 60, delay: 0.6 }}
                className="absolute bottom-24 right-10 lg:-right-4 w-16 h-16 rounded-full bg-purple text-white flex items-center justify-center shadow-2xl border-4 border-white z-20"
              >
                <Shield className="w-6 h-6 fill-white/10" strokeWidth={2} />
              </motion.div>

              {/* Layered Checklist Card (Overlapping in the middle) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 40, delay: 0.5 }}
                className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-3xl p-5 w-[240px] sm:w-[260px] shadow-2xl shadow-stone-900/10 z-20 flex flex-col gap-4"
              >
                {[
                  { icon: Shield, title: "Cybersecurity", desc: "Protect. Detect. Respond.", color: "text-[#5D1C6A] bg-[#5D1C6A]/10" },
                  { icon: Search, title: "Digital Forensics", desc: "Investigate. Analyze. Resolve.", color: "text-purple bg-purple/10" },
                  { icon: Code, title: "Web Development", desc: "Build. Optimize. Scale.", color: "text-sky bg-sky/10" }
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 group">
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 leading-none">{item.title}</h4>
                      <p className="text-[10px] text-stone-500 mt-1 leading-none">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

            </div>

          </div>

          {/* ── Bottom Bar: Modern Horizontal Features Box ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-100/50 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-20"
          >
            {[
              { icon: Shield, title: "Security First", desc: "Advanced protection for your critical assets." },
              { icon: Users, title: "Expert Team", desc: "Certified professionals with proven experience." },
              { icon: Rocket, title: "Modern Solutions", desc: "Scalable and innovative technology for growth." },
              { icon: Headphones, title: "Reliable Support", desc: "We're here to support your success." }
            ].map((feat) => (
              <div key={feat.title} className="flex items-start gap-3 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center text-purple shrink-0">
                  <feat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{feat.title}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services List Anchor */}
      <div id="services-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {services.map((s) => (
          <motion.section
            key={s.slug}
            id={s.slug}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="py-[var(--spacing-block)] border-b border-stone-200 last:border-0"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-[#0EA5E9] text-sm font-semibold uppercase tracking-wider">Service</span>
                <h2 className="mt-2 text-3xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  {s.title}
                </h2>
                <p className="mt-4 text-stone-600 leading-relaxed">{s.description || s.shortDescription}</p>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-3">Target Outcomes</h3>
                  <div className="bg-[#E0F2FE]/40 border-l-4 border-[#0EA5E9] p-4 rounded-r-xl">
                    <p className="text-stone-700 italic text-[15px]">{s.outcomes || 'Defined, sustainable security controls and risk reduction.'}</p>
                  </div>
                </div>

                {s.features?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest mb-4">What's Included</h3>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {s.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-stone-600 text-[15px]">
                          <span className="text-[#7C3AED] font-bold mt-0.5">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-10">
                  <Link to="/contact" className="inline-flex items-center gap-2 text-[#F97316] font-bold hover:gap-3 transition-all underline decoration-2 underline-offset-4">
                    Inquire about this service
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {s.process?.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-stone-200/80 shadow-[var(--shadow-card)] sticky top-32">
                  <h3 className="font-bold text-stone-900 mb-6 text-lg" style={{ fontFamily: 'var(--font-display)' }}>Methodology</h3>
                  <div className="space-y-6 relative">
                    <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-stone-100" />
                    {s.process.map((p) => (
                      <div key={p.step} className="flex gap-4 relative z-10">
                        <span className="w-9 h-9 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs shrink-0">{p.step}</span>
                        <div>
                          <span className="font-bold text-stone-900 block">{p.title}</span>
                          <p className="text-sm text-stone-500 mt-1 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </div>

      <section className="py-[var(--spacing-section)] bg-stone-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 rounded-b-[50%] bg-[#EDE9FE] opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to strengthen your security?
          </h2>
          <p className="mt-3 text-stone-600 max-w-md mx-auto">Tell us about your environment and goals. We’ll recommend the right starting point.</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-[var(--radius-button)] bg-[#F97316] text-white font-semibold shadow-lg shadow-orange-200/50 hover:bg-[#EA580C] transition"
          >
            Get a consultation
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceDetailBody({ slug }) {
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    api
      .get(`/services/${slug}`)
      .then((data) => {
        if (cancelled) return;
        setItem(mergeServiceDetail(data, slug));
      })
      .catch(() => {
        if (cancelled) return;
        const found = defaultServices.find((s) => s.slug === slug);
        if (found) setItem(found);
        else {
          setItem(null);
          setNotFound(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    return subscribeContentStream((resource) => {
      if (resource !== 'services' || !slug) return;
      api
        .get(`/services/${slug}`)
        .then((data) => setItem(mergeServiceDetail(data, slug)))
        .catch(() => {});
    });
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4 bg-white">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
          Service not found
        </h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">The service you’re looking for doesn’t exist or has been moved.</p>
        <Link
          to="/services"
          className="mt-6 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7] transition"
        >
          View all services
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="pt-28 min-h-screen bg-white">
        <div className="h-[min(420px,55vh)] animate-pulse bg-stone-200" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-6 h-12 max-w-2xl animate-pulse rounded-lg bg-stone-200" />
          <div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-stone-100" />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-stone-100" />
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  const lead = item.shortDescription?.trim() || '';
  const fullDescription = item.description?.trim() || '';
  const showOverview =
    fullDescription.length > 0 &&
    (fullDescription !== lead || fullDescription.length > lead.length + 20);

  return (
    <div className="pt-28 bg-white">
      <section className="relative min-h-[min(420px,70vh)] overflow-hidden">
        <div className="absolute inset-0">
          <RemoteImage
            src={item.image || getServiceNavPreviewImage(slug)}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
            fallbackSeed={`svc-hero-${slug}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-stone-950/70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(124,58,237,0.25),transparent)]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 flex flex-col justify-end min-h-[min(420px,70vh)]">
          <nav className="text-sm text-white/75" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-white/40" aria-hidden>
                /
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li className="text-white/40" aria-hidden>
                /
              </li>
              <li className="text-white/95 font-medium truncate max-w-[min(100%,320px)]">{item.title}</li>
            </ol>
          </nav>
          <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Service detail
            </div>
            <h1
              className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {item.title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {lead || fullDescription.slice(0, 220)}
              {fullDescription.length > 220 && !lead ? '…' : ''}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 hover:bg-[#EA580C] transition"
              >
                Discuss this service
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition"
              >
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
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Overview
                </h2>
                <p className="mt-4 text-stone-600 leading-relaxed text-[17px]">{fullDescription}</p>
              </motion.section>
            )}

            {item.outcomes && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">Target outcomes</h2>
                <div className="mt-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
                  <p className="text-stone-800 text-lg leading-relaxed italic">{item.outcomes}</p>
                </div>
              </motion.section>
            )}

            {item.features?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  What’s included
                </h2>
                <ul className="mt-6 grid sm:grid-cols-2 gap-4">
                  {item.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3.5 text-[15px] text-stone-700 shadow-sm"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#7C3AED]" strokeWidth={2} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {item.process?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                  Methodology
                </h2>
                <div className="mt-6 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-[var(--shadow-card)]">
                  <div className="relative space-y-8">
                    <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-violet-200 via-stone-200 to-transparent" />
                    {item.process.map((p) => (
                      <div key={p.step} className="relative flex gap-4 pl-0">
                        <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-xs font-bold text-white shadow-md">
                          {p.step}
                        </span>
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
            <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-violet-50 via-white to-sky-50/40 p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                Ready to scope this?
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                Share your environment and constraints—we’ll tailor deliverables, timelines, and reporting to your team.
              </p>
              <Link
                to="/contact"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200/40 hover:bg-[#EA580C] transition"
              >
                Get a consultation
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            <Link
              to="/services"
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 hover:border-violet-200 hover:bg-violet-50/50 transition"
            >
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
