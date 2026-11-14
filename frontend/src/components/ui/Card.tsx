import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/lib/cn';

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** Adds the animated orange-to-gold border. */
  glow?: boolean;
}

/** An elevated surface on the ink base. */
export function Card({ glow = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-card bg-ink-850 p-6 shadow-card sm:p-8',
        glow ? 'gradient-border' : 'border border-ink-700',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
