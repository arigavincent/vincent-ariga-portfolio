import { motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

type CursorMode = 'default' | 'interactive' | 'label' | 'text';

interface CursorState {
  mode: CursorMode;
  label: string;
  pressed: boolean;
  onScreen: boolean;
}

const INTERACTIVE = 'a, button, [role="button"], summary, label, select, [data-cursor]';
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]';
const ringSpring = { stiffness: 260, damping: 26, mass: 0.6 };

function resolveMode(target: EventTarget | null): Pick<CursorState, 'mode' | 'label'> {
  if (!(target instanceof Element)) {
    return { mode: 'default', label: '' };
  }
  const labelled = target.closest<HTMLElement>('[data-cursor-label]');
  if (labelled?.dataset.cursorLabel) {
    return { mode: 'label', label: labelled.dataset.cursorLabel };
  }
  if (target.closest(TEXT_FIELD)) {
    return { mode: 'text', label: '' };
  }
  if (target.closest(INTERACTIVE)) {
    return { mode: 'interactive', label: '' };
  }
  return { mode: 'default', label: '' };
}

/**
 * A dot with a trailing ring that replaces the system cursor on devices with a mouse. The ring
 * grows over anything clickable, and elements with data-cursor-label="View" turn it into a
 * labelled badge. Never rendered on touch devices or under reduced motion.
 */
export function CustomCursor() {
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = finePointer && !reducedMotion;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, ringSpring);
  const ringY = useSpring(y, ringSpring);
  const [state, setState] = useState<CursorState>({
    mode: 'default',
    label: '',
    pressed: false,
    onScreen: false,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    function handleMove(event: PointerEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      const next = resolveMode(event.target);
      setState((current) =>
        current.mode === next.mode && current.label === next.label && current.onScreen
          ? current
          : { ...current, ...next, onScreen: true },
      );
    }
    function handleDown() {
      setState((current) => ({ ...current, pressed: true }));
    }
    function handleUp() {
      setState((current) => ({ ...current, pressed: false }));
    }
    function handleLeave() {
      setState((current) => ({ ...current, onScreen: false }));
    }

    window.addEventListener('pointermove', handleMove, { passive: true });
    window.addEventListener('pointerdown', handleDown, { passive: true });
    window.addEventListener('pointerup', handleUp, { passive: true });
    root.addEventListener('pointerleave', handleLeave);
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      root.removeEventListener('pointerleave', handleLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) {
    return null;
  }

  const { mode, label, pressed, onScreen } = state;
  const shown = onScreen && mode !== 'text';
  const ringScale = pressed ? 0.8 : 1;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <motion.div
        className={cn(
          'absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-orange-500 transition-opacity duration-200',
          shown && mode === 'default' ? 'opacity-100' : 'opacity-0',
        )}
        style={{ x, y }}
      />
      <motion.div className="absolute top-0 left-0" style={{ x: ringX, y: ringY }}>
        <motion.div
          className={cn(
            'grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-300 ease-out-expo',
            mode === 'label'
              ? 'size-20 border-orange-500 bg-orange-500'
              : mode === 'interactive'
                ? 'size-14 border-gold-400 bg-gold-400/10'
                : 'size-9 border-white/40 bg-transparent',
            shown ? 'opacity-100' : 'opacity-0',
          )}
          animate={{ scale: ringScale }}
          transition={{ duration: 0.2 }}
        >
          {mode === 'label' ? (
            <span className="font-mono text-[0.65rem] font-semibold tracking-overline text-ink-950 uppercase">
              {label}
            </span>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}
