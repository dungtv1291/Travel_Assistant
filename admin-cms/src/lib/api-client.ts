import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ─── Types ─────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────

let isRefreshing = false;
let refreshListeners: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshListeners.forEach((cb) => cb(token));
  refreshListeners = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const json: ApiResponse<{ accessToken: string; refreshToken: string }> =
    await res.json();
  saveTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    if (isRefreshing) {
      // Queue this request until the refresh completes
      const newToken = await new Promise<string>((resolve) => {
        refreshListeners.push(resolve);
      });
      headers["Authorization"] = `Bearer ${newToken}`;
      return request<T>(path, { ...options, headers }, false);
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      onRefreshed(newToken);
      isRefreshing = false;
      headers["Authorization"] = `Bearer ${newToken}`;
      return request<T>(path, { ...options, headers }, false);
    } catch (err) {
      isRefreshing = false;
      // Clear tokens on auth failure - React Router layouts will handle redirect
      clearTokens();
      throw err;
    }
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      message = errJson?.message ?? message;
    } catch {}
    throw new ApiError(res.status, message);
  }

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// ─── Public API client ─────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
