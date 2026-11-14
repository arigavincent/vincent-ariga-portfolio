import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, request } from './client';

function respond(body: unknown, init: ResponseInit = {}) {
  const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
    Promise.resolve(
      new Response(body === undefined ? null : JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        ...init,
      }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('request', () => {
  it('returns the parsed JSON of a successful response', async () => {
    const fetchMock = respond([{ id: 1 }]);

    await expect(request('/api/projects')).resolves.toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({ method: 'GET', body: undefined }),
    );
  });

  it('sends JSON bodies with the right content type', async () => {
    const fetchMock = respond({ message: 'ok' }, { status: 202 });

    await request('/api/contact', { method: 'POST', body: { name: 'Wanjiru' } });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe('{"name":"Wanjiru"}');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('leaves the content type to the browser for form uploads', async () => {
    const fetchMock = respond({ url: '/api/files/x.png' }, { status: 201 });
    const form = new FormData();

    await request('/api/admin/uploads', { method: 'POST', body: form });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.body).toBe(form);
    expect(init?.headers).not.toHaveProperty('Content-Type');
  });

  it('returns undefined for 204 responses', async () => {
    respond(undefined, { status: 204 });

    await expect(request('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('turns the backend error JSON into an ApiError with field errors', async () => {
    respond(
      {
        timestamp: '',
        status: 400,
        error: 'Bad Request',
        message: 'Some fields need another look.',
        path: '/api/contact',
        fieldErrors: [{ field: 'email', message: 'That email address does not look right' }],
      },
      { status: 400 },
    );

    const error = await request('/api/contact', { method: 'POST', body: {} }).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      message: 'Some fields need another look.',
      fieldErrors: [{ field: 'email', message: 'That email address does not look right' }],
    });
  });

  it('reads Retry-After from rate-limited responses', async () => {
    respond(
      {
        timestamp: '',
        status: 429,
        error: 'Too Many Requests',
        message: 'Too many requests.',
        path: '/api/contact',
      },
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '42' } },
    );

    await expect(request('/api/contact', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 429,
      retryAfter: 42,
    });
  });

  it('copes with error responses that are not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('<html>Bad gateway</html>', { status: 502 }))),
    );

    await expect(request('/api/projects')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    });
  });

  it('reports network failures as a friendly ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    await expect(request('/api/projects')).rejects.toMatchObject({
      status: 0,
      message: 'Could not reach the server. Check your connection and try again.',
    });
  });
});
