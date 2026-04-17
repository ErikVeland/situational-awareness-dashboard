import { z } from 'zod';

// ─── Shared ───────────────────────────────────────────────────────────────────

export const algorithmSchema = z.enum([
  'Algorithm 1',
  'Algorithm 2',
  'Algorithm 3',
  'Algorithm 4',
  'Algorithm 5',
]);

export const weatherConditionSchema = z.enum([
  'sunny',
  'partly-cloudy',
  'cloudy',
  'rainy',
]);

export const severitySchema = z.enum(['low', 'medium', 'high']);

// ─── Weather ──────────────────────────────────────────────────────────────────

export const weatherDataSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  unit: z.enum(['C', 'F']),
  condition: weatherConditionSchema,
  datetime: z.string(),
  humidity: z.number().min(0).max(100),
  chanceOfRain: z.number().min(0).max(100),
  windSpeed: z.number().nonnegative(),
  windUnit: z.string(),
  tomorrow: z.object({
    temperature: z.number(),
    condition: weatherConditionSchema,
  }),
});

// ─── Routes ───────────────────────────────────────────────────────────────────

export const delayedRouteSchema = z.object({
  id: z.string(),
  name: z.string(),
  via: z.array(z.string()),
  distanceKm: z.number().nonnegative(),
  delayMinutes: z.number().nonnegative(),
  severity: severitySchema,
});

export const delayedRoutesSchema = z.array(delayedRouteSchema);

// ─── Network summary ──────────────────────────────────────────────────────────

export const networkSummarySchema = z.object({
  totalRamps: z.number().nonnegative(),
  activeRamps: z.number().nonnegative(),
  incidents: z.number().nonnegative(),
  averageDelayMinutes: z.number().nonnegative(),
  alertThresholdPercent: z.number().min(0).max(100),
  currentMaxAlgorithmPercent: z.number().min(0).max(100),
});
