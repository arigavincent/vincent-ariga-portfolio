import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { publicApi, stubApi } from '@/test/api';
import { renderRoutes } from '@/test/render';

import { routes } from './router';

afterEach(() => {
  vi.unstubAllGlobals();
});

async function preloaderToLift() {
  await waitFor(
    () => {
      expect(screen.queryByRole('status', { name: /^Loading \d+%$/ })).not.toBeInTheDocument();
    },
    { timeout: 5000 },
  );
}

describe('site routes', () => {
  it('renders the home page with every section once loading completes', async () => {
    stubApi(publicApi);
    renderRoutes(routes, '/');
    await preloaderToLift();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Vincent Ariga' }),
    ).toBeInTheDocument();
    for (const id of ['about', 'skills', 'work', 'journey', 'services', 'contact']) {
      expect(document.getElementById(id)).toBeInTheDocument();
    }
    expect(screen.getByText('First paragraph about me.')).toBeInTheDocument();
    expect(screen.getByText('Proudly Gusii.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 3, name: 'AJ Stream' })).toBeInTheDocument();
    expect(screen.getByText('Gin · Fiber')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'BSc Information Technology' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Backend Development' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Download CV/ })[0]).toHaveAttribute(
      'href',
      '/api/cv',
    );
    expect(document.title).toBe('Vincent Ariga · A&J | Backend Engineer');
  }, 15000);

  it('still renders the identity and contact details when the API is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    renderRoutes(routes, '/');
    await preloaderToLift();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Vincent Ariga' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lameckvin@gmail.com/ })).toBeInTheDocument();
    expect(await screen.findByText('Could not load the projects right now.')).toBeInTheDocument();
  }, 15000);

  it('navigates from a project card to its detail page', async () => {
    stubApi(publicApi);
    const user = userEvent.setup();
    renderRoutes(routes, '/projects');
    await preloaderToLift();

    await user.click(await screen.findByRole('link', { name: /AJ Stream/ }));

    expect(await screen.findByRole('heading', { level: 1, name: 'AJ Stream' })).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
    const stack = screen.getByRole('list', { name: 'Tech stack' });
    expect(
      within(stack)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Rust', 'SQLite', 'React']);
    expect(screen.getByText('HLS video playback')).toBeInTheDocument();
  }, 15000);

  it('shows the not-found page for an unknown project and an unknown route', async () => {
    stubApi(publicApi);
    renderRoutes(routes, '/projects/does-not-exist');
    await preloaderToLift();

    expect(await screen.findByRole('heading', { level: 1, name: 'Lost.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/');
  }, 15000);
});
