import { motion, useMotionValue, useSpring } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

import { Button, type ButtonProps } from './Button';

interface MagneticProps {
  children: ReactNode;
  /** How far the element follows the pointer, as a fraction of the pointer's offset. */
  strength?: number;
  className?: string;
}

const spring = { stiffness: 220, damping: 16, mass: 0.4 };

/** Pulls its child towards the pointer while hovered. Inactive on touch and reduced motion. */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = finePointer && !reducedMotion;

  function handleMove(event: PointerEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  if (!enabled) {
    return <span className={cn('inline-block', className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn('inline-block', className)}
      style={{ x: springX, y: springY }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.span>
  );
}

/** A {@link Button} that is magnetically attracted to the pointer. */
export function MagneticButton(props: ButtonProps) {
  return (
    <Magnetic>
      <Button {...props} />
    </Magnetic>
  );
}
