import { useMemo } from 'react';
import type { Algorithm, AlgorithmDistribution } from '../../api/types';
import { ALGORITHMS } from '../../api/types';
import { ALGORITHM_COLOR } from '../../theme/algorithmColors';
import { polar } from './DonutChart.geom';

// ─── Geometry constants ─────────────────────────────────────────────────────

/** Midpoint radius of the ring (pixels, in the SVG viewBox space). */
const RING_RADIUS = 84;
/** Ring thickness in the same space. */
const RING_WIDTH = 32;
/** Full circumference of the ring at RING_RADIUS. */
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 527.79
/** Radius at which percentage labels are placed (just outside the ring). */
const LABEL_RADIUS = 118;
const TAU = Math.PI * 2;

// ─── Segment computation ──────────────────────────────────────────────────────

interface Segment {
  algorithm: Algorithm;
  /** Raw distribution value — rendered as a rounded percentage. */
  value: number;
  /** Painted arc length in SVG units. */
  segLength: number;
  /** Cumulative length of all preceding segments — used for dashoffset. */
  cumOffset: number;
  /** Midpoint angle in radians, measured clockwise from 12 o'clock. */
  midAngle: number;
}

function computeSegments(distribution: AlgorithmDistribution): Segment[] {
  const total = ALGORITHMS.reduce((s, a) => s + distribution[a], 0);
  if (total <= 0) return [];

  let cumOffset = 0;
  const segments: Segment[] = [];

  for (const algorithm of ALGORITHMS) {
    const value = distribution[algorithm];
    if (value <= 0) continue;

    const segLength = (value / total) * CIRCUMFERENCE;
    const startAngle = (cumOffset / CIRCUMFERENCE) * TAU;
    const sweepAngle = (segLength / CIRCUMFERENCE) * TAU;

    segments.push({
      algorithm,
      value,
      segLength,
      cumOffset,
      midAngle: startAngle + sweepAngle / 2,
    });
    cumOffset += segLength;
  }

  return segments;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DonutChartProps {
  distribution: AlgorithmDistribution;
  dominantAlgorithm?: Algorithm;
  /** Diameter in px (SVG viewBox is fixed, CSS scales it). */
  size?: number;
}

export default function DonutChart({
  distribution,
  dominantAlgorithm,
  size = 220,
}: DonutChartProps) {
  const segments = useMemo(() => computeSegments(distribution), [distribution]);

  const hasData = segments.length > 0;

  return (
    <svg
      role="img"
      aria-label="Ramp algorithm distribution"
      viewBox="-120 -120 240 240"
      width={size}
      height={size}
      className="block overflow-visible"
    >
      {!hasData ? (
        /* Placeholder ring — colour adapts to theme via CSS variable */
        <circle
          cx={0}
          cy={0}
          r={RING_RADIUS}
          fill="none"
          style={{ stroke: 'rgb(var(--color-bg-muted))' }}
          strokeWidth={RING_WIDTH}
        />
      ) : (
        segments.map(({ algorithm, value, segLength, cumOffset, midAngle }) => {
          const color = ALGORITHM_COLOR[algorithm];
          const isDominant = algorithm === dominantAlgorithm;
          const [lx, ly] = polar(0, 0, LABEL_RADIUS, midAngle);

          return (
            <g key={algorithm}>
              {/*
               * Stroke-dasharray approach: each algorithm is a full circle
               * whose visible painted length is controlled by dasharray.
               * rotate(-90) starts the stroke at 12 o'clock; dashoffset
               * shifts each segment past its predecessors.
               *
               * stroke-dasharray and stroke-dashoffset are CSS-animatable,
               * so the transition between distributions is handled by the
               * browser — no JS interpolation needed.
               */}
              <circle
                cx={0}
                cy={0}
                r={RING_RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={RING_WIDTH}
                transform="rotate(-90)"
                style={{
                  strokeDasharray: `${segLength.toFixed(3)} ${CIRCUMFERENCE.toFixed(3)}`,
                  strokeDashoffset: (-cumOffset).toFixed(3),
                  transition:
                    'stroke-dasharray 0.45s ease, stroke-dashoffset 0.45s ease, filter 0.35s ease',
                  filter: isDominant
                    ? `drop-shadow(0 0 5px ${color}cc)`
                    : 'none',
                }}
              />

              {/* Percentage label — appears outside the ring at the arc midpoint */}
              {value >= 3 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700 dark:fill-slate-200"
                  fontSize={12}
                  style={{
                    transition: 'opacity 0.3s ease',
                    fontWeight: isDominant ? 600 : 400,
                  }}
                >
                  {Math.round(value)}%
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
