import { vi } from 'vitest';

export interface RecordedCall {
  method: string;
  path: string;
  body: unknown;
  authorization: string | null;
}

type Handler = (call: RecordedCall) => { status?: number; body?: unknown };

/**
 * A fetch stand-in that routes by "METHOD /path". Each handler returns a status and JSON body;
 * routes that are not defined answer 404 in the backend's error shape. Every call is recorded.
 */
export function stubServer(routes: Record<string, Handler>) {
  const calls: RecordedCall[] = [];
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const { pathname, search } = new URL(url, 'http://localhost');
    const headers = new Headers(init?.headers);
    const rawBody = init?.body;
    const call: RecordedCall = {
      method: init?.method ?? 'GET',
      path: pathname + search,
      body: typeof rawBody === 'string' ? (JSON.parse(rawBody) as unknown) : (rawBody ?? null),
      authorization: headers.get('Authorization'),
    };
    calls.push(call);
    const handler = routes[`${call.method} ${pathname}`];
    const { status = 200, body } = handler
      ? handler(call)
      : {
          status: 404,
          body: {
            timestamp: '',
            status: 404,
            error: 'Not Found',
            message: 'Not found',
            path: pathname,
          },
        };
    return Promise.resolve(
      new Response(status === 204 ? null : JSON.stringify(body ?? {}), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return {
    calls,
    find: (method: string, path: string) =>
      calls.filter((c) => c.method === method && c.path === path),
  };
}

export const unauthorized = {
  status: 401,
  body: {
    timestamp: '',
    status: 401,
    error: 'Unauthorized',
    message: 'Sign in to continue.',
    path: '',
  },
};

export const session = (token: string) => ({
  body: {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: 900,
    user: { username: 'vincent', role: 'ADMIN' },
  },
});
