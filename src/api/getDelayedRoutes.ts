import routesJson from '../data/delayedRoutes.json';
import { delayedRoutesSchema } from './schemas';
import type { DelayedRoute } from './types';

/**
 * Mock delayed-routes API.
 * Returns a promise so callers can swap it for a real fetch with no changes.
 *
 * Zod validates the JSON at the boundary so callers receive a typed value
 * without unsafe casts.
 */
async function getDelayedRoutes(): Promise<DelayedRoute[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return delayedRoutesSchema.parse(routesJson);
}

export default getDelayedRoutes;
