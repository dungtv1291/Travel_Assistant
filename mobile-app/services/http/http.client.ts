import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api.config';

// ── Storage keys (must match mock/auth.service.ts so sessions transfer cleanly) ─
export const TOKEN_KEY = '@vt_auth_token';
export const REFRESH_TOKEN_KEY = '@vt_auth_refresh_token';

// ── Typed error ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown[];

  constructor(statusCode: number, code: string, message: string, details?: unknown[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

// ── Token refresh queue ───────────────────────────────────────────────────────
// Prevents multiple concurrent 401 responses all trying to refresh the token.

let _isRefreshing = false;
let _refreshQueue: Array<(token: string | null) => void> = [];

function enqueueRefreshWaiter(): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    _refreshQueue.push(resolve);
  });
}

function flushRefreshQueue(token: string | null): void {
  _refreshQueue.forEach((resolve) => resolve(token));
  _refreshQueue = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
      return null;
    }

    const json = await res.json();
    const newAccess: string = json?.data?.accessToken;
    const newRefresh: string | undefined = json?.data?.refreshToken;

    if (!newAccess) {
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
      return null;
    }

    await AsyncStorage.setItem(TOKEN_KEY, newAccess);
    if (newRefresh) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
    return newAccess;
  } catch {
    return null;
  }
}

// ── Core request function ─────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isRetry = false,
): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // ── 401: attempt one token refresh cycle ──────────────────────────────────
  if (res.status === 401 && !isRetry) {
    if (_isRefreshing) {
      // Another refresh is already in flight — wait for its outcome
      const refreshedToken = await enqueueRefreshWaiter();
      if (refreshedToken) return request<T>(method, path, body, true);
      throw new ApiError(401, 'UNAUTHORIZED', '세션이 만료되었습니다. 다시 로그인해 주세요.');
    }

    _isRefreshing = true;
    const newToken = await attemptTokenRefresh();
    _isRefreshing = false;
    flushRefreshQueue(newToken);

    if (newToken) return request<T>(method, path, body, true);
    throw new ApiError(401, 'UNAUTHORIZED', '세션이 만료되었습니다. 다시 로그인해 주세요.');
  }

  // ── Parse response ────────────────────────────────────────────────────────
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new ApiError(res.status, 'PARSE_ERROR', `Invalid JSON response from server`);
    }
  }

  if (!res.ok) {
    const errPayload = json?.error as Record<string, unknown> | undefined;
    const code = (errPayload?.code as string) ?? 'API_ERROR';
    const message = (errPayload?.message as string) ?? `Request failed (${res.status})`;
    const details = errPayload?.details as unknown[] | undefined;
    throw new ApiError(res.status, code, message, details);
  }

  // Backend wraps successful data in { success: true, data: ... }
  return ((json as Record<string, unknown>)?.data ?? json) as T;
}

// ── Public HTTP client ────────────────────────────────────────────────────────

export const httpClient = {
  get: <T>(path: string): Promise<T> => request<T>('GET', path),
  post: <T>(path: string, body?: unknown): Promise<T> => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown): Promise<T> => request<T>('PATCH', path, body),
  delete: <T>(path: string): Promise<T> => request<T>('DELETE', path),

  /** Called after a successful login/register to persist both tokens. */
  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /** Called on logout or when a refresh attempt fails unrecoverably. */
  clearTokens: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};
