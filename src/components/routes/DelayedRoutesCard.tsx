import Card from '../Card';
import RouteRow from './RouteRow';
import type { DelayedRoute } from '../../api/types';
import { useDelayedRoutes } from '../../hooks/useDelayedRoutes';

interface Props {
  routes?: DelayedRoute[];
}

export default function DelayedRoutesCard({ routes: override }: Props) {
  const state = useDelayedRoutes();
  const routes = override ?? state.data ?? [];

  return (
    <Card
      title="Delayed Routes"
      headerRight={
        <span className="rounded-full bg-accent-live/15 px-2.5 py-1 text-xs font-medium text-accent-live ring-1 ring-accent-live/30">
          {routes.length} active
        </span>
      }
    >
      {state.error ? (
        <p className="text-sm text-red-400">
          Error loading routes: {state.error.message}
        </p>
      ) : routes.length === 0 ? (
        <p className="text-sm text-slate-400">No delayed routes.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {routes.map((r) => (
            <RouteRow key={r.id} route={r} />
          ))}
        </ul>
      )}
    </Card>
  );
}
