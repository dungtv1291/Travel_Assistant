// ─── API base configuration ────────────────────────────────────────────────
// All backend URLs are derived from this single source of truth.
// Never import import.meta.env.VITE_API_URL directly in pages or services.

/** Root URL for the backend API, read once from the environment. */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:3000';

/**
 * Resolves a path segment to a full backend URL.
 * Guarantees exactly one slash between base and path.
 *
 * @example
 *   buildUrl('/admin/destinations')
 *   // → 'http://localhost:3000/admin/destinations'
 */
export function buildUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

/**
 * Serializes a params object into a URL query string.
 * Omits keys whose value is null, undefined, or empty string.
 *
 * @example
 *   buildQueryString({ page: 1, search: 'hanoi', active: undefined })
 *   // → '?page=1&search=hanoi'
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const pairs = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  ) as [string, string][];

  if (pairs.length === 0) return '';
  return '?' + new URLSearchParams(pairs.map(([k, v]) => [k, String(v)])).toString();
}
