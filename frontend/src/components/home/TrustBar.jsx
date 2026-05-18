import { motion } from 'framer-motion';

const stats = [
  { value: '150+', label: 'Projects delivered' },
  { value: '98%', label: 'Client retention' },
  { value: '24hr', label: 'Avg. response time' },
  { value: '12+', label: 'Industries served' },
];

export default function TrustBar() {
  return (
    <section className="py-14 bg-stone-900 relative overflow-hidden">
      {/* blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 opacity-8">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-purple/20 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-sky/15 blur-[100px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/3 hover:bg-white/6 transition-colors px-6 py-7 text-center"
            >
              <span
                className="block text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {s.value}
              </span>
              <span className="block mt-1 text-sm text-stone-400 font-medium">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
