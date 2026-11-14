import { useEffect } from 'react';
import { useRouteError } from 'react-router';

import { Button, Overline } from '@/components/ui';

/** Shown instead of a blank screen when a page throws while rendering or loading. */
export function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    console.error('A page failed to render', error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-ink-900 px-6 py-24">
      <title>Something went wrong | Vincent Ariga · A&amp;J</title>
      <meta name="robots" content="noindex" />
      <div className="flex max-w-xl flex-col items-start gap-8">
        <Overline>Unexpected error</Overline>
        <h1 className="font-display text-h1 font-extrabold">
          That broke<span className="text-orange-500">.</span>
        </h1>
        <p className="text-lead text-muted">
          Something went wrong while loading this page. Reloading usually fixes it.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload the page
          </Button>
          <Button href="/" variant="secondary" size="lg">
            Back home
          </Button>
        </div>
      </div>
    </main>
  );
}
