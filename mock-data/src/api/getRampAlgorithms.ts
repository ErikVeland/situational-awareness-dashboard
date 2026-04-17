import { type Algorithm, type Ramp, ALGORITHMS } from './types';

/**
 * Mock API — returns a cleanup function (call it to stop polling).
 *
 * Fires onUpdate immediately, then every 500 ms.
 * Each call produces 50 ramps with randomly assigned algorithms.
 */
function getRampAlgorithms(onUpdate: (ramps: Ramp[]) => void): () => void {
  const count = 50;

  const tick = (): void => {
    const ramps: Ramp[] = Array.from({ length: count }, (_, i) => ({
      id: `ramp-${i}`,
      algorithm: ALGORITHMS[
        Math.floor(Math.random() * ALGORITHMS.length)
      ] as Algorithm,
    }));
    onUpdate(ramps);
  };

  tick(); // fire immediately so UI doesn't wait 500 ms on mount
  const id = setInterval(tick, 500);
  return () => clearInterval(id);
}

export default getRampAlgorithms;
