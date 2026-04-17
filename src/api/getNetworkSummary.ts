import summaryJson from '../data/networkSummary.json';
import { networkSummarySchema } from './schemas';
import type { NetworkSummary } from './types';

/**
 * Mock network-summary API.
 * Returns a promise so callers can swap it for a real fetch with no changes.
 *
 * Zod validates the JSON at the boundary so callers receive a typed value
 * without unsafe casts.
 */
async function getNetworkSummary(): Promise<NetworkSummary> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return networkSummarySchema.parse(summaryJson);
}

export default getNetworkSummary;
