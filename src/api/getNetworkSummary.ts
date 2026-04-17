import { type NetworkSummary } from './types';
import summaryJson from '../mocks/networkSummary.json';

/**
 * Mock network-summary API.
 * Returns a promise so callers can swap it for a real fetch with no changes.
 */
async function getNetworkSummary(): Promise<NetworkSummary> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return summaryJson as NetworkSummary;
}

export default getNetworkSummary;
