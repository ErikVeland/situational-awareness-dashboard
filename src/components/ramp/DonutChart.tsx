import { useMemo } from 'react';
import type { Algorithm, AlgorithmDistribution } from '../../api/types';
import { ALGORITHMS } from '../../api/types';
import { ALGORITHM_COLOR } from '../../theme/algorithmColors';

interface DonutChartProps {
  distribution: AlgorithmDistribution;
  /** Diameter in px (SVG viewBox is fixed, CSS scales it). */
  size?: number;
  /** Thickness of the ring as a fraction of radius (0–1). */
  thickness?: number;
}

interface Arc {
  algorithm: Algorithm;
  path: string;
  /** Angle mid-point, used to position the percentage label. */
  midAngleRad: number;
  value: number;
}

const TAU = Math.PI * 2;
const EPSILON = 1e-3;

/** Convert polar coordinates (angle in radians, 0 = 12 o'clock) to cartesian. */
function polar(cx: number, cy: number, r: number, angleRad: number): [number, number] {
  return [cx + r * Math.sin(angleRad), cy - r * Math.cos(angleRad)];
}

/**
 * Builds an SVG arc path for an annulus sector (donut slice).
 */
export function buildArcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  if (sweep <= EPSILON) return '';

  // Full-circle slice — SVG arcs can't draw a full circle in one command.
  if (sweep >= TAU - EPSILON) {
    return [
      `M ${cx} ${cy - rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy + rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy - rOuter} Z`,
      `M ${cx} ${cy - rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy + rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner} Z`,
    ].join(' ');
  }

  const [x0Outer, y0Outer] = polar(cx, cy, rOuter, startAngle);
  const [x1Outer, y1Outer] = polar(cx, cy, rOuter, endAngle);
  const [x1Inner, y1Inner] = polar(cx, cy, rInner, endAngle);
  const [x0Inner, y0Inner] = polar(cx, cy, rInner, startAngle);
  const largeArc = sweep > Math.PI ? 1 : 0;

  return [
    `M ${x0Outer} ${y0Outer}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1Outer} ${y1Outer}`,
    `L ${x1Inner} ${y1Inner}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x0Inner} ${y0Inner}`,
    'Z',
  ].join(' ');
}

export default function DonutChart({
  distribution,
  size = 220,
  thickness = 0.32,
}: DonutChartProps) {
  const arcs = useMemo<Arc[]>(() => {
    const total = ALGORITHMS.reduce((s, a) => s + distribution[a], 0);
    if (total <= 0) return [];

    const cx = 0;
    const cy = 0;
    const rOuter = 100;
    const rInner = rOuter * (1 - thickness);

    let angle = 0;
    const result: Arc[] = [];

    for (const algorithm of ALGORITHMS) {
      const value = distribution[algorithm];
      const sweep = (value / total) * TAU;
      if (sweep > EPSILON) {
        const end = angle + sweep;
        result.push({
          algorithm,
          value,
          path: buildArcPath(cx, cy, rOuter, rInner, angle, end),
          midAngleRad: angle + sweep / 2,
        });
        angle = end;
      }
    }
    return result;
  }, [distribution, thickness]);

  const total = ALGORITHMS.reduce((s, a) => s + distribution[a], 0);

  return (
    <svg
      role="img"
      aria-label="Ramp algorithm distribution"
      viewBox="-120 -120 240 240"
      width={size}
      height={size}
      className="block"
    >
      {total <= 0 ? (
        <circle
          cx={0}
          cy={0}
          r={100}
          fill="none"
          stroke="#1b2235"
          strokeWidth={100 * 0.32}
        />
      ) : (
        arcs.map((arc) => {
          const [lx, ly] = polar(0, 0, 118, arc.midAngleRad);
          return (
            <g key={arc.algorithm}>
              <path d={arc.path} fill={ALGORITHM_COLOR[arc.algorithm]} />
              {arc.value >= 3 && (
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-200"
                  fontSize={12}
                >
                  {arc.value}%
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}
