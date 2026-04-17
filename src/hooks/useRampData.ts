import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import getRampAlgorithms from '../api/getRampAlgorithms';
import type {
  Algorithm,
  AlgorithmDistribution,
  Ramp,
  SparklinePoint,
} from '../api/types';
import { ALGORITHMS } from '../api/types';
import {
  appendSparklinePoint,
  rampsToDistribution,
} from '../utils/rampTransforms';

/**
 * Result returned by {@link useRampData}.
 *
 * Naming note: `displayed*` values freeze while `paused` is true; the
 * underlying stream keeps ticking in the background and `latestReceivedAt`
 * continues to advance. This is the key invariant the pause button relies on.
 */
export interface RampDataState {
  /** Distribution frozen on the last tick we accepted (mirrors the donut). */
  distribution: AlgorithmDistribution;
  /** Which algorithm currently has the largest share (ties → first in ALGORITHMS). */
  dominantAlgorithm: Algorithm;
  /** Per-algorithm sparkline history (percentages over time, ≤120 points). */
  history: Record<Algorithm, SparklinePoint[]>;
  /** True when ramp counts are actively being flushed to state. */
  paused: boolean;
  /** Wall-clock timestamp of the latest background update (advances even when paused). */
  latestReceivedAt: number | null;
  /** Number of ramps in the most recent live tick (always current). */
  latestRampCount: number;
  /** Toggle the paused flag. */
  togglePause: () => void;
}

const EMPTY_DISTRIBUTION: AlgorithmDistribution = Object.fromEntries(
  ALGORITHMS.map((a) => [a, 0]),
) as AlgorithmDistribution;

const EMPTY_HISTORY: Record<Algorithm, SparklinePoint[]> = Object.fromEntries(
  ALGORITHMS.map((a) => [a, [] as SparklinePoint[]]),
) as Record<Algorithm, SparklinePoint[]>;

/** Pick the algorithm with the largest share in the distribution. */
export function pickDominant(dist: AlgorithmDistribution): Algorithm {
  let best: Algorithm = ALGORITHMS[0]!;
  let bestVal = -Infinity;
  for (const a of ALGORITHMS) {
    const v = dist[a];
    if (v > bestVal) {
      bestVal = v;
      best = a;
    }
  }
  return best;
}

/**
 * Subscribes to the provided `getRampAlgorithms` stream (500 ms) and exposes
 * everything the Ramp Chart card needs:
 *   - a live donut-friendly distribution
 *   - a 60 s sparkline history per algorithm
 *   - a dominant-algorithm pointer (used by the sparkline card)
 *   - a pause toggle that freezes the *displayed* state while the stream
 *     keeps running in the background
 *
 * Implementation notes
 *   - We store the paused flag in a ref in addition to state so the
 *     subscription callback (registered once) always sees the current value
 *     without needing to resubscribe on every toggle.
 *   - All state transitions use the functional updater form, making them
 *     safe under React 18 strict-mode double-invocation.
 */
export function useRampData(): RampDataState {
  const [distribution, setDistribution] =
    useState<AlgorithmDistribution>(EMPTY_DISTRIBUTION);
  const [history, setHistory] =
    useState<Record<Algorithm, SparklinePoint[]>>(EMPTY_HISTORY);
  const [paused, setPaused] = useState<boolean>(false);
  const [latestReceivedAt, setLatestReceivedAt] = useState<number | null>(null);
  const [latestRampCount, setLatestRampCount] = useState<number>(0);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const onUpdate = (ramps: Ramp[]): void => {
      // Always track the most recent tick metadata, even when paused.
      const now = Date.now();
      setLatestReceivedAt(now);
      setLatestRampCount(ramps.length);

      if (pausedRef.current) return;

      const dist = rampsToDistribution(ramps);
      setDistribution(dist);
      setHistory((prev) => {
        const next = { ...prev };
        for (const a of ALGORITHMS) {
          next[a] = appendSparklinePoint(prev[a], dist[a], now);
        }
        return next;
      });
    };

    const cleanup = getRampAlgorithms(onUpdate);
    return cleanup;
  }, []);

  const dominantAlgorithm = useMemo(
    () => pickDominant(distribution),
    [distribution],
  );

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  return {
    distribution,
    dominantAlgorithm,
    history,
    paused,
    latestReceivedAt,
    latestRampCount,
    togglePause,
  };
}
