import { cn } from '@/lib/cn';

interface StatusBadgeProps {
  /** Highlighted (gold) or quiet (grey). */
  tone: 'live' | 'quiet';
  children: string;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 font-mono text-xs',
        tone === 'live' ? 'border-gold-400/60 text-gold-300' : 'border-ink-600 text-warm-300',
      )}
    >
      {children}
    </span>
  );
}
