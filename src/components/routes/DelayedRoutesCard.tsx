import Card from '../Card';
import InlineError from '../InlineError';
import RouteRow from './RouteRow';
import type { DelayedRoute } from '../../api/types';
import { useDelayedRoutes } from '../../hooks/useDelayedRoutes';

interface Props {
  routes?: DelayedRoute[];
}

export default function DelayedRoutesCard({ routes: override }: Props) {
  const state = useDelayedRoutes();
  const routes = override ?? state.data ?? [];
  // Show the loading state only when we're waiting on the hook, not when
  // the caller has already supplied an (empty) override.
  const isLoading = state.loading && override === undefined;

  return (
    <Card
      title="Delayed Routes"
      headerRight={
        <span className="rounded-full bg-accent-live/15 px-2.5 py-1 text-xs font-medium text-accent-live ring-1 ring-accent-live/30">
          {routes.length} active
        </span>
      }
    >
      {state.error && override === undefined ? (
        <InlineError
          error={state.error}
          resource="delayed routes"
          onRetry={state.retry}
        />
      ) : isLoading ? (
        <div
          className="animate-pulse space-y-0"
          aria-label="Loading routes"
          aria-busy="true"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-stone-100 dark:border-white/5 py-3"
            >
              <div className="space-y-2">
                <div className="h-3.5 w-36 rounded bg-stone-200 dark:bg-slate-700" />
                <div className="h-3 w-24 rounded bg-stone-200 dark:bg-slate-700" />
              </div>
              <div className="h-8 w-14 rounded bg-stone-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : routes.length === 0 ? (
        <p className="text-sm text-stone-400 dark:text-slate-400">
          No delayed routes at this time.
        </p>
      ) : (
        /* Borders are on each RouteRow — no extra divide-y needed */
        <ul>
          {routes.map((r) => (
            <RouteRow key={r.id} route={r} />
          ))}
        </ul>
      )}
    </Card>
  );
}
