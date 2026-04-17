import Card from '../Card';
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
      {!summary ? (
        <p className="text-sm text-slate-400">
          {state.error
            ? `Error: ${state.error.message}`
            : 'Loading network summary…'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total ramps" value={summary.totalRamps} />
          <StatCard label="Active" value={summary.activeRamps} />
          <StatCard
            label="Incidents"
            value={summary.incidents}
            accent={summary.incidents > 0 ? 'alert' : 'default'}
          />
          <StatCard
            label="Avg delay"
            value={summary.averageDelayMinutes}
            unit="min"
          />
        </div>
      )}
    </Card>
  );
}
