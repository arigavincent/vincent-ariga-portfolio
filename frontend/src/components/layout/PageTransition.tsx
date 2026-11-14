import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useLocation, useOutlet } from 'react-router';

import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useScrollTo } from '@/hooks/useScrollTo';

const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

/** Keeps rendering the route it was mounted with, so the old page stays intact while it exits. */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

/**
 * Animates between routes: a curtain rises over the old page, the scroll position resets behind
 * it, and the curtain lifts off the new one. Only the pathname triggers a transition, so in-page
 * section links do not.
 */
export function PageTransition() {
  const location = useLocation();
  const scrollTo = useScrollTo();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if (!window.location.hash) {
          scrollTo(0, { immediate: true });
        }
      }}
    >
      <motion.div key={location.pathname} className="relative">
        <motion.div
          initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: reducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <FrozenOutlet />
        </motion.div>

        {reducedMotion ? null : (
          <>
            <motion.div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-[65] origin-top bg-ink-950"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0, transition: { duration: 0.7, ease: easeInOutQuart } }}
              exit={{
                scaleY: 1,
                transformOrigin: 'bottom',
                transition: { duration: 0.6, ease: easeInOutQuart },
              }}
            />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none fixed inset-x-0 bottom-0 z-[66] h-1 origin-left bg-linear-to-r from-orange-500 to-gold-400"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 0 }}
              exit={{ scaleX: 1, transition: { duration: 0.6, ease: easeInOutQuart } }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
