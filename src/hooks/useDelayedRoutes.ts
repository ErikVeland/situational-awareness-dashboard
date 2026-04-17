import getDelayedRoutes from '../api/getDelayedRoutes';
import type { DelayedRoute } from '../api/types';
import { useAsyncData, type AsyncState } from './useAsyncData';

export function useDelayedRoutes(): AsyncState<DelayedRoute[]> {
  return useAsyncData<DelayedRoute[]>(getDelayedRoutes);
}
