import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const steps = [
  { num: '01', title: 'Discover', desc: 'We map your assets, threats, and compliance gaps through workshops and lightweight assessments.' },
  { num: '02', title: 'Design', desc: 'A tailored security roadmap with clear priorities, timelines, and ownership.' },
  { num: '03', title: 'Deliver', desc: 'Implementation with best practices, documentation, and handover so your team can sustain it.' },
  { num: '04', title: 'Defend', desc: 'Ongoing monitoring, reviews, and updates so your posture stays strong over time.' },
];

export default function HowWeWork() {
  return (
    <section className="py-[var(--spacing-section)] bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-[#7C3AED] font-semibold text-sm uppercase tracking-[0.2em]">How we work</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            A clear path from risk to resilience
          </h2>
          <p className="mt-4 text-stone-600">
            We don’t hand you a report and leave. We partner through discovery, design, delivery, and long-term defense.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line — creative zigzag on desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0EA5E9] via-[#7C3AED] via-50% to-[#F97316] opacity-30" style={{ top: '6rem' }} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-stone-50 rounded-2xl p-6 lg:p-8 border border-stone-200/80 h-full flex flex-col hover:border-[#0EA5E9]/30 hover:shadow-[var(--shadow-hover)] transition-all duration-300">
                  <span className="text-4xl font-bold text-[#0EA5E9]/30" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.num}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-stone-600 text-sm leading-relaxed flex-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-[#7C3AED] font-semibold hover:underline underline-offset-4"
          >
            Learn more about our methodology
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
