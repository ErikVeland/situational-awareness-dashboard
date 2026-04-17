import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { pickDominant, useRampData } from './useRampData';
import type { AlgorithmDistribution } from '../api/types';

describe('pickDominant', () => {
  it('returns the algorithm with the highest percentage', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 10,
      'Algorithm 2': 20,
      'Algorithm 3': 50,
      'Algorithm 4': 15,
      'Algorithm 5': 5,
    };
    expect(pickDominant(dist)).toBe('Algorithm 3');
  });

  it('returns the first algorithm on ties', () => {
    const dist: AlgorithmDistribution = {
      'Algorithm 1': 20,
      'Algorithm 2': 20,
      'Algorithm 3': 20,
      'Algorithm 4': 20,
      'Algorithm 5': 20,
    };
    expect(pickDominant(dist)).toBe('Algorithm 1');
  });
});

describe('useRampData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Make ramp assignment deterministic so the dominant algorithm is stable
    vi.spyOn(Math, 'random').mockReturnValue(0); // index 0 → 'Algorithm 1'
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('produces a distribution after the first tick (fires immediately)', () => {
    const { result } = renderHook(() => useRampData());

    // getRampAlgorithms fires synchronously on subscribe
    expect(result.current.distribution['Algorithm 1']).toBe(100);
    expect(result.current.dominantAlgorithm).toBe('Algorithm 1');
    expect(result.current.latestRampCount).toBe(50);
    expect(result.current.paused).toBe(false);
  });

  it('appends a new sparkline point after each 500ms tick', () => {
    const { result } = renderHook(() => useRampData());

    const initialLen = result.current.history['Algorithm 1'].length;

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.history['Algorithm 1'].length).toBe(initialLen + 1);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.history['Algorithm 1'].length).toBe(initialLen + 2);
  });

  it('freezes displayed state when paused but keeps receiving updates', () => {
    const { result } = renderHook(() => useRampData());

    act(() => {
      result.current.togglePause();
    });
    expect(result.current.paused).toBe(true);

    const frozenDist = result.current.distribution;
    const frozenHistoryLen = result.current.history['Algorithm 1'].length;
    const beforeReceivedAt = result.current.latestReceivedAt;

    act(() => {
      vi.advanceTimersByTime(2_000); // 4 ticks in background
    });

    // Displayed distribution and history are frozen
    expect(result.current.distribution).toBe(frozenDist);
    expect(result.current.history['Algorithm 1'].length).toBe(frozenHistoryLen);

    // latestReceivedAt still advanced — the stream is still running.
    expect(result.current.latestReceivedAt).not.toBe(beforeReceivedAt);
    expect(result.current.latestRampCount).toBe(50);
  });

  it('resumes live updates when unpaused', () => {
    const { result } = renderHook(() => useRampData());

    act(() => {
      result.current.togglePause();
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const frozenLen = result.current.history['Algorithm 1'].length;

    act(() => {
      result.current.togglePause();
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.paused).toBe(false);
    expect(result.current.history['Algorithm 1'].length).toBe(frozenLen + 1);
  });

  it('cleans up the interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useRampData());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
