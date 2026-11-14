import type { ApiErrorBody, FieldViolation } from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** A failed API call, carrying the backend's message and any per-field validation errors. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldViolation[];
  /** Seconds to wait before retrying, when the server sent Retry-After. */
  readonly retryAfter: number | null;

  constructor(
    status: number,
    message: string,
    fieldErrors: FieldViolation[] = [],
    retryAfter: number | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.retryAfter = retryAfter;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** JSON-serialisable body, or FormData for uploads. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Send cookies (needed for the refresh-token endpoints). */
  credentials?: RequestCredentials;
}

/** Resolves an API path (or a relative file URL returned by the API) against the configured base URL. */
export function apiUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'message' in value && 'status' in value;
}

async function toApiError(response: Response): Promise<ApiError> {
  const retryAfterHeader = response.headers.get('Retry-After');
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : null;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (isErrorBody(body)) {
    return new ApiError(response.status, body.message, body.fieldErrors ?? [], retryAfter);
  }
  return new ApiError(
    response.status,
    `Request failed with status ${response.status}`,
    [],
    retryAfter,
  );
}

/** Performs a typed request against the backend and unwraps its JSON, or throws an {@link ApiError}. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal, credentials } = options;
  const isForm = body instanceof FormData;
  const init: RequestInit = {
    method,
    signal,
    credentials,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  };

  let response: Response;
  try {
    response = await fetch(apiUrl(path), init);
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      throw cause;
    }
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
