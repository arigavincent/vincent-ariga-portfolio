import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

/** A pulsing placeholder shown while content loads. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-ink-800', className)} />
  );
}
