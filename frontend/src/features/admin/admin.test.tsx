import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { auth } from '@/api/auth';
import type { ContactMessage, Project } from '@/api/types';
import { projectFixture, settingsFixture } from '@/test/api';
import { renderRoutes } from '@/test/render';
import { session, stubServer, unauthorized } from '@/test/server';

import { AdminApp } from './AdminApp';
import { blankToNull, linesToList, listToLines, slugify, yearToNumber } from './formValues';

const routes = [{ path: '/admin/*', element: <AdminApp /> }];

const message: ContactMessage = {
  id: 7,
  name: 'Wanjiru Kamau',
  email: 'wanjiru@example.com',
  subject: 'Backend role',
  message: 'We have a backend role you might like.',
  status: 'NEW',
  createdAt: '2026-11-14T08:00:00Z',
};

/** A signed-in backend: the refresh cookie is valid and the content endpoints answer. */
function signedInServer(overrides: Parameters<typeof stubServer>[0] = {}) {
  return stubServer({
    'POST /api/auth/refresh': () => session('token-1'),
    'GET /api/admin/messages/unread-count': () => ({ body: { unread: 2 } }),
    'GET /api/admin/projects': () => ({ body: [projectFixture] }),
    'GET /api/admin/skills': () => ({ body: [] }),
    'GET /api/admin/services': () => ({ body: [] }),
    'GET /api/admin/blog': () => ({ body: [] }),
    ...overrides,
  });
}

afterEach(() => {
  // Unmount first: a mounted guard would react to the reset by starting a new refresh.
  cleanup();
  auth.reset();
  vi.unstubAllGlobals();
});

describe('form value helpers', () => {
  it('converts between lines and lists', () => {
    expect(linesToList(' Java \n\n Spring Boot\n')).toEqual(['Java', 'Spring Boot']);
    expect(listToLines(['Java', 'Go'])).toBe('Java\nGo');
  });

  it('treats blank input as not set', () => {
    expect(blankToNull('   ')).toBeNull();
    expect(blankToNull(' x ')).toBe('x');
    expect(yearToNumber('')).toBeNull();
    expect(yearToNumber('2026')).toBe(2026);
  });

  it('makes URL-safe slugs', () => {
    expect(slugify('M-Pesa TMS (LAN)')).toBe('m-pesa-tms-lan');
    expect(slugify('  Café & Co.  ')).toBe('cafe-co');
  });
});

describe('admin area', () => {
  it('sends visitors without a session to the sign-in page', async () => {
    stubServer({ 'POST /api/auth/refresh': () => unauthorized });
    renderRoutes(routes, '/admin/projects');

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('signs in and returns to the page that was asked for', async () => {
    let signedIn = false;
    const server = stubServer({
      'POST /api/auth/refresh': () => (signedIn ? session('token-2') : unauthorized),
      'POST /api/auth/login': () => {
        signedIn = true;
        return session('token-1');
      },
      'GET /api/admin/messages/unread-count': () => ({ body: { unread: 0 } }),
      'GET /api/admin/projects': () => ({ body: [projectFixture] }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/projects');

    await user.type(await screen.findByLabelText('Username'), 'vincent');
    await user.type(screen.getByLabelText('Password'), 'a-long-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('heading', { name: 'Projects' })).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: 'AJ Stream' })).toBeInTheDocument();
    expect(server.find('GET', '/api/admin/projects').at(-1)?.authorization).toBe('Bearer token-1');
  });

  it('explains a wrong password without leaving the form', async () => {
    stubServer({
      'POST /api/auth/refresh': () => unauthorized,
      'POST /api/auth/login': () => unauthorized,
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/login');

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter your username')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Username'), 'vincent');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That username or password is not right.',
    );
  });

  it('shows the dashboard with counts and the unread badge', async () => {
    signedInServer();
    renderRoutes(routes, '/admin');

    expect(
      await screen.findByRole('heading', { name: 'Welcome back, vincent.' }),
    ).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Admin' });
    expect(await within(nav).findByLabelText('2 unread')).toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/admin/projects',
    );
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Unread messages/ })).toHaveTextContent('2');
    });
  });

  it('creates a project from the form and sends the API the right payload', async () => {
    const created: Project = { ...projectFixture, id: 9, slug: 'new-thing', title: 'New Thing' };
    const server = signedInServer({
      'POST /api/admin/projects': () => ({ status: 201, body: created }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/projects/new');

    await user.type(await screen.findByLabelText('Title'), 'New Thing');
    await user.click(screen.getByLabelText('Slug'));
    await user.tab();
    expect(screen.getByLabelText('Slug')).toHaveValue('new-thing');
    await user.type(screen.getByLabelText('Category'), 'Testing');
    await user.selectOptions(screen.getByLabelText('Status'), 'PUBLISHED');
    await user.type(screen.getByLabelText('Summary'), 'A short summary.');
    await user.type(screen.getByLabelText('Description'), 'A longer description.');
    await user.type(screen.getByLabelText('Tech stack'), 'Java{Enter}Spring Boot');
    await user.click(screen.getByLabelText('Feature on the home page'));
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Saved "New Thing".');
    expect(server.find('POST', '/api/admin/projects')[0]?.body).toEqual({
      title: 'New Thing',
      slug: 'new-thing',
      category: 'Testing',
      status: 'PUBLISHED',
      summary: 'A short summary.',
      description: 'A longer description.',
      techStack: ['Java', 'Spring Boot'],
      highlights: [],
      coverImageUrl: null,
      repoUrl: null,
      liveUrl: null,
      sortOrder: 0,
      featured: true,
    });
  });

  it('validates before saving and shows the server error for a taken slug', async () => {
    const server = signedInServer({
      'POST /api/admin/projects': () => ({
        status: 409,
        body: {
          timestamp: '',
          status: 409,
          error: 'Conflict',
          message: "The slug 'aj-stream' is already in use",
          path: '',
        },
      }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/projects/new');

    await user.click(await screen.findByRole('button', { name: 'Create project' }));
    expect(await screen.findByText('Add a title')).toBeInTheDocument();
    expect(server.find('POST', '/api/admin/projects')).toHaveLength(0);

    await user.type(screen.getByLabelText('Title'), 'AJ Stream');
    await user.type(screen.getByLabelText('Slug'), 'aj-stream');
    await user.type(screen.getByLabelText('Category'), 'Streaming');
    await user.type(screen.getByLabelText('Summary'), 'Summary.');
    await user.type(screen.getByLabelText('Description'), 'Description.');
    await user.type(screen.getByLabelText(/Repository URL/), 'github.com/x');
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(
      await screen.findByText('Must be a full URL starting with http:// or https://'),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/Repository URL/));
    await user.click(screen.getByRole('button', { name: 'Create project' }));
    expect(await screen.findByText("The slug 'aj-stream' is already in use")).toBeInTheDocument();
  });

  it('loads an existing project into the editor and saves changes', async () => {
    const server = signedInServer({
      'GET /api/admin/projects/1': () => ({ body: projectFixture }),
      'PUT /api/admin/projects/1': (call) => ({
        body: { ...projectFixture, ...(call.body as object) },
      }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/projects/1');

    const title = await screen.findByLabelText('Title');
    expect(title).toHaveValue('AJ Stream');
    expect(screen.getByLabelText('Tech stack')).toHaveValue('Rust\nSQLite\nReact');

    await user.clear(title);
    await user.type(title, 'AJ Stream 2');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Saved "AJ Stream 2".');
    expect(server.find('PUT', '/api/admin/projects/1')[0]?.body).toMatchObject({
      title: 'AJ Stream 2',
      techStack: ['Rust', 'SQLite', 'React'],
    });
  });

  it('deletes only after a second, confirming press', async () => {
    const server = signedInServer({ 'DELETE /api/admin/projects/1': () => ({ status: 204 }) });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/projects');

    await user.click(await screen.findByRole('button', { name: 'Delete AJ Stream' }));
    expect(server.find('DELETE', '/api/admin/projects/1')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Confirm deleting AJ Stream' }));
    await waitFor(() => {
      expect(server.find('DELETE', '/api/admin/projects/1')).toHaveLength(1);
    });
  });

  it('opens a message from the inbox, marks it read and can archive it', async () => {
    const server = signedInServer({
      'GET /api/admin/messages': () => ({
        body: { content: [message], page: 0, size: 20, totalElements: 1, totalPages: 1 },
      }),
      'PATCH /api/admin/messages/7': (call) => ({ body: { ...message, ...(call.body as object) } }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/messages');

    await user.click(await screen.findByRole('button', { name: /Wanjiru Kamau/ }));

    const detail = await screen.findByRole('article', { name: 'Message from Wanjiru Kamau' });
    expect(within(detail).getByText('We have a backend role you might like.')).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: 'Reply by email' })).toHaveAttribute(
      'href',
      'mailto:wanjiru@example.com?subject=Re%3A%20Backend%20role',
    );
    await waitFor(() => {
      expect(server.find('PATCH', '/api/admin/messages/7')[0]?.body).toEqual({ status: 'READ' });
    });

    await user.click(within(detail).getByRole('button', { name: 'Archive' }));
    await waitFor(() => {
      expect(server.find('PATCH', '/api/admin/messages/7').at(-1)?.body).toEqual({
        status: 'ARCHIVED',
      });
    });

    await user.click(screen.getByRole('button', { name: 'New' }));
    await waitFor(() => {
      expect(server.find('GET', '/api/admin/messages?page=0&status=NEW')).not.toHaveLength(0);
    });
  });

  it('saves edited settings', async () => {
    const server = signedInServer({
      'GET /api/admin/settings': () => ({ body: settingsFixture }),
      'PUT /api/admin/settings': (call) => ({
        body: { ...settingsFixture, ...(call.body as object) },
      }),
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin/settings');

    const availability = await screen.findByLabelText('Availability');
    await user.clear(availability);
    await user.type(availability, 'Booked until January.');
    await user.click(screen.getByRole('button', { name: 'Save settings' }));

    expect(await screen.findByText('Settings saved.')).toBeInTheDocument();
    expect(server.find('PUT', '/api/admin/settings')[0]?.body).toMatchObject({
      availability: 'Booked until January.',
      heritageNote: 'Proudly Gusii.',
    });
    expect(server.find('PUT', '/api/admin/settings')[0]?.body).not.toHaveProperty('updatedAt');
  });

  it('signs out and returns to the sign-in page', async () => {
    let signedIn = true;
    const server = signedInServer({
      'POST /api/auth/refresh': () => (signedIn ? session('token-1') : unauthorized),
      'POST /api/auth/logout': () => {
        signedIn = false;
        return { status: 204 };
      },
    });
    const user = userEvent.setup();
    renderRoutes(routes, '/admin');

    const [signOut] = await screen.findAllByRole('button', { name: 'Sign out' });
    if (!signOut) {
      throw new Error('No sign-out button');
    }
    await user.click(signOut);

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(server.find('POST', '/api/auth/logout')).toHaveLength(1);
  });
});
