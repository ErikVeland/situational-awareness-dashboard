import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import DonutChart, { buildArcPath } from './DonutChart';
import type { AlgorithmDistribution } from '../../api/types';

const TAU = Math.PI * 2;

describe('buildArcPath', () => {
  it('returns an empty string for zero-width sectors', () => {
    expect(buildArcPath(0, 0, 100, 60, 0, 0)).toBe('');
  });

  it('uses two full-circle arcs when the sweep covers the whole circle', () => {
    const d = buildArcPath(0, 0, 100, 60, 0, TAU);
    // Should have two M commands (outer + inner circle)
    expect((d.match(/M /g) ?? []).length).toBe(2);
  });

  it('uses large-arc flag 1 when the sweep is greater than 180°', () => {
    const d = buildArcPath(0, 0, 100, 60, 0, Math.PI + 0.1);
    // First large-arc flag appears right before the outer end x coordinate
    expect(d).toMatch(/A 100 100 0 1 1/);
  });

  it('uses large-arc flag 0 for small sweeps', () => {
    const d = buildArcPath(0, 0, 100, 60, 0, 0.5);
    expect(d).toMatch(/A 100 100 0 0 1/);
  });
});

describe('<DonutChart>', () => {
  it('renders a placeholder ring when all values are zero', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 0,
      'Algorithm 2': 0,
      'Algorithm 3': 0,
      'Algorithm 4': 0,
      'Algorithm 5': 0,
    };
    const { container } = render(<DonutChart distribution={dist} />);
    // No data segment circles or paths — just the empty-state placeholder circle
    expect(container.querySelectorAll('path').length).toBe(0);
    expect(container.querySelectorAll('circle').length).toBe(1);
  });

  it('renders one circle per non-zero slice', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 25,
      'Algorithm 2': 25,
      'Algorithm 3': 25,
      'Algorithm 4': 25,
      'Algorithm 5': 0,
    };
    const { container } = render(<DonutChart distribution={dist} />);
    // Rendering switched from <path> arcs to stroke-dasharray <circle>s so
    // that CSS can animate stroke-dasharray / stroke-dashoffset transitions.
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(container.querySelectorAll('path').length).toBe(0);
  });

  it('omits labels for slices below 3%', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 97,
      'Algorithm 2': 2,
      'Algorithm 3': 1,
      'Algorithm 4': 0,
      'Algorithm 5': 0,
    };
    const { container } = render(<DonutChart distribution={dist} />);
    const labels = container.querySelectorAll('text');
    // Only Algorithm 1 should have a visible percentage label
    expect(labels.length).toBe(1);
    expect(labels[0]?.textContent).toBe('97%');
  });

  it('applies a drop-shadow filter to the dominant algorithm circle', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 40,
      'Algorithm 2': 30,
      'Algorithm 3': 30,
      'Algorithm 4': 0,
      'Algorithm 5': 0,
    };
    const { container } = render(
      <DonutChart distribution={dist} dominantAlgorithm="Algorithm 1" />,
    );
    const circles = container.querySelectorAll('circle');
    // The first circle (Algorithm 1, dominant) should have a drop-shadow filter
    expect((circles[0] as SVGCircleElement).style.filter).toMatch(/drop-shadow/);
    // Non-dominant circles should not have a drop-shadow filter
    expect((circles[1] as SVGCircleElement).style.filter).not.toMatch(/drop-shadow/);
  });
});
