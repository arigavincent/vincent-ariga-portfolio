import { noop, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queries } from '@/api/public';
import { loading } from '@/lib/loading';

/** If something never reports back, the preloader gives up waiting after this long. */
const SAFETY_TIMEOUT_MS = 10_000;

/**
 * Registers the real work the first paint depends on (fonts and the first API data) with the
 * loading registry, which drives the preloader. A failed request still completes its task: the
 * page falls back to built-in content rather than staying behind the curtain.
 */
export function useBootLoading(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    loading.register('fonts', 1);
    loading.register('settings', 1);
    loading.register('content', 2);

    // FontFaceSet is missing in a few older browsers; treat fonts as ready there.
    const fonts = document.fonts as FontFaceSet | undefined;
    void (fonts?.ready ?? Promise.resolve()).then(() => {
      loading.done('fonts');
    });
    void queryClient
      .query(queries.settings())
      .catch(noop)
      .finally(() => {
        loading.done('settings');
      });

    const content: Promise<unknown>[] = [
      queryClient.query(queries.projects()),
      queryClient.query(queries.skills()),
      queryClient.query(queries.services()),
    ];
    let finished = 0;
    for (const request of content) {
      void request.catch(noop).finally(() => {
        finished += 1;
        loading.report('content', finished / content.length);
      });
    }

    const timeout = window.setTimeout(() => {
      loading.finishAll();
    }, SAFETY_TIMEOUT_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [queryClient]);
}
