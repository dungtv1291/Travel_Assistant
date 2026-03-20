/**
 * Converts a snake_case string to camelCase.
 * Example: "full_name" -> "fullName", "hero_image_url" -> "heroImageUrl"
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * Recursively converts all object keys from snake_case to camelCase.
 * Handles nested objects and arrays.
 * Use on every raw pg row before returning in an API response.
 *
 * Example:
 *   mapToCamelCase({ full_name: "Kim", avatar_url: null }) ->
 *   { fullName: "Kim", avatarUrl: null }
 */
export function mapToCamelCase<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => mapToCamelCase(item)) as T;
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date)
  ) {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        toCamelCase(key),
        mapToCamelCase(val),
      ]),
    ) as T;
  }
  return value as T;
}
