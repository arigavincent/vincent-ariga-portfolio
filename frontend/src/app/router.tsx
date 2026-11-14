import { createBrowserRouter, type RouteObject } from 'react-router';

import { SiteLayout } from '@/components/layout/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectsPage } from '@/pages/ProjectsPage';

import { RouteFallback } from './RouteFallback';

/** The design-system reference is a development tool and is left out of production builds. */
const developmentRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'styleguide',
        hydrateFallbackElement: <RouteFallback />,
        lazy: async () => {
          const { StyleguidePage } = await import('@/pages/StyleguidePage');
          return { Component: StyleguidePage };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    // The admin area is its own lazy chunk, outside the public site's shell.
    path: 'admin/*',
    hydrateFallbackElement: <RouteFallback />,
    lazy: async () => {
      const { AdminApp } = await import('@/features/admin/AdminApp');
      return { Component: AdminApp };
    },
  },
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      {
        path: 'blog',
        hydrateFallbackElement: <RouteFallback />,
        lazy: async () => {
          const { BlogPage } = await import('@/pages/BlogPage');
          return { Component: BlogPage };
        },
      },
      {
        path: 'blog/:slug',
        hydrateFallbackElement: <RouteFallback />,
        lazy: async () => {
          const { BlogPostPage } = await import('@/pages/BlogPostPage');
          return { Component: BlogPostPage };
        },
      },
      ...developmentRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createRouter() {
  return createBrowserRouter(routes);
}
