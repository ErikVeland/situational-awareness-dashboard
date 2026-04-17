import { useMemo, useState } from 'react';
import Card from '../Card';
import InlineError from '../InlineError';
import DonutChart from './DonutChart';
import Sparkline from './Sparkline';
import PauseButton from './PauseButton';
import type { Algorithm } from '../../api/types';
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

  /**
   * Hovering (or keyboard-focusing) a legend row pins the sparkline + donut
   * highlight to that algorithm. Data keeps streaming in real time — only the
   * "which algorithm to feature" auto-cycling is paused. Clearing hover/focus
   * drops back to auto-tracking the dominant algorithm.
   */
  const [hoveredAlgorithm, setHoveredAlgorithm] = useState<Algorithm | null>(
    null,
  );
  const focusedAlgorithm: Algorithm = hoveredAlgorithm ?? dominantAlgorithm;
  const focusedSeries = history[focusedAlgorithm];
  const focusedShare = distribution[focusedAlgorithm];
  const isFocusPinned = hoveredAlgorithm !== null;

  const legend = useMemo(
    () =>
      ALGORITHMS.map((a) => ({
        algorithm: a,
        value: distribution[a],
        color: ALGORITHM_COLOR[a],
        isFocused: a === focusedAlgorithm,
      })),
    [distribution, focusedAlgorithm],
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
          dominantAlgorithm={focusedAlgorithm}
          focusPinned={isFocusPinned}
          size={220}
        />

        {/*
         * Legend — hovering or keyboard-focusing a row pins the sparkline to
         * that algorithm. Clearing hover/focus resumes auto-tracking the
         * dominant. Each row is keyboard-focusable via tabIndex=0 so this
         * interaction is available without a mouse.
         */}
        <ul className="space-y-1.5 text-sm" aria-label="Algorithm distribution">
          {legend.map(({ algorithm, value, color, isFocused }) => (
            <li
              key={algorithm}
              tabIndex={0}
              role="button"
              aria-label={`Focus sparkline on ${algorithm} (currently ${value}%)`}
              aria-pressed={isFocused && isFocusPinned}
              onMouseEnter={() => setHoveredAlgorithm(algorithm)}
              onMouseLeave={() => setHoveredAlgorithm(null)}
              onFocus={() => setHoveredAlgorithm(algorithm)}
              onBlur={() => setHoveredAlgorithm(null)}
              className="flex cursor-pointer items-center justify-between gap-6 rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-live/60"
              style={{
                transition: 'opacity 0.3s ease, background-color 0.2s ease',
                opacity: isFocused ? 1 : 0.72,
                backgroundColor: isFocused ? `${color}14` : 'transparent',
              }}
            >
              {/* Coloured dot — slightly larger with a glow for the focused row */}
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block rounded-full flex-shrink-0"
                  style={{
                    width: isFocused ? 10 : 8,
                    height: isFocused ? 10 : 8,
                    backgroundColor: color,
                    boxShadow: isFocused ? `0 0 6px ${color}bb` : 'none',
                    transition:
                      'width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease',
                  }}
                />
                <span
                  className="text-slate-700 dark:text-slate-200"
                  style={{
                    fontWeight: isFocused ? 500 : 400,
                    transition: 'font-weight 0.2s ease',
                  }}
                >
                  {algorithm}
                </span>
              </span>

              {/* Percentage — coloured in the algorithm's accent for the focused row */}
              <span
                className="tabular-nums"
                style={{
                  color: isFocused ? color : undefined,
                  fontWeight: isFocused ? 500 : 400,
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
          <span className="uppercase">
            {focusedAlgorithm} — Last 60s
            {isFocusPinned && (
              <span
                className="ml-2 rounded-full bg-bg-muted px-1.5 py-0.5 text-[9px] font-medium normal-case tracking-normal text-slate-500 dark:text-slate-400"
                aria-hidden
              >
                focus pinned
              </span>
            )}
          </span>
          <span
            className="tabular-nums font-medium transition-colors duration-300"
            style={{ color: ALGORITHM_COLOR[focusedAlgorithm] }}
          >
            {focusedShare}%
          </span>
        </div>

        <div
          className="mt-2"
          role="img"
          aria-label={`${focusedAlgorithm} share over the last 60 seconds: ${focusedShare}%`}
        >
          <Sparkline
            points={focusedSeries}
            color={ALGORITHM_COLOR[focusedAlgorithm]}
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
