import Card from '../Card';
import InlineError from '../InlineError';
import StatCard from './StatCard';
import type { NetworkSummary } from '../../api/types';
import { useNetworkSummary } from '../../hooks/useNetworkSummary';

interface Props {
  summary?: NetworkSummary;
}

export default function NetworkSummaryCard({ summary: override }: Props) {
  const state = useNetworkSummary();
  const summary = override ?? state.data;

  return (
    <Card title="Network Summary" className="col-span-full lg:col-span-1">
      {state.error ? (
        <InlineError
          error={state.error}
          resource="network summary"
          onRetry={state.retry}
        />
      ) : !summary ? (
        <div
          className="animate-pulse grid grid-cols-2 gap-3"
          aria-label="Loading network summary"
          aria-busy="true"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg bg-stone-100 dark:bg-slate-800 p-3 h-16"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total ramps" value={summary.totalRamps} />
          <StatCard label="Active" value={summary.activeRamps} accent="ok" />
          <StatCard
            label="Incidents"
            value={summary.incidents}
            accent={summary.incidents > 0 ? 'alert' : 'default'}
          />
          <StatCard
            label="Avg delay"
            value={summary.averageDelayMinutes}
            unit="min"
            accent="warn"
          />
        </div>
      )}
    </Card>
  );
}
