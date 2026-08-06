import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Code2,
  Shield,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Globe2,
  Cpu,
  Lock,
  Layers,
  Award,
} from 'lucide-react';

const corePillars = [
  {
    slug: 'education-consultant',
    title: 'Education Consultant',
    badge: 'Pillar I',
    color: '#2FA084',
    image: '/images/anmel_education_hero.png',
    description:
      'Guiding students and professionals to top-ranked international universities, fully-funded scholarships, SOP assistance, and seamless visa processing.',
    highlights: [
      '500+ Global Partner Universities',
      'Full Tuition Scholarship Placement',
      'End-to-End Visa & Student Guidance',
      'Certified Agent & Student Network',
    ],
    link: '/education-consultant',
    icon: GraduationCap,
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    badge: 'Pillar II',
    color: '#5D1C6A',
    image: '/images/anmel_webdev_hero.png',
    description:
      'Engineering high-impact web applications, scalable SaaS portals, custom e-commerce systems, and modern mobile-responsive platforms built for growth.',
    highlights: [
      'Custom Full-Stack Web Applications',
      'Modern UI/UX & Responsive Engineering',
      'Cloud Architecture & Microservices',
      'SEO & Performance Optimization',
    ],
    link: '/web-development',
    icon: Code2,
  },
  {
    slug: 'cyber-security',
    title: 'Cyber Security Consultant',
    badge: 'Pillar III',
    color: '#0EA5E9',
    image: '/images/anmel_cybersecurity_hero.png',
    description:
      'Shielding organizational systems through penetration testing, vulnerability management, security audits, ISO 27001 readiness, and continuous threat monitoring.',
    highlights: [
      'Web, API & Network Pen-Testing',
      'ISO 27001 & SOC 2 Audit Readiness',
      'Free Instant Website Security Scanner',
      'Incident Response & 24/7 Monitoring',
    ],
    link: '/services',
    icon: Shield,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

export default function ServicesSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-offwhite relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-block text-[#2FA084] font-bold text-xs uppercase tracking-[0.22em] mb-3">
            Anmel Core Offerings
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Three Service Pillars.{' '}
            <span className="gradient-text">One Trusted Global Partner.</span>
          </h2>
          <p className="mt-4 text-stone-600 text-base sm:text-lg leading-relaxed">
            Anmel Inc provides end-to-end expertise across Education Consultancy, Web Engineering, and Enterprise Cyber Security. Discover how we elevate individuals and organizations worldwide.
          </p>
        </motion.div>

        {/* 3 Pillars Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {corePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.slug}
                variants={item}
                transition={{ type: 'spring', stiffness: 90, damping: 16 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col h-full rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image Banner */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                  
                  {/* Top Bar Accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: pillar.color }}
                  />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5"
                      style={{ backgroundColor: pillar.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {pillar.badge}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-6 sm:p-7">
                  <h3
                    className="text-2xl font-bold text-stone-900 group-hover:text-purple transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {pillar.title}
                  </h3>

                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-stone-100 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                      Key Highlights
                    </p>
                    <ul className="space-y-2.5">
                      {pillar.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2.5 text-xs text-stone-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: pillar.color }} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4">
                    <Link
                      to={pillar.link}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold text-white transition-all shadow-md group-hover:shadow-lg"
                      style={{ backgroundColor: pillar.color }}
                    >
                      Explore {pillar.title}
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/education-consultant"
            className="inline-flex items-center gap-2 text-stone-800 font-semibold text-sm border border-stone-300 bg-white rounded-full px-5 py-2.5 hover:bg-stone-50 transition"
          >
            <GraduationCap className="w-4 h-4 text-[#2FA084]" /> Education Services
          </Link>
          <Link
            to="/web-development"
            className="inline-flex items-center gap-2 text-stone-800 font-semibold text-sm border border-stone-300 bg-white rounded-full px-5 py-2.5 hover:bg-stone-50 transition"
          >
            <Code2 className="w-4 h-4 text-[#5D1C6A]" /> Web Dev Services
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-stone-800 font-semibold text-sm border border-stone-300 bg-white rounded-full px-5 py-2.5 hover:bg-stone-50 transition"
          >
            <Shield className="w-4 h-4 text-[#0EA5E9]" /> Cyber Security Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
