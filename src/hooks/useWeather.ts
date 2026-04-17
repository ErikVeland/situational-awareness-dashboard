import getWeather from '../api/getWeather';
import type { WeatherData } from '../api/types';
import { useAsyncData, type AsyncState } from './useAsyncData';

export function useWeather(): AsyncState<WeatherData> {
  return useAsyncData<WeatherData>(getWeather);
}
