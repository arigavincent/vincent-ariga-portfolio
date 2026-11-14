import { motion, useScroll, useSpring } from 'motion/react';

/** A hairline at the top of the viewport that fills as the page is read. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-linear-to-r from-orange-500 to-gold-400"
      style={{ scaleX }}
    />
  );
}
