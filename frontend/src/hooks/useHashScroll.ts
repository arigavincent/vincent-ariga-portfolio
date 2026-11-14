import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useBooted } from './useBooted';
import { useScrollTo } from './useScrollTo';

/** Scrolls to the section named in the URL hash, on load and whenever the hash changes. */
export function useHashScroll(): void {
  const { hash, key } = useLocation();
  const booted = useBooted();
  const scrollTo = useScrollTo();

  useEffect(() => {
    if (!booted || !hash) {
      return;
    }
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      scrollTo(target);
    }
  }, [hash, key, booted, scrollTo]);
}
