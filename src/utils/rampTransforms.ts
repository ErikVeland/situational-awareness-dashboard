import {
  type Algorithm,
  type AlgorithmDistribution,
  type Ramp,
  type SparklinePoint,
  ALGORITHMS,
} from '../api/types';

// ─── Distribution ─────────────────────────────────────────────────────────────

/**
 * Converts a raw Ramp[] into percentage-per-algorithm.
 *
 * Pure function — no side effects, safe to use in useMemo.
 *
 * @example
 * const dist = rampsToDistribution(ramps);
 * // { 'Algorithm 1': 22, 'Algorithm 2': 18, ... }  (sums to 100)
 */
export function rampsToDistribution(ramps: Ramp[]): AlgorithmDistribution {
  if (ramps.length === 0) {
    return Object.fromEntries(
      ALGORITHMS.map((a) => [a, 0])
    ) as AlgorithmDistribution;
  }

  const counts = Object.fromEntries(
    ALGORITHMS.map((a) => [a, 0])
  ) as Record<Algorithm, number>;

  for (const ramp of ramps) {
    counts[ramp.algorithm]++;
  }

  const total = ramps.length;
  return Object.fromEntries(
    ALGORITHMS.map((a) => [a, Math.round((counts[a] / total) * 100)])
  ) as AlgorithmDistribution;
}

// ─── Sparkline buffer ─────────────────────────────────────────────────────────

/** Maximum number of data points retained in the sparkline buffer (60 s × 2 Hz) */
export const SPARKLINE_MAX_POINTS = 120;

/**
 * Appends a new data point to a sparkline buffer and trims it to
 * SPARKLINE_MAX_POINTS entries — the simplest possible bounded buffer.
 *
 * Returns a NEW array (immutable — safe for React state).
 *
 * @param buffer  Existing points array (may be empty on first call)
 * @param value   Percentage value 0–100 to append
 * @param timestamp  Unix ms — defaults to Date.now()
 *
 * @example
 * const [history, setHistory] = useState<SparklinePoint[]>([]);
 *
 * // inside useRampData callback:
 * setHistory((prev) => appendSparklinePoint(prev, dist['Algorithm 1']));
 */
export function appendSparklinePoint(
  buffer: SparklinePoint[],
  value: number,
  timestamp: number = Date.now()
): SparklinePoint[] {
  const next = [...buffer, { timestamp, value }];
  return next.length > SPARKLINE_MAX_POINTS
    ? next.slice(next.length - SPARKLINE_MAX_POINTS)
    : next;
}

/**
 * Generates a realistic-looking pre-seeded sparkline history
 * so the chart doesn't start empty on mount.
 *
 * Produces `count` points spaced 500 ms apart, ending at `endTime`.
 * Values oscillate around `baseValue` with configurable jitter.
 *
 * @example
 * const [history, setHistory] = useState(() =>
 *   generateSparklineSeed({ baseValue: 20 })
 * );
 */
export function generateSparklineSeed({
  count = 80,
  baseValue = 20,
  amplitude = 6,
  jitter = 4,
  endTime = Date.now(),
  intervalMs = 500,
}: {
  count?: number;
  baseValue?: number;
  amplitude?: number;
  jitter?: number;
  endTime?: number;
  intervalMs?: number;
} = {}): SparklinePoint[] {
  const startTime = endTime - (count - 1) * intervalMs;

  return Array.from({ length: count }, (_, i) => {
    const timestamp = startTime + i * intervalMs;
    const wave = Math.sin(i * 0.18) * amplitude;
    const noise = (Math.random() - 0.5) * jitter * 2;
    const value = Math.round(
      Math.max(2, Math.min(98, baseValue + wave + noise))
    );
    return { timestamp, value };
  });
}

/**
 * Returns only the points within the last `windowMs` milliseconds.
 * Useful if you want a true rolling 60-second window rather than
 * a fixed-count buffer.
 *
 * @example
 * const visible = trimToWindow(history, 60_000);
 */
export function trimToWindow(
  buffer: SparklinePoint[],
  windowMs: number,
  now: number = Date.now()
): SparklinePoint[] {
  const cutoff = now - windowMs;
  return buffer.filter((p) => p.timestamp >= cutoff);
}
