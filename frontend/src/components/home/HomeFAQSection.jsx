import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How quickly can you start an assessment?',
    a: 'Most engagements begin within 2–3 weeks after scoping. Critical or time-boxed reviews can often be prioritized—tell us your deadline in the consultation form.',
  },
  {
    q: 'Do you work with teams outside Liberia?',
    a: 'Yes. We support remote-first delivery across West Africa and internationally, with clear communication windows and secure collaboration practices.',
  },
  {
    q: 'What deliverables should we expect?',
    a: 'You receive prioritized findings, remediation guidance, and executive summaries suited for both technical teams and leadership. Compliance engagements include evidence mapping for auditors.',
  },
  {
    q: 'Can you help after the assessment is done?',
    a: 'Absolutely. Many clients retain us for remediation validation, secure SDLC coaching, and detection tuning so improvements stick.',
  },
  {
    q: 'How do you handle sensitive data?',
    a: 'We follow least-privilege access, encrypted channels, and data-handling clauses in our statements of work. Ask for our security & privacy addendum anytime.',
  },
  {
    q: 'Where can we download the security checklist?',
    a: 'Use the checklist card in the footer on this page, or jump to the download section below—same asset, updated as controls evolve.',
  },
];

export default function HomeFAQSection() {
  const [open, setOpen] = useState(-1);

  return (
    <section id="faq" className="py-[var(--spacing-section)] bg-white scroll-mt-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#F97316] font-semibold text-sm uppercase tracking-[0.2em]">FAQ</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
            Answers before you book a call
          </h2>
          <p className="mt-3 text-stone-600">
            Straightforward responses to what teams ask us first. For anything specific, use the contact form—we reply within one business day.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-stone-200/90 bg-stone-50/80 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 font-semibold text-stone-900 hover:bg-stone-100/80 transition"
                  aria-expanded={isOpen}
                >
                  <span className="pr-2" style={{ fontFamily: 'var(--font-display)' }}>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-[#7C3AED] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    strokeWidth={2}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-stone-600 text-sm sm:text-base leading-relaxed border-t border-stone-200/80 pt-4">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
