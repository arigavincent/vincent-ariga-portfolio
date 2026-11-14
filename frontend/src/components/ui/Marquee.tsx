import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  /** Accessible name for the strip. Without it the marquee is treated as decoration. */
  label?: string;
}

/**
 * An endlessly scrolling strip. The content is rendered twice so the loop is seamless; the copy
 * is hidden from assistive technology. Pure CSS, so it stops under prefers-reduced-motion.
 */
export function Marquee({
  children,
  duration = 30,
  reverse = false,
  pauseOnHover = false,
  className,
  label,
}: MarqueeProps) {
  const style = {
    '--marquee-duration': `${duration}s`,
    animationDirection: reverse ? 'reverse' : 'normal',
  } as CSSProperties;

  return (
    <div
      className={cn('group/marquee flex overflow-hidden', className)}
      {...(label ? { role: 'group', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <div
        className={cn(
          'flex w-max shrink-0 animate-marquee will-change-transform',
          pauseOnHover && 'group-hover/marquee:[animation-play-state:paused]',
        )}
        style={style}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
