# Situational Awareness Dashboard

A React 18 + TypeScript (strict) dashboard that combines a hard-coded
weather widget, delayed-routes list, a live-updating ramp algorithm chart
(with 60-second sparkline and pause/resume), and a network summary panel.

Built for the Senior Front-End React Developer take-home assessment.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Other scripts

| Command              | Purpose                                             |
| -------------------- | --------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server                           |
| `npm run build`      | Type-check and produce a production build            |
| `npm run preview`    | Preview the production build                         |
| `npm test`           | Run the full Vitest suite                           |
| `npm run test:watch` | Run Vitest in watch mode                            |
| `npm run lint`       | Run ESLint                                          |
| `npm run typecheck`  | Type-check without emitting                         |

## Stack

- **React 18** with `StrictMode` enabled.
- **TypeScript** in strict mode, with `noUncheckedIndexedAccess` and
  `noImplicitAny` on. No `any`, no unsafe casts beyond the minimum needed to
  bootstrap empty records typed by `Algorithm`.
- **Vite** for dev / build.
- **Tailwind CSS** for styling. Chosen because the provided types already
  expose Tailwind class names (`SEVERITY_CLASS = { high: 'bg-red-500', … }
  satisfies Record<Severity, string>`), and because it lets us hit the
  dark-theme mock quickly without maintaining a large custom CSS file.
- **Vitest + Testing Library** for unit and component tests.
  Jest-compatible API, so the provided `rampTransforms.test.ts` runs as-is.
- **No charting library** — the donut and sparkline are hand-rolled SVG.
  See _Tradeoffs_ below.

## Project layout

```
src/
├── api/                          # Provided mock API + types (unchanged)
├── mocks/                        # Provided hardcoded JSON
├── utils/                        # Provided pure transforms + tests
├── hooks/
│   ├── useAsyncData.ts           # Generic Promise → state
│   ├── useWeather.ts             # Thin wrappers around the mock APIs
│   ├── useDelayedRoutes.ts
│   ├── useNetworkSummary.ts
│   ├── useClock.ts               # 1-second ticker for the header
│   └── useRampData.ts            # Live stream + distribution + sparkline + pause
├── theme/
│   └── algorithmColors.ts        # Per-algorithm palette
├── components/
│   ├── Dashboard.tsx             # Page layout
│   ├── Header.tsx                # Title, LIVE/PAUSED badge, clock
│   ├── Card.tsx                  # Shared card shell
│   ├── weather/                  # Weather widget + icon
│   ├── routes/                   # Delayed routes list + row + severity dot
│   ├── ramp/                     # Ramp chart, donut, sparkline, pause button
│   └── summary/                  # Network summary cards
└── test/setup.ts                 # jest-dom matchers
```

Each card is independently testable — its visible data is either a prop
override or comes from its own hook. The tests in
`src/components/**/*.test.tsx` exercise the widgets with inline fixtures.

## State architecture

There is exactly one piece of state that crosses component boundaries: the
live ramp stream plus the pause flag. Both the `<Header>` LIVE/PAUSED
badge and the `<RampChartCard>` need to read them.

Rather than reach for Context or a store, `useRampData()` is created once
in `<Dashboard>` and passed into `<RampChartCard>` by composition. This
covers the "avoid prop-drilling more than one level deep" requirement
without the boilerplate of a Provider. If a third consumer of the stream
were ever added (e.g. notifications or audit logging), the hook can be
promoted to a Context Provider in a single change — the hook's return type
is already the provider's shape.

Per-widget data (`useWeather`, `useDelayedRoutes`, `useNetworkSummary`) is
local to the card that renders it. That keeps each card self-contained
and mountable in isolation in tests or a future Storybook. A generic
`useAsyncData<T>` factors out the Promise→state plumbing, including
cancellation-on-unmount.

### `useRampData` — pause semantics

The assessment explicitly calls for "freezing the displayed chart and
sparkline while data continues to be received in the background". The
hook implements this by:

1. Registering exactly **one** subscription to the mock stream inside a
   `useEffect` with an empty dep array.
2. Storing the `paused` flag in state and mirroring it in a `useRef`, so
   the stream callback always observes the latest value without
   resubscribing (which would reset timers and history).
3. Always updating `latestReceivedAt` and `latestRampCount` (so the UI can
   still prove the stream is alive), and only flushing `distribution` and
   `history` when `!pausedRef.current`.
4. Using functional state updaters throughout, which is both
   `StrictMode`-safe and avoids stale closures.

This invariant is covered by dedicated tests in
`src/hooks/useRampData.test.ts` (fake timers, mocked `Math.random` for
determinism).

## Memoisation strategy

Memoisation is used deliberately, not reflexively:

- **Pure derivations.** `dominantAlgorithm` in `useRampData` is a
  `useMemo` over `distribution` — recomputing on every render would be
  trivial, but the memo makes the intent explicit and keeps the
  referential stability of the result.
- **SVG geometry.** `DonutChart` memoises its arc-path list and
  `Sparkline` memoises its path `d` attribute. These are the only
  computations in the codebase that scale with data size (per-point
  clamping, polar math). They re-run only when `distribution` /
  `points` change.
- **Callbacks crossing memoisation boundaries.** `togglePause` is wrapped
  in `useCallback` so future `React.memo` on `<PauseButton>` doesn't
  break.
- **Header date formatting** is `useMemo`'d — cheap, but rendered every
  second via the clock tick, so avoiding string churn is worth it.

The sparkline buffer itself does _not_ need React-level memoisation
because `appendSparklinePoint` returns a new array per tick — we rely on
React's default `Object.is` comparison to re-render the chart exactly
once per accepted tick.

## TypeScript

- `Severity` is the required `'low' | 'medium' | 'high'` discriminated
  union, mapped to CSS classes via
  `SEVERITY_CLASS satisfies Record<Severity, string>` (from the provided
  types) — wrong keys or wrong-typed values fail the build.
- `AlgorithmDistribution = Record<Algorithm, number>` — exhaustive by
  construction.
- `useAsyncData<T>` is generic and preserves the payload type through to
  the consuming hook.
- Paths with bracketed index access (`ALGORITHMS[0]`) account for
  `noUncheckedIndexedAccess` — we either narrow with a non-null assertion
  (`ALGORITHMS[0]!`, safe because `ALGORITHMS` is a literal constant) or
  handle `undefined` explicitly.

## Testing

All code I wrote has tests. Highlights:

- **Fake timers** (`vi.useFakeTimers`) exercise the 500 ms polling tick
  in `useRampData` and the 1 s clock in `useClock`.
- **Deterministic randomness** — `vi.spyOn(Math, 'random')` in the ramp
  tests makes the distribution reproducible.
- **Pause invariant** — a dedicated test pauses, advances 2 s of fake
  time, and asserts that the displayed distribution and history have
  _not_ changed while `latestReceivedAt` has.
- **Cleanup** — both timer-based hooks spy on `clearInterval` to ensure
  unmount releases resources.
- **Edge cases in SVG builders** — empty data, single point, full-circle
  arc, values outside the domain are all covered.

Run them all with:

```bash
npm test
```

## Tradeoffs made consciously

- **Hand-rolled SVG charts instead of Recharts/Victory.** The donut and
  sparkline are both simple enough that the chart component is ~100
  lines of code each. The benefits: zero runtime dependency, tiny
  bundle, deterministic output I can snapshot test directly, and the
  geometry logic is exported for unit testing (`buildArcPath`,
  `buildSparklinePath`). The cost: no hover tooltips, no animated
  transitions, no axes. For a situational-awareness dashboard at this
  scale those are not missed. For a product feature I would reach for
  Recharts.
- **`useRampData` returns a full bag instead of a Provider.** The live
  stream is a singleton by nature (we only want one interval running)
  but hooks re-run the subscription on each call. Centralising it in the
  `<Dashboard>` and passing `ramp` down one level is simpler than
  wrapping the tree in a Context, and the ramp data is only read by
  `<Header>` (for the LIVE badge) and `<RampChartCard>`. If a third
  consumer is added, promoting this to Context is a one-file change.
- **Promise-based hooks stay local to each card** instead of being
  lifted. This makes each widget mountable in isolation, which is
  valuable for tests and future Storybook. The duplicated `useEffect`
  overhead is negligible for four hard-coded JSON payloads.
- **No formal data-fetching library (React Query, SWR).** At four
  endpoints, one of which is a live subscription, the ceremony of a
  library outweighs the benefits. The generic `useAsyncData` hook is
  one-file and easily swapped later.
- **Approximate visual fidelity.** The mock's exact hex values aren't
  published, so the dark palette and algorithm colours are derived from
  Tailwind's Slate + jewel tones to match the feel. Layout, typography
  (Roboto), and component placement match the mock.

## What's not included (and why)

- No integration test that mounts the full `<Dashboard>`. Each card has
  its own tests, and `useRampData` is exhaustively tested; mounting the
  dashboard would mostly exercise grid Tailwind classes that have no
  behaviour.
- No production-grade error boundary. For a real deployment I'd add one
  at the `<Dashboard>` root; it's easy to bolt on and wasn't part of the
  functional spec.
- No i18n / RTL.

## Acknowledgements

The contents of `mock-data/` (the provided API and pure transforms) were
copied verbatim into `src/{api,mocks,utils}` per the spec. The provided
`rampTransforms.test.ts` runs under Vitest unchanged.
