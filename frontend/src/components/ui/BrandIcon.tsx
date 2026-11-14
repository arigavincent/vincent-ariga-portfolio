import type { SimpleIcon } from 'simple-icons';

import { cn } from '@/lib/cn';

interface BrandIconProps {
  icon: SimpleIcon;
  className?: string;
}

/** Renders a Simple Icons brand logo in the current text colour. Decorative by default. */
export function BrandIcon({ icon, className }: BrandIconProps) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-4', className)}
    >
      <path d={icon.path} />
    </svg>
  );
}
