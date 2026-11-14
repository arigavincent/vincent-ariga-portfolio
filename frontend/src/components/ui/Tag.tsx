import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface TagProps {
  children: ReactNode;
  className?: string;
}

/** A small pill for tech names and categories. */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-ink-600 bg-ink-900/60 px-3 py-1 font-mono text-xs text-warm-300',
        className,
      )}
    >
      {children}
    </span>
  );
}
