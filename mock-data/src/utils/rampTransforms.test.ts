import {
  rampsToDistribution,
  appendSparklinePoint,
  generateSparklineSeed,
  trimToWindow,
  SPARKLINE_MAX_POINTS,
} from './rampTransforms';
import { type Ramp } from '../api/types';

// ─── rampsToDistribution ──────────────────────────────────────────────────────

describe('rampsToDistribution', () => {
  it('returns all-zero distribution for empty input', () => {
    const dist = rampsToDistribution([]);
    expect(Object.values(dist).every((v) => v === 0)).toBe(true);
  });

  it('returns 100% for single-algorithm input', () => {
    const ramps: Ramp[] = Array.from({ length: 10 }, (_, i) => ({
      id: `ramp-${i}`,
      algorithm: 'Algorithm 1',
    }));
    const dist = rampsToDistribution(ramps);
    expect(dist['Algorithm 1']).toBe(100);
    expect(dist['Algorithm 2']).toBe(0);
  });

  it('distributes evenly across 5 algorithms when counts are equal', () => {
    const ramps: Ramp[] = [
      ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, algorithm: 'Algorithm 1' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i+10}`, algorithm: 'Algorithm 2' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i+20}`, algorithm: 'Algorithm 3' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i+30}`, algorithm: 'Algorithm 4' as const })),
      ...Array.from({ length: 10 }, (_, i) => ({ id: `r${i+40}`, algorithm: 'Algorithm 5' as const })),
    ];
    const dist = rampsToDistribution(ramps);
    expect(dist['Algorithm 1']).toBe(20);
    expect(dist['Algorithm 3']).toBe(20);
    expect(dist['Algorithm 5']).toBe(20);
  });

  it('returns rounded percentages for uneven counts', () => {
    const ramps: Ramp[] = [
      { id: 'r0', algorithm: 'Algorithm 1' },
      { id: 'r1', algorithm: 'Algorithm 1' },
      { id: 'r2', algorithm: 'Algorithm 2' },
    ];
    const dist = rampsToDistribution(ramps);
    expect(dist['Algorithm 1']).toBe(67);
    expect(dist['Algorithm 2']).toBe(33);
  });
});

// ─── appendSparklinePoint ─────────────────────────────────────────────────────

describe('appendSparklinePoint', () => {
  it('appends a point to an empty buffer', () => {
    const result = appendSparklinePoint([], 42, 1000);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ timestamp: 1000, value: 42 });
  });

  it('does not mutate the original buffer', () => {
    const original = [{ timestamp: 1000, value: 20 }];
    appendSparklinePoint(original, 30, 1500);
    expect(original).toHaveLength(1);
  });

  it(`trims to ${SPARKLINE_MAX_POINTS} when buffer exceeds max`, () => {
    const full = Array.from({ length: SPARKLINE_MAX_POINTS }, (_, i) => ({
      timestamp: i * 500,
      value: 20,
    }));
    const result = appendSparklinePoint(full, 99, 999999);
    expect(result).toHaveLength(SPARKLINE_MAX_POINTS);
    expect(result[result.length - 1].value).toBe(99);
  });

  it('drops the oldest point when trimming', () => {
    const full = Array.from({ length: SPARKLINE_MAX_POINTS }, (_, i) => ({
      timestamp: i * 500,
      value: i,
    }));
    const result = appendSparklinePoint(full, 999, 99999);
    expect(result[0].value).toBe(1); // oldest (value=0) was dropped
  });

  it('defaults timestamp to approximately now', () => {
    const before = Date.now();
    const result = appendSparklinePoint([], 50);
    const after = Date.now();
    expect(result[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(result[0].timestamp).toBeLessThanOrEqual(after);
  });
});

// ─── generateSparklineSeed ───────────────────────────────────────────────────

describe('generateSparklineSeed', () => {
  it('generates the requested number of points', () => {
    const seed = generateSparklineSeed({ count: 40 });
    expect(seed).toHaveLength(40);
  });

  it('defaults to 80 points', () => {
    const seed = generateSparklineSeed();
    expect(seed).toHaveLength(80);
  });

  it('spaces points by intervalMs', () => {
    const seed = generateSparklineSeed({ count: 3, intervalMs: 500, endTime: 10000 });
    expect(seed[1].timestamp - seed[0].timestamp).toBe(500);
    expect(seed[2].timestamp - seed[1].timestamp).toBe(500);
    expect(seed[2].timestamp).toBe(10000);
  });

  it('keeps all values within 0–100', () => {
    const seed = generateSparklineSeed({ count: 200, baseValue: 50, amplitude: 40, jitter: 20 });
    seed.forEach(({ value }) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  it('centres output around baseValue (rough check)', () => {
    const seed = generateSparklineSeed({ count: 200, baseValue: 30, amplitude: 2, jitter: 1 });
    const avg = seed.reduce((s, p) => s + p.value, 0) / seed.length;
    expect(avg).toBeGreaterThan(25);
    expect(avg).toBeLessThan(35);
  });
});

// ─── trimToWindow ─────────────────────────────────────────────────────────────

describe('trimToWindow', () => {
  it('returns only points within the window', () => {
    const now = 10_000;
    const points = [
      { timestamp: 1000, value: 10 },   // outside 60s window
      { timestamp: 5000, value: 20 },   // outside
      { timestamp: 8000, value: 30 },   // inside (within 2s)
      { timestamp: 9500, value: 40 },   // inside
      { timestamp: 10000, value: 50 },  // inside
    ];
    const result = trimToWindow(points, 2_000, now);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(30);
  });

  it('returns empty array when all points are outside the window', () => {
    const now = 100_000;
    const old = [{ timestamp: 1000, value: 5 }];
    expect(trimToWindow(old, 1_000, now)).toHaveLength(0);
  });

  it('returns all points when all are within the window', () => {
    const now = 1000;
    const recent = [
      { timestamp: 800, value: 10 },
      { timestamp: 900, value: 20 },
    ];
    expect(trimToWindow(recent, 60_000, now)).toHaveLength(2);
  });
});
