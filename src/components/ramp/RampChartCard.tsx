import { useMemo } from 'react';
import Card from '../Card';
import DonutChart from './DonutChart';
import Sparkline from './Sparkline';
import PauseButton from './PauseButton';
import { ALGORITHMS } from '../../api/types';
import { ALGORITHM_COLOR } from '../../theme/algorithmColors';
import type { RampDataState } from '../../hooks/useRampData';

interface Props {
  state: RampDataState;
}

export default function RampChartCard({ state }: Props) {
  const {
    distribution,
    dominantAlgorithm,
    history,
    paused,
    latestRampCount,
    togglePause,
  } = state;

  const dominantSeries = history[dominantAlgorithm];
  const dominantShare = distribution[dominantAlgorithm];

  const legend = useMemo(
    () =>
      ALGORITHMS.map((a) => ({
        algorithm: a,
        value: distribution[a],
        color: ALGORITHM_COLOR[a],
      })),
    [distribution],
  );

  return (
    <Card
      title="Ramp Chart"
      headerRight={
        <span className="rounded-full bg-bg-muted px-2.5 py-1 text-xs text-slate-300">
          {latestRampCount} ramps
        </span>
      }
      className="col-span-full lg:col-span-2 row-span-2"
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-6">
        <DonutChart distribution={distribution} size={220} />
        <ul className="space-y-1.5 text-sm">
          {legend.map((item) => (
            <li
              key={item.algorithm}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2 text-slate-200">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.algorithm}
              </span>
              <span className="tabular-nums text-slate-300">
                {item.value}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-xs tracking-wider text-slate-400">
          <span className="uppercase">
            {dominantAlgorithm} — Last 60s
          </span>
          <span className="tabular-nums text-emerald-300">
            {dominantShare}%
          </span>
        </div>
        <div className="mt-2">
          <Sparkline
            points={dominantSeries}
            color={ALGORITHM_COLOR[dominantAlgorithm]}
            height={80}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>-60s</span>
          <span>now</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <PauseButton paused={paused} onToggle={togglePause} />
      </div>
    </Card>
  );
}
