import type { SparklinePoint } from '../../api/types';

/**
 * Constructs the `d` attribute for a simple polyline through the provided
 * points. Returns an empty string when there is no data so React renders
 * nothing.
 *
 * Kept in a dedicated module so `Sparkline.tsx` only exports a component
 * (Fast Refresh friendly) and so the geometry is trivial to unit-test.
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
