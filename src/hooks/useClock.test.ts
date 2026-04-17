import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useClock } from './useClock';

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-16T15:46:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current time on mount', () => {
    const { result } = renderHook(() => useClock());
    expect(result.current.toISOString()).toBe('2024-01-16T15:46:00.000Z');
  });

  it('advances the time every intervalMs', () => {
    const { result } = renderHook(() => useClock(1000));
    const initial = result.current.getTime();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Fake timers advance Date.now() by the same delta.
    expect(result.current.getTime()).toBe(initial + 1000);
  });

  it('honours a custom interval', () => {
    const { result } = renderHook(() => useClock(500));
    const initial = result.current.getTime();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.getTime()).toBe(initial + 500);
  });

  it('clears its interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useClock());
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
