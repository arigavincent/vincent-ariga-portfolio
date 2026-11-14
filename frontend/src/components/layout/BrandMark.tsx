import { Link } from 'react-router';

import { useSettings } from '@/hooks/useSettings';
import { cn } from '@/lib/cn';

interface BrandMarkProps {
  className?: string;
  onNavigate?: () => void;
}

/** The A&J monogram with the name beside it, linking home. */
export function BrandMark({ className, onNavigate }: BrandMarkProps) {
  const { brandMark, displayName } = useSettings();

  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label={`${displayName} · ${brandMark}, home`}
      className={cn('group flex items-center gap-3', className)}
    >
      <span className="grid h-10 place-items-center rounded-xl border border-ink-600 bg-ink-850 px-3 font-display text-xs font-extrabold transition-colors duration-300 group-hover:border-orange-500">
        <span aria-hidden="true">
          A<span className="text-orange-500">&amp;</span>J
        </span>
      </span>
      <span
        className="hidden font-display text-sm font-bold tracking-tight sm:block"
        aria-hidden="true"
      >
        {displayName}
      </span>
    </Link>
  );
}
