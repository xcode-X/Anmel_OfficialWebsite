import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { capabilityImages } from '../../lib/siteImages';
import RemoteImage from '../ui/RemoteImage';

const items = [
  {
    title: 'Penetration Testing',
    blurb: 'Controlled offensive testing across web, API, and network surfaces.',
    to: '/services/security-assessment',
    image: capabilityImages.pentest,
    alt: 'Security analyst reviewing systems',
  },
  {
    title: 'Security Audits',
    blurb: 'Structured reviews that surface gaps before attackers do.',
    to: '/services/security-assessment',
    image: capabilityImages.audits,
    alt: 'Audit and compliance documentation',
  },
  {
    title: 'Compliance Consulting',
    blurb: 'SOC 2, ISO 27001, GDPR, and audit-ready evidence.',
    to: '/services/compliance',
    image: capabilityImages.compliance,
    alt: 'Team planning compliance roadmap',
  },
  {
    title: 'Secure Web Engineering',
    blurb: 'Threat modeling, secure SDLC, and resilient releases.',
    to: '/services/secure-development',
    image: capabilityImages.webdev,
    alt: 'Developers collaborating on secure code',
  },
  {
    title: 'Cloud Security',
    blurb: 'IAM, segmentation, and hardening for AWS, Azure, and GCP.',
    to: '/services/cloud-security',
    image: capabilityImages.cloud,
    alt: 'Cloud infrastructure abstract',
  },
];

export default function CapabilitiesShowcaseSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#EDE9FE]/60 blur-3xl -translate-y-1/2 pointer-events-none" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mb-12 lg:mb-16"
        >
          <span className="text-[#0EA5E9] font-semibold text-sm uppercase tracking-[0.2em]">Capabilities</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            End-to-end security, delivered with clarity
          </h2>
          <p className="mt-4 text-stone-600 text-lg leading-relaxed">
            Explore how we help teams reduce risk in real time—from offensive testing and audits to compliance programs,
            secure engineering, and cloud hardening. Each path links to a full service breakdown.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-2xl border border-stone-200/90 bg-stone-50/80 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] hover:border-stone-300/80 transition-all duration-300"
            >
              <Link to={item.to} className="block h-full">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <RemoteImage
                    src={item.image}
                    alt={item.alt}
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    fallbackSeed={`cap-${item.title}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/35 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      {item.title}
                    </h3>
                  </div>
                </div>
                <div className="p-5 sm:p-6 pt-4">
                  <p className="text-stone-600 text-sm leading-relaxed">{item.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] group-hover:gap-3 transition-all">
                    View service
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
