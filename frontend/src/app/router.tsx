import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

import { RouteFallback } from './RouteFallback';

/**
 * A page whose code is downloaded the first time it is visited. It suspends inside its own
 * boundary, so the page transition around it keeps working while the code loads.
 */
function lazyPage(load: () => Promise<ComponentType>) {
  const Page = lazy(async () => ({ default: await load() }));
  return (
    <Suspense fallback={<RouteFallback />}>
      <Page />
    </Suspense>
  );
}

/** The design-system reference is a development tool and is left out of production builds. */
const developmentRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'styleguide',
        element: lazyPage(async () => (await import('@/pages/StyleguidePage')).StyleguidePage),
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    // The admin area is its own chunk, outside the public site's shell.
    path: 'admin/*',
    errorElement: <RouteErrorPage />,
    element: lazyPage(async () => (await import('@/features/admin/AdminApp')).AdminApp),
  },
  {
    element: <SiteLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      // The Markdown renderer stays out of the first bundle.
      { path: 'blog', element: lazyPage(async () => (await import('@/pages/BlogPage')).BlogPage) },
      {
        path: 'blog/:slug',
        element: lazyPage(async () => (await import('@/pages/BlogPostPage')).BlogPostPage),
      },
      ...developmentRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}
