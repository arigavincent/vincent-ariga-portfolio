import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BlogPost, Project } from '@/api/types';
import { SkillsSection } from '@/features/home/SkillsSection';
import { coverArt } from '@/features/projects/coverArt';
import { ProjectCover } from '@/features/projects/ProjectCover';
import { ProjectPager } from '@/features/projects/ProjectPager';
import { skillIcon, skillInitials } from '@/features/skills/skillIcons';
import { formatLongDate } from '@/lib/format';
import { BlogPage } from '@/pages/BlogPage';
import { BlogPostPage } from '@/pages/BlogPostPage';
import { projectFixture, publicApi, skillFixtures, stubApi } from '@/test/api';
import { renderRoutes, renderWithProviders } from '@/test/render';

const secondProject: Project = {
  ...projectFixture,
  id: 2,
  slug: 'mpesa-tms',
  title: 'M-Pesa TMS',
  sortOrder: 2,
};
const thirdProject: Project = {
  ...projectFixture,
  id: 3,
  slug: 'berea-bible',
  title: 'Berea Bible',
  sortOrder: 3,
};

const post: BlogPost = {
  id: 1,
  slug: 'hello-world',
  title: 'Hello, world',
  excerpt: 'A first post.',
  content:
    '## Why Spring Boot\n\nBecause it is **dependable**. See [the docs](https://spring.io).\n\n`./gradlew build`\n\n<script>alert("x")</script>',
  coverImageUrl: null,
  tags: ['java', 'spring'],
  status: 'PUBLISHED',
  publishedAt: '2026-11-14T08:00:00Z',
  updatedAt: '2026-11-14T08:00:00Z',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('skills', () => {
  it('maps icon keys to logos and falls back to initials', () => {
    expect(skillIcon('java')?.title).toBe('OpenJDK');
    expect(skillIcon('SPRING')?.title).toBe('Spring Boot');
    expect(skillIcon('unknown')).toBeUndefined();
    expect(skillIcon(null)).toBeUndefined();
    expect(skillInitials('Git & GitHub')).toBe('GG');
    expect(skillInitials('Kotlin')).toBe('KO');
  });

  it('lists skills by category and names the hovered skill in the orbit', async () => {
    stubApi(publicApi);
    const user = userEvent.setup();
    renderWithProviders(<SkillsSection />);

    const go = await screen.findByText('Go');
    expect(screen.getByRole('heading', { level: 3, name: 'Backend' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Frontend' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Tooling' })).toBeInTheDocument();
    expect(screen.getByText('Gin · Fiber')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(skillFixtures.length);

    // The orbit's centre shows the brand mark until a skill is hovered, then that skill's name.
    expect(screen.getAllByText('Go')).toHaveLength(1);
    await user.hover(go);
    expect(screen.getAllByText('Go')).toHaveLength(2);
    await user.unhover(go);
    expect(screen.getAllByText('Go')).toHaveLength(1);
  });
});

describe('project covers', () => {
  it('always generates the same art for the same project, and different art for others', () => {
    expect(coverArt('aj-stream')).toEqual(coverArt('aj-stream'));
    expect(coverArt('aj-stream')).not.toEqual(coverArt('mpesa-tms'));
    const art = coverArt('shekinah-sons-global');
    expect(art.pattern).toBeGreaterThanOrEqual(0);
    expect(art.pattern).toBeLessThan(4);
    expect(art.glowX).toBeGreaterThanOrEqual(25);
    expect(art.glowX).toBeLessThanOrEqual(75);
  });

  it('draws generated art until a real cover image has been uploaded', () => {
    const { container, rerender } = renderWithProviders(<ProjectCover project={projectFixture} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();

    rerender(
      <ProjectCover project={{ ...projectFixture, coverImageUrl: '/api/files/cover.png' }} />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', '/api/files/cover.png');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});

describe('ProjectPager', () => {
  it('links to the neighbouring projects and wraps around at the ends', async () => {
    stubApi({ ...publicApi, '/api/projects': [projectFixture, secondProject, thirdProject] });
    renderWithProviders(<ProjectPager slug="aj-stream" />);

    const nav = await screen.findByRole('navigation', { name: 'More projects' });
    const [previous, next] = within(nav).getAllByRole('link');
    expect(previous).toHaveTextContent('Previous project');
    expect(previous).toHaveAttribute('href', '/projects/berea-bible');
    expect(next).toHaveTextContent('Next project');
    expect(next).toHaveAttribute('href', '/projects/mpesa-tms');
  });

  it('renders nothing when there is only one project', async () => {
    stubApi(publicApi);
    const { container } = renderWithProviders(<ProjectPager slug="aj-stream" />);

    await screen.findByText(() => true).catch(() => null);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });
});

describe('blog', () => {
  const blogRoutes = [
    { path: '/blog', element: <BlogPage /> },
    { path: '/blog/:slug', element: <BlogPostPage /> },
  ];

  it('says so plainly when nothing has been published', async () => {
    stubApi(publicApi);
    renderRoutes(blogRoutes, '/blog');

    expect(await screen.findByText('Nothing published yet.')).toBeInTheDocument();
  });

  it('lists published posts with their date and tags', async () => {
    stubApi({ ...publicApi, '/api/blog': [post] });
    renderRoutes(blogRoutes, '/blog');

    const link = await screen.findByRole('link', { name: /Hello, world/ });
    expect(link).toHaveAttribute('href', '/blog/hello-world');
    expect(within(link).getByText('14 November 2026')).toBeInTheDocument();
    expect(within(link).getByText('spring')).toBeInTheDocument();
  });

  it('renders a post from Markdown without executing raw HTML', async () => {
    stubApi({ ...publicApi, '/api/blog/hello-world': post });
    const { container } = renderRoutes(blogRoutes, '/blog/hello-world');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Hello, world' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Why Spring Boot' })).toBeInTheDocument();
    expect(screen.getByText('dependable').tagName).toBe('STRONG');
    const docs = screen.getByRole('link', { name: 'the docs' });
    expect(docs).toHaveAttribute('href', 'https://spring.io');
    expect(docs).toHaveAttribute('rel', 'noreferrer');
    expect(screen.getByText('./gradlew build').tagName).toBe('CODE');
    expect(container.querySelector('script')).not.toBeInTheDocument();
  });

  it('formats publication dates', () => {
    expect(formatLongDate('2026-11-14T08:00:00Z')).toBe('14 November 2026');
  });
});
