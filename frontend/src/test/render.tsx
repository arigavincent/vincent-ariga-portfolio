import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { MotionConfig } from 'motion/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

function createTestQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
}

/** Renders a set of routes at a starting URL with the app's providers. */
export function renderRoutes(routes: RouteObject[], initialPath = '/'): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MotionConfig reducedMotion="always">
        <RouterProvider router={router} />
      </MotionConfig>
    </QueryClientProvider>,
  );
}

/** Renders a single element inside a router and the app's providers. */
export function renderWithProviders(ui: ReactElement, initialPath = '/'): RenderResult {
  return renderRoutes([{ path: '*', element: ui }], initialPath);
}
