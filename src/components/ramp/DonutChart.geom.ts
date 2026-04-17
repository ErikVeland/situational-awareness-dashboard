/**
 * Pure geometry helpers for the donut chart, kept in a separate module so
 * `DonutChart.tsx` exports only the component (Fast Refresh friendly) and so
 * the maths is easy to unit-test in isolation.
 *
 * The chart component itself renders with stroke-dasharray circles for
 * CSS-animated transitions; `buildArcPath` is the `<path>`-based fallback
 * and is exercised by the unit tests.
 */

const EPSILON = 1e-3;
const TAU = Math.PI * 2;

function polar(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): [number, number] {
  return [cx + r * Math.sin(angleRad), cy - r * Math.cos(angleRad)];
}

/**
 * Builds an SVG arc `d` string for an annulus sector (donut slice).
 * Returns an empty string for zero-sweep sectors so callers can short-circuit.
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

/** Polar → Cartesian helper (exported so labels can be positioned outside the ring). */
export { polar };
