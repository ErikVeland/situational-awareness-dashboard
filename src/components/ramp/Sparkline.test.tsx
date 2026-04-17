import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Sparkline, { buildSparklinePath } from './Sparkline';

describe('buildSparklinePath', () => {
  it('returns empty string for empty input', () => {
    expect(buildSparklinePath([], 100, 50, 100)).toBe('');
  });

  it('draws a horizontal line for a single point', () => {
    const d = buildSparklinePath([{ timestamp: 0, value: 50 }], 100, 50, 100);
    // A single value produces M at x=0 and L at x=100 at the same y
    expect(d).toMatch(/^M 0 25 L 100 25$/);
  });

  it('maps the first point to x=0 and last to x=width', () => {
    const d = buildSparklinePath(
      [
        { timestamp: 0, value: 0 },
        { timestamp: 500, value: 100 },
      ],
      100,
      50,
      100,
    );
    // First command at x=0,y=50; last command at x=100,y=0
    expect(d.startsWith('M 0.00 50.00')).toBe(true);
    expect(d.endsWith('L 100.00 0.00')).toBe(true);
  });

  it('clamps values outside the domain', () => {
    const d = buildSparklinePath(
      [
        { timestamp: 0, value: -10 },
        { timestamp: 100, value: 200 },
      ],
      100,
      50,
      100,
    );
    // Clamped: -10 → 0 (y=50), 200 → 100 (y=0)
    expect(d).toContain('M 0.00 50.00');
    expect(d).toContain('L 100.00 0.00');
  });
});

describe('<Sparkline>', () => {
  it('renders nothing inside the svg when there are no points', () => {
    const { container } = render(<Sparkline points={[]} color="#f00" />);
    // Only the <defs> block should remain; no visible path
    expect(container.querySelectorAll('path').length).toBe(0);
  });

  it('renders a path when given points', () => {
    const { container } = render(
      <Sparkline
        points={[
          { timestamp: 0, value: 20 },
          { timestamp: 500, value: 40 },
        ]}
        color="#0f0"
      />,
    );
    // Expect both the area fill and the line path
    expect(container.querySelectorAll('path').length).toBe(2);
  });
});
