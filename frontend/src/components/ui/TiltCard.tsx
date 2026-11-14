import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';

import { useFinePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  maxTilt?: number;
}

const spring = { stiffness: 180, damping: 18, mass: 0.5 };

/**
 * A card that tilts in 3D towards the pointer, with a soft highlight that follows it. Falls back
 * to a flat card on touch devices and when reduced motion is requested.
 */
export function TiltCard({ children, className, maxTilt = 9 }: TiltCardProps) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-maxTilt, maxTilt]), spring);
  const glareX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glareY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, color-mix(in oklab, var(--color-orange-500) 22%, transparent), transparent 65%)`;
  const finePointer = useFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = finePointer && !reducedMotion;

  function handleMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  if (!enabled) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <div className="[perspective:1200px]">
      <motion.div
        className={cn('group/tilt relative [transform-style:preserve-3d]', className)}
        style={{ rotateX, rotateY }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}
