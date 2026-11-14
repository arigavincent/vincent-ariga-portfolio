import { AnimatePresence, motion } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useBooted } from '@/hooks/useBooted';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { loading } from '@/lib/loading';

import { classifyDevice, readDeviceTraits } from './deviceTier';

const LOADING_TASK = 'scene';
/** The scene is the heaviest thing on the page, so it weighs the most in the preloader. */
const LOADING_WEIGHT = 3;
/** How long after the preloader lifts a deferred scene waits, letting the page settle first. */
const DEFERRED_START_MS = 1200;

const SceneCanvas = lazy(async () => {
  const module = await import('./SceneCanvas');
  loading.report(LOADING_TASK, 0.6);
  return module;
});

interface SceneLayerProps {
  /** Reports whether the scene is currently drawn, so the page can adapt around it. */
  onActiveChange: (active: boolean) => void;
}

/**
 * The fixed 3D backdrop behind the home page. It decides whether this device gets a scene at
 * all, loads the WebGL code on demand, reports loading progress to the preloader, and falls back
 * silently to the CSS backdrop if anything goes wrong.
 */
export function SceneLayer({ onActiveChange }: SceneLayerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const tier = useMemo(() => classifyDevice(readDeviceTraits(reducedMotion)), [reducedMotion]);
  const isHome = useLocation().pathname === '/';
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const booted = useBooted();
  const [idle, setIdle] = useState(false);
  const wanted = isHome && tier !== 'none' && !failed;
  // Capable devices load the scene behind the preloader, so the hero is revealed complete.
  // Phones and modest hardware show the page first and bring the scene in once it is idle:
  // starting WebGL costs them close to a second of responsiveness.
  const deferred = tier === 'low';
  const mounted = wanted && (!deferred || idle);

  useEffect(() => {
    if (wanted && !deferred) {
      loading.register(LOADING_TASK, LOADING_WEIGHT);
    }
  }, [wanted, deferred]);

  useEffect(() => {
    if (!deferred || !booted) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setIdle(true);
    }, DEFERRED_START_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [deferred, booted]);

  useEffect(() => {
    onActiveChange(wanted && ready);
  }, [wanted, ready, onActiveChange]);

  const handleReady = useCallback(() => {
    loading.done(LOADING_TASK);
    setReady(true);
  }, []);

  const handleError = useCallback(() => {
    loading.done(LOADING_TASK);
    setFailed(true);
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setReady(false);
      }}
    >
      {mounted ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <ErrorBoundary fallback={null} onError={handleError}>
            <Suspense fallback={null}>
              <SceneCanvas tier={tier} onReady={handleReady} />
            </Suspense>
          </ErrorBoundary>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
