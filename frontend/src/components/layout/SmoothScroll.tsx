import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { gsap, ScrollTrigger } from '@/lib/gsap';

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Drives Lenis from GSAP's ticker, so smooth scrolling, scroll-linked animations and
 * ScrollTrigger all advance on the same frame. Rendered inside ReactLenis because the Lenis
 * instance only exists once that provider has mounted.
 */
function LenisTicker() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }
    function update(time: number) {
      lenis?.raf(time * 1000);
    }
    function syncScrollTrigger() {
      ScrollTrigger.update();
    }
    lenis.on('scroll', syncScrollTrigger);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off('scroll', syncScrollTrigger);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}

/** Lenis smooth scrolling for the whole page. Native scrolling is kept under reduced motion. */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, anchors: false }}>
      <LenisTicker />
      {children}
    </ReactLenis>
  );
}
