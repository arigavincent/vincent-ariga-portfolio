import { useLenis } from 'lenis/react';
import { useEffect } from 'react';

/** Stops the page from scrolling while `locked` is true (menus, the preloader). */
export function useScrollLock(locked: boolean): void {
  const lenis = useLenis();

  useEffect(() => {
    if (!locked) {
      return;
    }
    lenis?.stop();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
      lenis?.start();
    };
  }, [locked, lenis]);
}
