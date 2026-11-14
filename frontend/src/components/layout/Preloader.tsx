import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { useLoadingProgress } from '@/hooks/useLoadingProgress';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useSettings } from '@/hooks/useSettings';

interface PreloaderProps {
  /** Called once the curtain has fully lifted. */
  onFinished: () => void;
}

/** Earliest moment after page load that the preloader may lift, so a warm cache does not produce a flash. */
const MIN_VISIBLE_MS = 900;
const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

/**
 * The opening curtain. The counter follows real loading progress from the loading registry (fonts,
 * first API data, the 3D scene); it eases towards that value but never runs ahead of it.
 */
export function Preloader({ onFinished }: PreloaderProps) {
  const { progress, complete } = useLoadingProgress();
  const reducedMotion = usePrefersReducedMotion();
  const settings = useSettings();
  const [visible, setVisible] = useState(true);
  const [settled, setSettled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  useScrollLock(visible);

  useEffect(() => {
    target.current = progress;
  }, [progress]);

  // The counter eases towards real progress every frame. It writes straight to the DOM: sixty
  // React renders a second during loading would compete with the work being waited for.
  useEffect(() => {
    let frame = 0;
    let displayed = 0;
    let shownPercent = -1;
    function tick() {
      displayed += (target.current - displayed) * 0.12;
      if (target.current - displayed < 0.002) {
        displayed = target.current;
      }
      const percent = Math.round(displayed * 100);
      if (percent !== shownPercent) {
        shownPercent = percent;
        if (counter.current) {
          counter.current.textContent = String(percent).padStart(2, '0');
        }
        root.current?.setAttribute('aria-label', `Loading ${percent}%`);
      }
      if (bar.current) {
        bar.current.style.transform = `scaleX(${displayed})`;
      }
      if (displayed >= 0.999) {
        setSettled(true);
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!complete || !settled) {
      return;
    }
    const timeout = window.setTimeout(
      () => {
        setVisible(false);
      },
      Math.max(0, MIN_VISIBLE_MS - performance.now()),
    );
    return () => {
      window.clearTimeout(timeout);
    };
  }, [complete, settled]);

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {visible ? (
        <motion.div
          ref={root}
          className="fixed inset-0 z-[90] flex flex-col justify-between bg-ink-950"
          role="status"
          aria-live="polite"
          aria-label="Loading 0%"
          exit={reducedMotion ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: reducedMotion ? 0.2 : 0.9, ease: easeInOutQuart }}
          style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        >
          <div className="container-page flex items-center justify-between pt-8">
            <p className="font-display text-lg font-extrabold" aria-hidden="true">
              A<span className="text-orange-500">&amp;</span>J
            </p>
            <p className="eyebrow" aria-hidden="true">
              {settings.tagline}
            </p>
          </div>

          <div className="container-page pb-10" aria-hidden="true">
            <div className="flex items-end justify-between gap-6">
              <p className="max-w-[14ch] font-mono text-xs leading-relaxed tracking-overline text-warm-300 uppercase">
                {settings.displayName}
                <br />
                {settings.role}
              </p>
              <p className="font-display text-display font-extrabold tabular-nums">
                <span ref={counter}>00</span>
                <span className="text-orange-500">%</span>
              </p>
            </div>
            <div className="mt-6 h-px w-full bg-ink-700">
              <div
                ref={bar}
                className="h-full origin-left scale-x-0 bg-linear-to-r from-orange-500 to-gold-400"
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
