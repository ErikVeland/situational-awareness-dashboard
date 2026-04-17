import getNetworkSummary from '../api/getNetworkSummary';
import type { NetworkSummary } from '../api/types';
import { useAsyncData, type AsyncState } from './useAsyncData';

export function useNetworkSummary(): AsyncState<NetworkSummary> {
  return useAsyncData<NetworkSummary>(getNetworkSummary);
}
