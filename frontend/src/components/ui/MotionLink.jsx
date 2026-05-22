import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/** Framer Motion 12+ — use motion.create() instead of deprecated motion(). */
const MotionLink = motion.create(Link);

export default MotionLink;
