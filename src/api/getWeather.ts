import weatherJson from '../data/weather.json';
import { weatherDataSchema } from './schemas';
import type { WeatherData } from './types';

/**
 * Mock weather API.
 * In a real app this would hit a REST endpoint.
 * Returns a promise so callers can swap it for a real fetch with no changes.
 *
 * Zod validates the JSON at the boundary so callers receive a typed value
 * without unsafe casts.
 */
async function getWeather(): Promise<WeatherData> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 80));
  return weatherDataSchema.parse(weatherJson);
}

export default getWeather;
