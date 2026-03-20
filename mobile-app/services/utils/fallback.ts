/**
 * Centralised fallback utilities for frontend–backend integration.
 *
 * Design goals:
 *   - A single place to see and manage all fallback behaviour during active integration.
 *   - Services stay clean — no repeated try/catch boilerplate scattered across files.
 *   - Fallback logic never leaks into screen components.
 *
 * Search for [TEMP_FALLBACK] to find every section that should be reviewed or
 * simplified once the backend is confirmed stable.
 */

// ── withFallback ──────────────────────────────────────────────────────────────

/**
 * Wraps a primary async operation; returns `fallback` on any error.
 *
 * Use for single-item fetches or operations where the semantics of the fallback
 * value varies per call-site (e.g. computed from query params).
 *
 * [TEMP_FALLBACK] — replace individual usages with proper error propagation
 * once all backend endpoints are confirmed stable.
 */
export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await primary();
  } catch {
    // [TEMP_FALLBACK] backend unavailable or response mapping failed
    return fallback;
  }
}

// ── withListFallback ──────────────────────────────────────────────────────────

/**
 * Wraps a primary list fetch; on error **or** empty result returns `mockList`.
 *
 * Using the mock list rather than `[]` preserves the mock-compatible view model
 * so screens always receive usable display data during the integration phase.
 *
 * [TEMP_FALLBACK] — once the backend endpoints are seeded and stable, replace
 * the `result.length === 0` branch with a direct return so empty is surfaced.
 */
export async function withListFallback<T>(
  primary: () => Promise<T[]>,
  mockList: T[],
): Promise<T[]> {
  try {
    const result = await primary();
    // [TEMP_FALLBACK] treat empty response as "not yet available" and use mock
    return result.length > 0 ? result : mockList;
  } catch {
    // [TEMP_FALLBACK] network error or mapping failure — serve mock data
    return mockList;
  }
}

// ── safeMapList ───────────────────────────────────────────────────────────────

/**
 * Maps each item individually; silently skips items that throw during mapping.
 *
 * Prevents a single malformed backend record from crashing the full list render.
 * Adapters throw on null/invalid input, making this the natural partner guard.
 *
 * [TEMP_FALLBACK] — once the backend schema is finalised, swap for a direct
 * `items.map(mapper)` call so mapping errors surface explicitly during development.
 */
export function safeMapList<T, R>(
  items: T[],
  mapper: (item: T) => R,
): R[] {
  const result: R[] = [];
  for (const item of items) {
    try {
      result.push(mapper(item));
    } catch {
      // [TEMP_FALLBACK] skip malformed or unmapped backend item
    }
  }
  return result;
}
