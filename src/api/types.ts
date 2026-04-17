// ─── Algorithm ────────────────────────────────────────────────────────────────

export type Algorithm =
  | 'Algorithm 1'
  | 'Algorithm 2'
  | 'Algorithm 3'
  | 'Algorithm 4'
  | 'Algorithm 5';

export const ALGORITHMS: Algorithm[] = [
  'Algorithm 1',
  'Algorithm 2',
  'Algorithm 3',
  'Algorithm 4',
  'Algorithm 5',
];

/** Percentage share per algorithm — always sums to 100 */
export type AlgorithmDistribution = Record<Algorithm, number>;

// ─── Ramp ─────────────────────────────────────────────────────────────────────

export interface Ramp {
  id: string;
  algorithm: Algorithm;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

export interface SparklinePoint {
  /** Unix timestamp (ms) */
  timestamp: number;
  /** Percentage 0–100 */
  value: number;
}

export interface SparklineData {
  algorithm: Algorithm;
  /** Capped ring buffer — max 120 entries (60 s × 2 Hz) */
  points: SparklinePoint[];
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy';

export interface WeatherData {
  city: string;
  temperature: number;
  unit: 'C' | 'F';
  condition: WeatherCondition;
  datetime: string;
  humidity: number;
  chanceOfRain: number;
  windSpeed: number;
  windUnit: string;
  tomorrow: {
    temperature: number;
    condition: WeatherCondition;
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export type Severity = 'low' | 'medium' | 'high';

/** Type-safe map from severity → Tailwind CSS class */
export const SEVERITY_CLASS = {
  low: 'bg-gray-500',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
} satisfies Record<Severity, string>;

export interface DelayedRoute {
  id: string;
  name: string;
  via: string[];
  distanceKm: number;
  delayMinutes: number;
  severity: Severity;
}

// ─── Network summary ──────────────────────────────────────────────────────────

export interface NetworkSummary {
  totalRamps: number;
  activeRamps: number;
  incidents: number;
  averageDelayMinutes: number;
  alertThresholdPercent: number;
  currentMaxAlgorithmPercent: number;
}
