/**
 * Central API configuration derived from Expo environment variables.
 *
 * Set in .env:
 *   EXPO_PUBLIC_API_URL        – backend base URL (default: localhost dev)
 *   EXPO_PUBLIC_USE_REAL_API   – 'true' to swap mock services for real HTTP calls
 */

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const USE_REAL_API: boolean =
  process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

/**
 * Derives the HTTP origin from API_BASE_URL so relative image paths returned
 * by the backend (e.g. /uploads/destinations/hoi-an.jpg) can be resolved to
 * a full URL without duplicating the origin string.
 */
function deriveApiOrigin(url: string): string {
  try {
    const { origin } = new URL(url);
    return origin;
  } catch {
    // Fallback: strip everything from /api onwards
    return url.replace(/\/api(\/.*)?$/, '');
  }
}

export const API_ORIGIN: string = deriveApiOrigin(API_BASE_URL);

/**
 * Converts a backend-returned asset path to a usable URL.
 * - If the path is already absolute (starts with http/https), returns it as-is.
 * - If the path is relative (starts with /), prefixes it with API_ORIGIN.
 * - If empty/null, returns an empty string.
 */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
}
