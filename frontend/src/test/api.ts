import { vi } from 'vitest';

import type { Project, ServiceOffering, SiteSettings, Skill } from '@/api/types';
import { fallbackSettings } from '@/lib/site';

export const settingsFixture: SiteSettings = {
  ...fallbackSettings,
  bio: 'First paragraph about me.\n\nSecond paragraph about me.',
  heritageNote: 'Proudly Gusii.',
  updatedAt: '2026-11-14T00:00:00Z',
};

export const projectFixture: Project = {
  id: 1,
  slug: 'aj-stream',
  title: 'AJ Stream',
  summary: 'A streaming platform with HLS playback.',
  description: 'First paragraph.\n\nSecond paragraph.',
  category: 'Streaming',
  techStack: ['Rust', 'SQLite', 'React'],
  highlights: ['HLS video playback'],
  coverImageUrl: null,
  repoUrl: null,
  liveUrl: null,
  featured: true,
  status: 'PUBLISHED',
  sortOrder: 1,
  updatedAt: '2026-11-14T00:00:00Z',
};

export const skillFixtures: Skill[] = [
  { id: 1, name: 'Java', category: 'BACKEND', detail: null, iconKey: 'java', sortOrder: 1 },
  { id: 2, name: 'Go', category: 'BACKEND', detail: 'Gin · Fiber', iconKey: 'go', sortOrder: 2 },
  { id: 3, name: 'React', category: 'FRONTEND', detail: null, iconKey: 'react', sortOrder: 3 },
  { id: 4, name: 'Docker', category: 'TOOLING', detail: null, iconKey: 'docker', sortOrder: 4 },
];

export const serviceFixtures: ServiceOffering[] = [
  {
    id: 1,
    title: 'Backend Development',
    description: 'Dependable services.',
    iconKey: 'server',
    sortOrder: 1,
  },
];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function notFound(path: string): Response {
  return json(
    { timestamp: '', status: 404, error: 'Not Found', message: `${path} was not found`, path },
    404,
  );
}

/**
 * Replaces fetch with a stub that serves the given bodies by request path. Unknown paths answer
 * with the backend's 404 error shape.
 */
export function stubApi(routes: Record<string, unknown>) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = new URL(url, 'http://localhost').pathname;
    return Promise.resolve(path in routes ? json(routes[path]) : notFound(path));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** The public API with seed-like content. */
export const publicApi: Record<string, unknown> = {
  '/api/settings': settingsFixture,
  '/api/blog': [],
  '/api/projects': [projectFixture],
  '/api/projects/aj-stream': projectFixture,
  '/api/skills': skillFixtures,
  '/api/services': serviceFixtures,
  '/api/experience': [
    {
      id: 1,
      title: 'Backend Engineer',
      organization: 'A&J',
      location: 'Kenya',
      startDate: null,
      endDate: null,
      current: true,
      description: 'Building products.',
      sortOrder: 1,
    },
  ],
  '/api/education': [
    {
      id: 1,
      institution: 'Kirinyaga University',
      qualification: 'BSc Information Technology',
      grade: 'Second Class Upper',
      startYear: null,
      endYear: 2026,
      description: null,
      sortOrder: 1,
    },
  ],
};
