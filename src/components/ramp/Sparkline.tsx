import { useMemo } from 'react';
import type { SparklinePoint } from '../../api/types';

interface SparklineProps {
  points: SparklinePoint[];
  /** Hex color for the line. */
  color: string;
  width?: number;
  height?: number;
  /** Domain cap — values are clamped into [0, max]. */
  max?: number;
}

/**
 * Constructs the `d` attribute for a simple polyline through the provided
 * points. Returns an empty string when there is no data so React renders
 * nothing.
 */
export function buildSparklinePath(
  points: SparklinePoint[],
  width: number,
  height: number,
  max: number,
): string {
  if (points.length === 0) return '';

  if (points.length === 1) {
    const p = points[0]!;
    const y = height - (Math.max(0, Math.min(max, p.value)) / max) * height;
    return `M 0 ${y} L ${width} ${y}`;
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;
  const tMin = first.timestamp;
  const tMax = last.timestamp;
  const tSpan = tMax - tMin || 1;

  const segs = points.map((p, i) => {
    const x = ((p.timestamp - tMin) / tSpan) * width;
    const clamped = Math.max(0, Math.min(max, p.value));
    const y = height - (clamped / max) * height;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return segs.join(' ');
}

export default function Sparkline({
  points,
  color,
  width = 520,
  height = 80,
  max = 100,
}: SparklineProps) {
  const d = useMemo(
    () => buildSparklinePath(points, width, height, max),
    [points, width, height, max],
  );

  // Build an area fill underneath the line for a subtle gradient.
  const areaD = useMemo(() => {
    if (!d || points.length === 0) return '';
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const tMin = first.timestamp;
    const tMax = last.timestamp;
    const tSpan = tMax - tMin || 1;
    const xFirst = 0;
    const xLast = points.length === 1
      ? width
      : ((last.timestamp - tMin) / tSpan) * width;
    return `${d} L ${xLast.toFixed(2)} ${height} L ${xFirst.toFixed(2)} ${height} Z`;
  }, [d, points, width, height]);

  const gradId = useMemo(
    () => `spark-grad-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  return (
    <svg
      role="img"
      aria-label="Dominant algorithm share over the last 60 seconds"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="block"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {areaD && <path d={areaD} fill={`url(#${gradId})`} />}
      {d && (
        <path
          d={d}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
