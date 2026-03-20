import { useCallback, useEffect, useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceCallState<T> {
  /** The last successfully loaded data, or null if not yet loaded or errored. */
  data: T | null;
  /** True while the async fetch is in-flight. */
  loading: boolean;
  /**
   * Human-readable error message if the most recent fetch threw an unhandled
   * error; null while healthy or loading.
   */
  error: string | null;
  /** Triggers a fresh re-fetch without remounting the component. */
  reload: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Centralised loading / error / empty-state management for service calls.
 *
 * Keeps async fetch boilerplate out of screen components: no per-screen
 * useState+useEffect triplets needed.  The service layer (with its built-in
 * mock fallbacks) is responsible for returning a safe default — this hook just
 * wires loading visibility and error surfacing.
 *
 * @param fetcher  Async function that returns the data.  Should be stable
 *                 across re-renders; if it has dynamic parameters, pass those
 *                 as entries in `deps` and create the fetcher inside the hook
 *                 call (same pattern as useEffect).
 * @param deps     Extra dependency array — re-runs the fetch when any dep
 *                 changes (same semantics as useEffect's second argument).
 *
 * @example
 *   const { data: hotels, loading, error } = useServiceCall(
 *     () => hotelsService.getAll(),
 *     [],
 *   );
 *
 * @example with dynamic param
 *   const { data: hotel } = useServiceCall(
 *     () => hotelsService.getById(id),
 *     [id],
 *   );
 */
export function useServiceCall<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): ServiceCallState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // `fetcher` is intentionally omitted from deps; callers control re-runs via `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCounter]);

  const reload = useCallback(() => setReloadCounter((c) => c + 1), []);

  return { data, loading, error, reload };
}
