import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function SectionReveal({ children, className = '' }) {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={item}>{child}</motion.div>
      )) : <motion.div variants={item}>{children}</motion.div>}
    </motion.section>
  );
}
