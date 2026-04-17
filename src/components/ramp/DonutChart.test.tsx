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
    // No arc <path>s, just the empty-state ring
    expect(container.querySelectorAll('path').length).toBe(0);
    expect(container.querySelectorAll('circle').length).toBe(1);
  });

  it('renders one arc per non-zero slice', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 25,
      'Algorithm 2': 25,
      'Algorithm 3': 25,
      'Algorithm 4': 25,
      'Algorithm 5': 0,
    };
    const { container } = render(<DonutChart distribution={dist} />);
    expect(container.querySelectorAll('path').length).toBe(4);
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
});
