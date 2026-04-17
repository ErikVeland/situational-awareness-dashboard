import { type DelayedRoute } from './types';
import routesJson from '../mocks/delayedRoutes.json';

/**
 * Mock delayed-routes API.
 * Returns a promise so callers can swap it for a real fetch with no changes.
 */
async function getDelayedRoutes(): Promise<DelayedRoute[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return routesJson as DelayedRoute[];
}

export default getDelayedRoutes;
