# Mock Data & API Layer

Drop the contents of `src/` into your project. All imports go through the barrel:

```ts
import {
  getRampAlgorithms,
  getWeather,
  getDelayedRoutes,
  getNetworkSummary,
  rampsToDistribution,
  appendSparklinePoint,
  generateSparklineSeed,
} from './src';
```

---

## File structure

```
src/
├── index.ts                    ← barrel — import everything from here
├── api/
│   ├── types.ts                ← all shared TypeScript types
│   ├── getRampAlgorithms.ts    ← 500ms polling mock (returns cleanup fn)
│   ├── getWeather.ts           ← promise-based mock
│   ├── getDelayedRoutes.ts     ← promise-based mock
│   └── getNetworkSummary.ts    ← promise-based mock
├── mocks/
│   ├── weather.json
│   ├── delayedRoutes.json
│   └── networkSummary.json
└── utils/
    ├── rampTransforms.ts       ← pure functions (safe in useMemo)
    └── rampTransforms.test.ts  ← Jest unit tests
```

---

## API reference

### `getRampAlgorithms(onUpdate)`

Polls every 500 ms. Returns a cleanup function — call it in `useEffect` return.

```ts
useEffect(() => {
  return getRampAlgorithms((ramps) => {
    const dist = rampsToDistribution(ramps);
    setHistory((prev) => appendSparklinePoint(prev, dist['Algorithm 1']));
    setDistribution(dist);
  });
}, []);
```

### `getWeather()` / `getDelayedRoutes()` / `getNetworkSummary()`

All return a `Promise`. Use with `useEffect` + `useState` or React Query.

```ts
useEffect(() => {
  getWeather().then(setWeather);
  getDelayedRoutes().then(setRoutes);
  getNetworkSummary().then(setSummary);
}, []);
```

---

## Sparkline utilities

### `rampsToDistribution(ramps)`

Pure function. Converts `Ramp[]` → `AlgorithmDistribution` (percentages, sums to 100).

### `appendSparklinePoint(buffer, value, timestamp?)`

Appends a point and trims the buffer to 120 entries (60 s × 2 Hz). **Returns a new array** — safe for React state.

### `generateSparklineSeed(options?)`

Pre-seeds the sparkline history so the chart isn't empty on first render.

```ts
const [history, setHistory] = useState<SparklinePoint[]>(() =>
  generateSparklineSeed({ baseValue: 20 })
);
```

| Option | Default | Description |
|---|---|---|
| `count` | `80` | Number of initial points |
| `baseValue` | `20` | Centre value (%) |
| `amplitude` | `6` | Sine-wave swing (±%) |
| `jitter` | `4` | Random noise (±%) |
| `endTime` | `Date.now()` | Timestamp of last point |
| `intervalMs` | `500` | Gap between points |

### `trimToWindow(buffer, windowMs, now?)`

Alternative to fixed-count cap — returns only points within the last `windowMs` milliseconds.

---

## Types

```ts
type Algorithm = 'Algorithm 1' | 'Algorithm 2' | 'Algorithm 3' | 'Algorithm 4' | 'Algorithm 5';
type AlgorithmDistribution = Record<Algorithm, number>;
type Severity = 'low' | 'medium' | 'high';

interface SparklinePoint { timestamp: number; value: number; }
interface Ramp           { id: string; algorithm: Algorithm; }
interface DelayedRoute   { id: string; name: string; via: string[]; distanceKm: number; delayMinutes: number; severity: Severity; }
interface WeatherData    { city: string; temperature: number; ... }
interface NetworkSummary { totalRamps: number; activeRamps: number; incidents: number; ... }
```
