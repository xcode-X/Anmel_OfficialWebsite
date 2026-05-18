import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, BookOpen, ClipboardCheck } from 'lucide-react';
import { resourceStripImages } from '../../lib/siteImages';
import RemoteImage from '../ui/RemoteImage';

const links = [
  { to: '/blog', label: 'Security blog', desc: 'Practical posts on threats, architecture, and compliance.', icon: BookOpen },
  { to: '/case-studies', label: 'Case studies', desc: 'Outcomes from real engagements across sectors.', icon: FileText },
  { to: '/blog', label: 'White papers & guides', desc: 'Long-form briefings you can share with leadership.', icon: FileText },
  { to: '/#security-checklist', label: 'Security checklist', desc: 'Downloadable controls list for your next review.', icon: ClipboardCheck },
];

export default function ResourcesInsightsSection() {
  return (
    <section className="py-[var(--spacing-section)] bg-stone-50 border-y border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">Resources</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Insights you can use this week
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed">
              Stay current with research-backed articles, proof-of-work case studies, and downloadable assets—updated as we
              publish new material.
            </p>
            <ul className="space-y-4">
              {links.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    to={item.to}
                    className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:border-[#0EA5E9]/40 hover:shadow-md transition group"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-stone-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.label}
                        <ArrowRight className="w-4 h-4 text-[#F97316] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                      </p>
                      <p className="text-sm text-stone-500 mt-1">{item.desc}</p>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link
              to="/#faq"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0EA5E9] hover:underline underline-offset-4"
            >
              View frequently asked questions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-auto sm:row-span-2 border border-stone-200 shadow-[var(--shadow-card)]">
              <RemoteImage
                src={resourceStripImages.blog}
                alt="Security operations and engineering workspace"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                fallbackSeed="resources-blog"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium">
                Field notes from assessments and incident simulations.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-stone-200 shadow-[var(--shadow-card)]">
              <RemoteImage
                src={resourceStripImages.papers}
                alt="Strategy session for security roadmap"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                fallbackSeed="resources-papers"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium">
                Executive-ready summaries and checklists.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
