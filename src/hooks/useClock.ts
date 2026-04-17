import { useEffect, useState } from 'react';

/**
 * Returns a Date that updates every `intervalMs` milliseconds.
 * Default interval is 1 second, suitable for a clock display.
 */
export function useClock(intervalMs: number = 1_000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
