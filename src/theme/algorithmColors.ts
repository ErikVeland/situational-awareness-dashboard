import type { Algorithm } from '../api/types';

/**
 * Stable per-algorithm color assignment used by the donut chart, legend, and
 * sparkline. Keeping this as a plain map (not tailwind classes) lets us feed
 * the colors directly into SVG `fill` / `stroke` attributes.
 */
export const ALGORITHM_COLOR: Record<Algorithm, string> = {
  'Algorithm 1': '#f472b6', // pink
  'Algorithm 2': '#38bdf8', // sky
  'Algorithm 3': '#34d399', // emerald
  'Algorithm 4': '#fbbf24', // amber
  'Algorithm 5': '#a78bfa', // violet
};
