import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  /** Re-triggers the fetch without remounting the component. */
  retry: () => void;
}

/**
 * Minimal generic hook that resolves a Promise-returning factory and tracks
 * loading / error state. Cancels stale results on unmount or factory change.
 *
 * Exposes a `retry()` function that re-runs the effect by incrementing an
 * internal counter — no extra props or keys needed at the call site.
 *
 * We intentionally keep this tiny — this codebase doesn't need React Query.
 * If the API layer were swapped for a real backend, replacing this with
 * React Query would be a one-file change.
 */
export function useAsyncData<T>(
  factory: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data:    null,
    loading: true,
    error:   null,
    retry:   () => {},
  });

  const [retryCount, setRetryCount] = useState(0);

  // Re-use the latest factory without requiring consumers to memoize it.
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  const retry = useCallback(() => setRetryCount((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    factoryRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, retry });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data:    null,
            loading: false,
            error:   err instanceof Error ? err : new Error(String(err)),
            retry,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount]);

  // Expose retry in the stable return object even before the first resolve.
  return { ...state, retry };
}
