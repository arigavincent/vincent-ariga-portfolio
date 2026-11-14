import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { loading } from '@/lib/loading';

/** jsdom has no layout engine, so the browser APIs our components observe need stand-ins. */
class NoopObserver {
  observe(): void {
    /* nothing to observe without layout */
  }
  unobserve(): void {
    /* nothing to observe without layout */
  }
  disconnect(): void {
    /* nothing to observe without layout */
  }
  takeRecords(): [] {
    return [];
  }
}

// Assigned directly rather than with vi.stubGlobal, so tests that call vi.unstubAllGlobals() to
// restore fetch do not remove them.
globalThis.IntersectionObserver = NoopObserver as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = NoopObserver;
window.matchMedia = (query: string): MediaQueryList =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }) as unknown as MediaQueryList;
window.scrollTo = vi.fn();

afterEach(() => {
  cleanup();
  loading.reset();
});
