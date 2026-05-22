import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import RemoteImage from '../components/ui/RemoteImage';
import MotionLink from '../components/ui/MotionLink';
import { getFieldEngagement } from '../lib/aboutFieldData';

export default function AboutFieldDetail() {
  const { slug } = useParams();
  const item = getFieldEngagement(slug);

  if (!item) {
    return (
      <div className="pt-28 min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
          Engagement not found
        </h1>
        <p className="mt-2 text-stone-600 text-center max-w-md">
          The field engagement you’re looking for doesn’t exist or has been moved.
        </p>
        <Link to="/about" className="mt-6 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-semibold hover:bg-[#0284C7] transition">
          Back to About
        </Link>
      </div>
    );
  }

  const Icon = item.icon;

  return (
    <div className="pt-28 bg-white min-h-screen">
      <section className="relative overflow-hidden py-[var(--spacing-section)] bg-stone-50">
        <motion.div
          aria-hidden
          className="absolute -top-24 right-0 h-80 w-80 rounded-full blur-3xl opacity-40"
          style={{ backgroundColor: item.color }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/about" className="text-[#0EA5E9] text-sm font-semibold hover:underline">
            ← About Anmel Inc
          </Link>
          <div className="mt-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] ring-1"
                style={{ color: item.color, borderColor: `${item.color}44`, backgroundColor: `${item.color}12` }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {item.tag}
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
                {item.title}
              </h1>
              <p className="mt-5 text-lg text-stone-600 leading-relaxed">{item.overview}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <MotionLink
                  to="/contact"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-colors"
                  style={{ backgroundColor: item.color }}
                >
                  Discuss this engagement
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </MotionLink>
                <Link
                  to={`/services/${item.relatedService}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-white transition"
                >
                  Related service
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-stone-200/80 aspect-[4/3]"
            >
              <RemoteImage src={item.src} alt={item.alt} className="w-full h-full object-cover" fallbackSeed={item.seed} />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[var(--spacing-block)]">
        <div className="grid lg:grid-cols-3 gap-8 mb-14">
          {item.outcomes.map((o, i) => (
            <motion.div
              key={o.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-stone-200/80 bg-stone-50 p-6 text-center"
            >
              <div className="text-3xl font-bold tabular-nums" style={{ color: item.color, fontFamily: 'var(--font-display)' }}>
                {o.value}
              </div>
              <p className="mt-2 text-sm text-stone-600">{o.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              What we deliver
            </h2>
            <ul className="mt-6 space-y-4">
              {item.whatWeDo.map((line) => (
                <li key={line} className="flex gap-3 text-stone-600 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: item.color }} strokeWidth={2} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'var(--font-display)' }}>
              Key focus areas
            </h2>
            <ul className="mt-6 space-y-3">
              {item.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200/80 bg-white text-stone-700 font-medium"
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-stone-200 flex flex-wrap gap-3">
          <Link to="/about" className="text-[#0EA5E9] font-semibold hover:underline">
            ← Back to About
          </Link>
          <span className="text-stone-300">|</span>
          <Link to="/contact" className="text-stone-600 hover:text-stone-900 font-medium">
            Start a conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
