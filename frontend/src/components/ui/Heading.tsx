import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Reveal } from './Reveal';
import { SplitText } from './SplitText';

interface OverlineProps {
  /** Two-digit section number shown before the label. */
  index?: string;
  children: ReactNode;
  className?: string;
}

/** The gold, letter-spaced label that sits above headings. */
export function Overline({ index, children, className }: OverlineProps) {
  return (
    <p className={cn('flex items-center gap-3 eyebrow', className)}>
      {index ? (
        <>
          <span>{index}</span>
          <span aria-hidden="true" className="h-px w-8 bg-warm-500" />
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

interface HeadingProps {
  id?: string;
  overline?: string;
  index?: string;
  title: string;
  /** Supporting sentence under the title. */
  lead?: ReactNode;
  level?: 'h1' | 'h2';
  align?: 'left' | 'center';
  className?: string;
}

/** Section heading: overline, a word-by-word revealed title and an optional lead. */
export function Heading({
  id,
  overline,
  index,
  title,
  lead,
  level = 'h2',
  align = 'left',
  className,
}: HeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-4xl flex-col gap-6',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {overline ? (
        <Reveal distance={12}>
          <Overline index={index}>{overline}</Overline>
        </Reveal>
      ) : null}
      <SplitText
        as={level}
        id={id}
        text={title}
        className={cn(
          'font-display font-extrabold text-balance',
          level === 'h1' ? 'text-h1' : 'text-h2',
        )}
      />
      {lead ? (
        <Reveal delay={0.15}>
          <p className="max-w-2xl text-lead text-muted">{lead}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
