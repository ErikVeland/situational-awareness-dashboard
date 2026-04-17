import type { DelayedRoute } from '../../api/types';
import SeverityDot from './SeverityDot';

interface RouteRowProps {
  route: DelayedRoute;
}

export default function RouteRow({ route }: RouteRowProps) {
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 border-b border-slate-100 dark:border-white/5 last:border-none">
      <SeverityDot severity={route.severity} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-stone-800 dark:text-slate-100">
          {route.name}
        </p>
        <p className="truncate text-xs text-stone-400 dark:text-slate-500">
          {route.via.join(' · ')}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-stone-400 dark:text-slate-400">
          {route.distanceKm} km
        </p>
        <p className="text-lg font-light tracking-tight text-stone-800 dark:text-slate-100">
          {route.delayMinutes}
          <span className="ml-0.5 text-xs font-medium text-stone-400 dark:text-slate-400">
            min
          </span>
        </p>
      </div>
    </li>
  );
}
