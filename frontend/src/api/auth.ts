import { ApiError, request, type RequestOptions } from './client';
import type { AdminUser, AuthResponse } from './types';

/**
 * The admin session. The access token lives in memory only (never in storage, so scripts cannot
 * read it back later); the refresh token is an HttpOnly cookie the browser sends to /api/auth.
 */
export type SessionStatus = 'checking' | 'authenticated' | 'anonymous';

export interface Session {
  status: SessionStatus;
  user: AdminUser | null;
}

let accessToken: string | null = null;
let session: Session = { status: 'checking', user: null };
let refreshing: Promise<boolean> | null = null;
const listeners = new Set<() => void>();

function setSession(next: Session, token: string | null): void {
  accessToken = token;
  session = next;
  listeners.forEach((listener) => {
    listener();
  });
}

function accept(response: AuthResponse): void {
  setSession({ status: 'authenticated', user: response.user }, response.accessToken);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSession(): Session {
  return session;
}

/** Signs in. Throws an ApiError with the server's message when the credentials are wrong. */
async function login(username: string, password: string): Promise<void> {
  const response = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
    credentials: 'include',
  });
  accept(response);
}

/**
 * Exchanges the refresh cookie for a new access token. Concurrent callers share one request, so
 * a burst of expired calls rotates the cookie only once. Resolves to false when there is no
 * valid session.
 */
function refresh(): Promise<boolean> {
  refreshing ??= request<AuthResponse>('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => {
      accept(response);
      return true;
    })
    .catch(() => {
      setSession({ status: 'anonymous', user: null }, null);
      return false;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function logout(): Promise<void> {
  try {
    await request<undefined>('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } finally {
    setSession({ status: 'anonymous', user: null }, null);
  }
}

/**
 * Like {@link request}, with the access token attached. When the token has expired, it is
 * refreshed once and the call is repeated; if that fails the session ends.
 */
async function authorized<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const send = () =>
    request<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
  try {
    return await send();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && (await refresh())) {
      return send();
    }
    throw error;
  }
}

/** Resets the session. For tests. */
function reset(): void {
  refreshing = null;
  setSession({ status: 'checking', user: null }, null);
}

export const auth = { subscribe, getSession, login, refresh, logout, authorized, reset };
