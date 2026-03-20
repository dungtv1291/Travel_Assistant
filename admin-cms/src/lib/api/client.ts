// ─── Core HTTP client ──────────────────────────────────────────────────────
// Handles: auth header injection, 401 + coordinated token refresh,
// response envelope unwrapping, and structured error normalization.

import { buildUrl } from './config';
import { ApiError, type FieldError } from './errors';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokens';
import type { ApiResponse } from '@/types';

// ─── Token refresh queue ───────────────────────────────────────────────────
// Ensures a single in-flight refresh even when multiple requests hit 401
// simultaneously. All waiting requests are retried with the new token.

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function runRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, 'No refresh token available');

  const res = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new ApiError(401, 'Session expired');
  }

  const json: ApiResponse<{ accessToken: string; refreshToken: string }> =
    await res.json();
  saveTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

// ─── Error parsing ─────────────────────────────────────────────────────────

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let message = `Request failed (${res.status})`;
  let fields: FieldError[] = [];

  try {
    const body = await res.json();
    // NestJS standard error shape: { message: string | string[], statusCode }
    if (typeof body?.message === 'string') {
      message = body.message;
    } else if (Array.isArray(body?.message)) {
      // NestJS class-validator returns an array of strings
      message = (body.message as string[]).join('; ');
    }
    // Field-level errors from a custom validation format: { errors: [{field, message}] }
    if (Array.isArray(body?.errors)) {
      fields = body.errors as FieldError[];
    }
  } catch {
    // JSON parse failed — keep the fallback message
  }

  return new ApiError(res.status, message, fields);
}

// ─── Core request ──────────────────────────────────────────────────────────

/**
 * Performs an authenticated HTTP request and unwraps the backend's
 * `{ success: boolean, data: T }` response envelope.
 *
 * - Injects `Authorization: Bearer <token>` when a token is present.
 * - On 401: coordinates a single token refresh then retries all queued requests.
 * - On refresh failure: clears tokens and redirects to /login.
 * - On any other error: throws a normalized `ApiError`.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), { ...init, headers });

  // ── 401 handling: refresh & retry ────────────────────────────────────────
  if (res.status === 401 && !isRetry) {
    if (isRefreshing) {
      // Queue this request until the refresh completes
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });
      return request<T>(
        path,
        { ...init, headers: { ...headers, Authorization: `Bearer ${newToken}` } },
        true,
      );
    }

    isRefreshing = true;
    try {
      const newToken = await runRefresh();
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      isRefreshing = false;
      return request<T>(path, init, true);
    } catch {
      isRefreshing = false;
      refreshQueue = [];
      clearTokens();
      window.location.href = '/login';
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  // Unwrap the standard backend envelope: { success: boolean, data: T }
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

/**
 * Same as `request` but returns the **full** `ApiResponse<T>` envelope
 * instead of unwrapping `.data`. Useful when you need the `success` flag
 * or future top-level metadata alongside the payload.
 *
 * @example
 *   const raw = await requestRaw<Destination[]>('/admin/destinations');
 *   console.log(raw.success, raw.data);
 */
export async function requestRaw<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path), { ...init, headers });
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json() as Promise<ApiResponse<T>>;
}

// ─── Public API client object ──────────────────────────────────────────────
//
// Use this in service files — never call fetch() directly in pages.
//
// @example
//   import { api } from '@/lib/api';
//   const destinations = await api.get<Destination[]>('/admin/destinations');

export const api = {
  /** GET — returns unwrapped `T` */
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'GET' });
  },

  /** POST with body — returns unwrapped `T` */
  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },

  /** PATCH with partial body — returns unwrapped `T` */
  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
  },

  /** PUT with full body — returns unwrapped `T` */
  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  },

  /** DELETE — returns unwrapped `T` (usually `void`) */
  delete<T = void>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' });
  },

  /** GET — returns the raw `{ success, data }` envelope without unwrapping */
  getRaw<T>(path: string): Promise<ApiResponse<T>> {
    return requestRaw<T>(path, { method: 'GET' });
  },
};
