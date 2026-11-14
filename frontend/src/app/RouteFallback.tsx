import { LoaderCircle } from 'lucide-react';

/** Shown while a lazily loaded route's code is still downloading. */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="grid min-h-dvh place-items-center bg-ink-900"
    >
      <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-gold-400" />
    </div>
  );
}
