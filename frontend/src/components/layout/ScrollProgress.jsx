import { motion, useScroll } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[100] rounded-r-full"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, var(--color-sky) 0%, var(--color-purple) 50%, var(--color-orange) 100%)',
      }}
    />
  );
}
