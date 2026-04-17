import { useMemo } from 'react';
import Card from '../Card';
import InlineError from '../InlineError';
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
    streamError,
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
        isDominant: a === dominantAlgorithm,
      })),
    [distribution, dominantAlgorithm],
  );

  return (
    <Card
      title="Ramp Chart"
      headerRight={
        <span className="rounded-full bg-bg-muted px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300">
          {latestRampCount} ramps
        </span>
      }
      className="col-span-full lg:col-span-2 row-span-2"
    >
      {/* Stream processing error — chart stays visible with stale data */}
      {streamError && (
        <div className="mb-3">
          <InlineError error={streamError} resource="ramp stream" />
        </div>
      )}

      <div className="grid grid-cols-[auto_1fr] items-center gap-6">
        <DonutChart
          distribution={distribution}
          dominantAlgorithm={dominantAlgorithm}
          size={220}
        />

        {/* Legend — dominant algorithm is visually highlighted */}
        <ul className="space-y-1.5 text-sm" aria-label="Algorithm distribution">
          {legend.map(({ algorithm, value, color, isDominant }) => (
            <li
              key={algorithm}
              className="flex items-center justify-between gap-6"
              style={{
                transition: 'opacity 0.3s ease',
                opacity: isDominant ? 1 : 0.72,
              }}
            >
              {/* Coloured dot — slightly larger with a glow for the dominant */}
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block rounded-full flex-shrink-0"
                  style={{
                    width: isDominant ? 10 : 8,
                    height: isDominant ? 10 : 8,
                    backgroundColor: color,
                    boxShadow: isDominant ? `0 0 6px ${color}bb` : 'none',
                    transition:
                      'width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
                <span
                  className="text-slate-700 dark:text-slate-200"
                  style={{
                    fontWeight: isDominant ? 500 : 400,
                    transition: 'font-weight 0.2s ease',
                  }}
                >
                  {algorithm}
                </span>
              </span>

              {/* Percentage — coloured in the algorithm's accent for dominant */}
              <span
                className="tabular-nums"
                style={{
                  color: isDominant ? color : undefined,
                  fontWeight: isDominant ? 500 : 400,
                  transition: 'color 0.3s ease, font-weight 0.2s ease',
                }}
              >
                {value}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* History sparkline */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs tracking-wider text-slate-500 dark:text-slate-400">
          <span className="uppercase">{dominantAlgorithm} — Last 60s</span>
          <span
            className="tabular-nums font-medium transition-colors duration-300"
            style={{ color: ALGORITHM_COLOR[dominantAlgorithm] }}
          >
            {dominantShare}%
          </span>
        </div>

        <div
          className="mt-2"
          role="img"
          aria-label={`${dominantAlgorithm} share over the last 60 seconds: ${dominantShare}%`}
        >
          <Sparkline
            points={dominantSeries}
            color={ALGORITHM_COLOR[dominantAlgorithm]}
            height={80}
          />
        </div>

        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
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
