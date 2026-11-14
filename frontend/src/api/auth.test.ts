import { afterEach, describe, expect, it, vi } from 'vitest';

import { session, stubServer, unauthorized } from '@/test/server';

import { auth } from './auth';

afterEach(() => {
  auth.reset();
  vi.unstubAllGlobals();
});

describe('auth', () => {
  it('signs in and sends the access token on admin calls', async () => {
    const server = stubServer({
      'POST /api/auth/login': () => session('token-1'),
      'GET /api/admin/me': () => ({ body: { username: 'vincent' } }),
    });

    await auth.login('vincent', 'secret-password');
    await auth.authorized('/api/admin/me');

    expect(auth.getSession()).toEqual({
      status: 'authenticated',
      user: { username: 'vincent', role: 'ADMIN' },
    });
    expect(server.find('POST', '/api/auth/login')[0]?.body).toEqual({
      username: 'vincent',
      password: 'secret-password',
    });
    expect(server.find('GET', '/api/admin/me')[0]?.authorization).toBe('Bearer token-1');
  });

  it('leaves the session anonymous when the credentials are wrong', async () => {
    stubServer({ 'POST /api/auth/login': () => unauthorized });

    await expect(auth.login('vincent', 'wrong')).rejects.toMatchObject({ status: 401 });
    expect(auth.getSession().status).not.toBe('authenticated');
  });

  it('refreshes an expired token once and repeats the call', async () => {
    let expired = true;
    const server = stubServer({
      'POST /api/auth/login': () => session('old-token'),
      'POST /api/auth/refresh': () => {
        expired = false;
        return session('new-token');
      },
      'GET /api/admin/projects': () => (expired ? unauthorized : { body: [] }),
    });
    await auth.login('vincent', 'secret-password');

    await expect(auth.authorized('/api/admin/projects')).resolves.toEqual([]);

    const attempts = server.find('GET', '/api/admin/projects');
    expect(attempts.map((call) => call.authorization)).toEqual([
      'Bearer old-token',
      'Bearer new-token',
    ]);
    expect(server.find('POST', '/api/auth/refresh')).toHaveLength(1);
  });

  it('shares one refresh between calls that expire together', async () => {
    let refreshed = false;
    const server = stubServer({
      'POST /api/auth/refresh': () => {
        refreshed = true;
        return session('new-token');
      },
      'GET /api/admin/skills': () => (refreshed ? { body: [] } : unauthorized),
      'GET /api/admin/services': () => (refreshed ? { body: [] } : unauthorized),
    });

    await Promise.all([
      auth.authorized('/api/admin/skills'),
      auth.authorized('/api/admin/services'),
    ]);

    expect(server.find('POST', '/api/auth/refresh')).toHaveLength(1);
  });

  it('ends the session when the refresh cookie is no longer valid', async () => {
    stubServer({
      'POST /api/auth/refresh': () => unauthorized,
      'GET /api/admin/projects': () => unauthorized,
    });

    await expect(auth.authorized('/api/admin/projects')).rejects.toMatchObject({ status: 401 });
    expect(auth.getSession()).toEqual({ status: 'anonymous', user: null });
  });

  it('signs out locally even if the server call fails', async () => {
    stubServer({ 'POST /api/auth/login': () => session('token-1') });
    await auth.login('vincent', 'secret-password');

    await auth.logout().catch(() => undefined);

    expect(auth.getSession()).toEqual({ status: 'anonymous', user: null });
  });

  it('notifies subscribers when the session changes', async () => {
    stubServer({ 'POST /api/auth/login': () => session('token-1') });
    const listener = vi.fn();
    const unsubscribe = auth.subscribe(listener);

    await auth.login('vincent', 'secret-password');
    unsubscribe();

    expect(listener).toHaveBeenCalledOnce();
  });
});
