import { motion } from 'framer-motion';
import heroCutoutWebp from '../../images/scholarship-student-cutout.webp';
import heroCutoutPng from '../../images/scholarship-student-cutout.png';

const FALLBACK_SRC =
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&h=1100&q=85';

export default function ScholarshipSectionHero() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-none lg:w-full flex items-center justify-center"
    >
      <picture>
        <source srcSet={heroCutoutWebp} type="image/webp" />
        <img
          src={heroCutoutPng}
          alt="Student wearing Anmei orange shirt"
          width={720}
          height={900}
          className="w-full h-auto max-h-[520px] sm:max-h-[600px] lg:max-h-[720px] xl:max-h-[780px] object-contain object-center scale-[1.05] lg:scale-[1.08]"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_SRC;
          }}
        />
      </picture>
    </motion.div>
  );
}
