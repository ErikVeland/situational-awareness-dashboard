import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('starts in loading state then resolves with data', async () => {
    const factory = () => Promise.resolve(42);
    const { result } = renderHook(() => useAsyncData<number>(factory));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('captures rejection as Error', async () => {
    const factory = () => Promise.reject(new Error('boom'));
    const { result } = renderHook(() => useAsyncData<number>(factory));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.data).toBeNull();
  });

  it('wraps non-Error rejections into Error', async () => {
    const factory = () => Promise.reject('string-reason');
    const { result } = renderHook(() => useAsyncData<number>(factory));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('string-reason');
  });

  it('re-fetches when retry() is called', async () => {
    let call = 0;
    const factory = vi.fn(async () => ++call);
    const { result } = renderHook(() => useAsyncData<number>(factory));

    await waitFor(() => expect(result.current.data).toBe(1));

    act(() => { result.current.retry(); });
    await waitFor(() => expect(result.current.data).toBe(2));
    expect(factory).toHaveBeenCalledTimes(2);
  });

  it('ignores stale resolutions after unmount', async () => {
    let resolveFn: (v: number) => void = () => {};
    const factory = () =>
      new Promise<number>((res) => {
        resolveFn = res;
      });
    const { result, unmount } = renderHook(() =>
      useAsyncData<number>(factory),
    );

    unmount();
    await act(async () => {
      resolveFn(7);
      await Promise.resolve();
    });
    // After unmount state should not have updated to 7
    expect(result.current.data).toBeNull();
  });
});
