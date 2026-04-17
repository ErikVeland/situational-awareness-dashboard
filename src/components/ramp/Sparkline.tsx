import { useMemo } from 'react';
import type { SparklinePoint } from '../../api/types';
import { buildSparklinePath } from './Sparkline.geom';

interface SparklineProps {
  points: SparklinePoint[];
  /** Hex color for the line. */
  color: string;
  width?: number;
  height?: number;
  /** Domain cap — values are clamped into [0, max]. */
  max?: number;
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
    const xLast =
      points.length === 1 ? width : ((last.timestamp - tMin) / tSpan) * width;
    return `${d} L ${xLast.toFixed(2)} ${height} L ${xFirst.toFixed(2)} ${height} Z`;
  }, [d, points, width, height]);

  const gradId = useMemo(
    () => `spark-grad-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  // Key off the latest timestamp so that React remounts the paths on each
  // tick, triggering the CSS @keyframes entrance animation — a subtle
  // brightness pulse that signals live data without distracting the user.
  const tickKey =
    points.length > 0 ? points[points.length - 1]!.timestamp : 'empty';

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

      {/* key causes remount on each tick, restarting the CSS animation */}
      <g
        key={tickKey}
        style={{ animation: 'sparklineTick 0.35s ease forwards' }}
      >
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
      </g>
    </svg>
  );
}
