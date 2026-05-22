import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, FileCheck, Cloud, Activity, GraduationCap, ArrowRight, Settings,
} from 'lucide-react';
import { getServices } from '../../lib/servicesData';
import RemoteImage from '../ui/RemoteImage';

const iconMap = {
  'security-assessment': Shield,
  'secure-development': Lock,
  compliance: FileCheck,
  monitoring: Activity,
  'cloud-security': Cloud,
  training: GraduationCap,
};

const defaultIcon = Settings;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function ServicesSection() {
  const services = getServices();

  return (
    <section className="py-[var(--spacing-section)] bg-offwhite relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <span className="inline-block whitespace-nowrap text-sky font-semibold text-xs uppercase tracking-[0.22em] mb-4">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
            Security Intelligence Meets{' '}
            <span className="gradient-text">Engineering Excellence</span>
          </h2>
          <p className="mt-5 text-stone-600 text-lg leading-relaxed">
            End-to-end cybersecurity and secure web engineering tailored to your risk profile.
            We combine deep technical expertise with modern engineering practices.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s) => {
            const Icon = iconMap[s.slug] || defaultIcon;
            return (
              <motion.div
                key={s.slug}
                variants={item}
                transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/services/${s.slug}`}
                  className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-stone-200/80 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-stone-300/80 transition-all duration-300"
                >
                  <div className="relative h-36 overflow-hidden">
                    <RemoteImage
                      src={s.image}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      fallbackSeed={`home-svc-${s.slug}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}66)` }}
                    />
                    <span
                      className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{ background: `linear-gradient(145deg, ${s.color}, ${s.color}cc)` }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-lg font-bold text-stone-900 whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                      {s.title}
                    </h3>
                    <p className="mt-2 text-stone-600 leading-relaxed text-sm line-clamp-2">
                      {s.shortDescription || s.description || ''}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange group-hover:gap-2.5 transition-all">
                      Learn more
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-purple font-semibold text-sm border border-purple/25 bg-purple-pale rounded-full px-6 py-3 hover:bg-purple hover:text-white hover:border-transparent transition-all duration-200"
          >
            View all security services
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
