import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Button } from './Button';

interface QueryContentProps<T> {
  query: UseQueryResult<T>;
  /** Placeholder shown while the first load is in flight. */
  skeleton: ReactNode;
  /** Shown when the request succeeded but there is nothing to list. */
  empty?: ReactNode;
  /** What is being loaded, used in the error message ("projects", "skills"). */
  label: string;
  children: (data: T) => ReactNode;
}

/** Renders the loading, error, empty and loaded states of a query the same way everywhere. */
export function QueryContent<T>({ query, skeleton, empty, label, children }: QueryContentProps<T>) {
  if (query.isPending) {
    return (
      <div role="status" aria-label={`Loading ${label}`}>
        {skeleton}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-4 rounded-card border border-ink-700 bg-ink-850 p-6"
      >
        <p className="text-muted">Could not load the {label} right now.</p>
        <Button
          variant="secondary"
          onClick={() => {
            void query.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }
  if (Array.isArray(query.data) && query.data.length === 0 && empty !== undefined) {
    return <>{empty}</>;
  }
  return <>{children(query.data)}</>;
}
