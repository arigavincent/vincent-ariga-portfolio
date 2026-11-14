import { useLenis } from 'lenis/react';
import { useCallback } from 'react';

interface ScrollToOptions {
  immediate?: boolean;
}

/**
 * Scrolls to an element or position, through Lenis when it is active and natively otherwise.
 * Sections carry their own top padding, so an element target is aligned to the top of the
 * viewport and still clears the fixed header.
 */
export function useScrollTo() {
  const lenis = useLenis();

  return useCallback(
    (target: HTMLElement | number, { immediate = false }: ScrollToOptions = {}) => {
      if (lenis) {
        // A route change can alter the page height in the same frame; re-measure so the
        // destination is not clamped to the previous page's scroll range.
        lenis.resize();
        lenis.scrollTo(target, { immediate });
        return;
      }
      const behavior = immediate ? 'instant' : 'smooth';
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior });
      } else {
        target.scrollIntoView({ block: 'start', behavior });
      }
    },
    [lenis],
  );
}
