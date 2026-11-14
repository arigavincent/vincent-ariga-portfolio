import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface SectionProps {
  id?: string;
  /** Id of the heading that names this section. */
  labelledBy?: string;
  className?: string;
  /** Set false to manage horizontal padding yourself (for full-bleed content). */
  contained?: boolean;
  children: ReactNode;
}

/** A page section with the standard vertical rhythm and page container. */
export function Section({ id, labelledBy, className, contained = true, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn('relative py-section', className)}>
      {contained ? <div className="container-page">{children}</div> : children}
    </section>
  );
}
