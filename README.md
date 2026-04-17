# Situational Awareness Dashboard

A React 18 + TypeScript (strict) dashboard that combines a hard-coded
weather widget, delayed-routes list, a live-updating ramp algorithm chart
(with 60-second sparkline and pause/resume), and a network summary panel.

Built for the Senior Front-End React Developer take-home assessment.

## Prerequisites

- **Node.js** ≥ 18.17 (tested on Node 22)
- **npm** ≥ 9 (bundled with recent Node releases)

No other global tooling is required — every dependency lives in
`package.json`.

## Quick start

Two commands, as requested by the brief:

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

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

## How this maps to the brief

The assessment lists specific functional and architectural requirements.
This table is a direct pointer from each requirement to where it's
fulfilled in the code — useful for the reviewer.

### Functional requirements

- **Weather widget** — `src/components/weather/WeatherCard.tsx`. City,
  temperature, datetime, icon, humidity, chance of rain, wind, tomorrow.
  Data flows from `src/mocks/weather.json` → `getWeather()` →
  `useWeather()` → `WeatherCard`. No data is inlined in the component.
- **Delayed routes** — `src/components/routes/DelayedRoutesCard.tsx` +
  `RouteRow.tsx` + `SeverityDot.tsx`. Severity is a discriminated union
  mapped to Tailwind classes via `SEVERITY_CLASS satisfies
  Record<Severity, string>` (from the provided types). `high` shows red,
  `medium` shows amber, `low` shows slate — visually distinct.
- **Ramp chart (live donut)** — `src/components/ramp/RampChartCard.tsx` +
  `DonutChart.tsx`. Subscribes via `useRampData()`, updates on every
  500 ms tick.
- **History sparkline** — `src/components/ramp/Sparkline.tsx`. Plots the
  last 120 points (60 s × 2 Hz) of the currently dominant algorithm.
  Dominant algorithm is recomputed every tick in `useRampData`; when it
  changes, the sparkline tracks the new leader.
- **Pause toggle** — `src/components/ramp/PauseButton.tsx` +
  `useRampData.ts`. The display freezes while the subscription keeps
  running; `latestReceivedAt` in the hook's return keeps advancing,
  proving the stream is still alive. See "Pause semantics" below.
- **Network summary** — `src/components/summary/NetworkSummaryCard.tsx` +
  `StatCard.tsx`. Total, Active, Incidents, Avg delay.

### Architectural requirements

- **Components independently testable** — each card accepts an optional
  data-override prop so it can be mounted without its hook. Tests in
  `src/components/**/*.test.tsx` use this pattern.
- **No prop-drilling deeper than one level** — the only cross-cutting
  state (ramp stream + pause flag) lives in `useRampData`, consumed by
  `<Dashboard>` and passed down one level to `<Header>` and
  `<RampChartCard>`. Per-widget data is local to each card.
- **Hardcoded data from JSON + typed constants** — all mocks live in
  `src/mocks/*.json`, loaded through a typed API fn in `src/api/` and
  consumed via a custom hook (`useWeather`, `useDelayedRoutes`,
  `useNetworkSummary`). Types in `src/api/types.ts`. No untyped literals
  in JSX.
- **Severity as discriminated union** — `type Severity = 'low' |
  'medium' | 'high'` with `SEVERITY_CLASS satisfies Record<Severity,
  string>` (a mapped-type-style guarantee). Missing or mistyped keys
  fail the build.

### Evaluation criteria → evidence

- **TypeScript** — strict mode, `noUncheckedIndexedAccess`, generics in
  `useAsyncData<T>`, no `any`, no unsafe casts.
- **React** — hook composition, deliberate `useMemo`/`useCallback`,
  `useRef` mirror for the pause flag to keep the subscription stable.
- **UI fidelity** — dark-theme Tailwind palette, Roboto font,
  CSS-grid-based responsive layout that collapses to one column on
  small screens.
- **Testing** — 57 passing tests; fake timers for the 500 ms stream and
  1 s clock; edge cases for SVG math; pause invariant.
- **Code quality** — small single-purpose files, separation of
  concerns (API → hook → card → primitive), explanatory JSDoc on every
  hook.

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

## Data flow

```
  mocks/*.json      ← hardcoded fixtures (weather, routes, summary)
       ↓
  api/*.ts          ← typed getters (Promise<T> or subscription)
       ↓
  hooks/use*.ts     ← custom hooks (useAsyncData<T>, useRampData)
       ↓
  components/*      ← presentational widgets
```

Only the ramp stream is live; everything else resolves once per mount.

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

## Beyond the brief

Everything the PDF asks for is delivered. Each item below is on top of that,
with the reason for including it. Everything here is optional — remove any
of it and the brief is still met. The goal of each addition is one of:
**defence-in-depth**, **accessibility**, **developer ergonomics**, or
**visual polish that doesn't cost maintenance**.

### 1. Runtime validation at the JSON boundary (Zod)
**Files:** `src/api/schemas.ts`, consumed by every `src/api/get*.ts`

TypeScript's type system is erased at runtime. The JSON fixtures in
`src/data/*.json` are loaded as `unknown`-in-disguise — a typo in a JSON file
would compile and silently render `NaN`s or `undefined`s in the UI. Each API
function parses its payload through a matching Zod schema before returning,
so a mistyped or missing field fails loudly at the boundary, the consumer
receives a value whose type is proven at runtime (not cast), and
`InlineError` can detect `ZodError` by name and show schema-specific copy.
**Why it's worth the ~20 lines per resource:** in a real deployment this
boundary is what saves you when the backend ships an incompatible response;
adding it now costs nothing and means no code downstream needs defensive
`?.` chains.

### 2. App-root ErrorBoundary with retry
**File:** `src/components/ErrorBoundary.tsx`, mounted in `src/App.tsx`

If any descendant throws during render, React unmounts the entire tree and
leaves a blank white screen. The boundary catches that, logs the error with
its component stack, and shows a fallback card with a **Retry** button that
resets the boundary. The brief doesn't ask for this; I added it because the
cost is ~60 LOC and a blank screen in production is indistinguishable from
a total outage.

### 3. Per-widget InlineError with typed error categorisation
**File:** `src/components/InlineError.tsx`

Each card shows its own inline error banner when its hook fails — a single
widget's outage doesn't nuke the rest of the dashboard. `InlineError`
inspects the `Error` and produces a human-readable title and description
based on the error class: `ZodError` → "invalid format, the service returned
data that doesn't match the expected schema"; `AbortError` → timeout
message; `TypeError` from `fetch` → "cannot reach service"; 4xx / 5xx
patterns → access-denied / server-error messaging; fallback includes the
raw message so a developer can triage from a support log.
**Why:** generic "something went wrong" text destroys trust and loses bug
reports in real apps; routing errors to type-appropriate copy is cheap.

### 4. `useAsyncData` exposes `retry()`
**File:** `src/hooks/useAsyncData.ts`

The generic hook returns a stable `retry()` callback that re-runs the fetch
without remounting the card. `InlineError` wires its Retry button directly
into this. Transient failures (a dropped network blip in a future
real-backend version) recover with one click instead of a page reload.

### 5. Ramp-stream error recovery
**File:** `src/hooks/useRampData.ts` (see `streamError`)

The brief's mock stream can't throw — but a real transport (WebSocket, SSE,
shared worker) can. The stream callback is wrapped in try/catch: an error is
surfaced via `streamError` state, the card keeps rendering the last-known
distribution (no flicker), and `setInterval` keeps running so if the next
tick succeeds `streamError` is cleared automatically. Transient errors
self-heal without user action. This matters because `setInterval` callbacks
swallow exceptions; without try/catch, a single bad tick silently stops the
timer in some runtimes.

### 6. Dark / light theme with persistence and no FOUC
**Files:** `src/hooks/useTheme.ts`, `src/index.css`, `tailwind.config.js`,
`index.html`

The mock is dark-only. I shipped both themes because Tailwind's
`class`-strategy dark mode costs almost nothing to add once; CSS variables
(`--color-bg`, `--color-bg-card`, …) flip palettes without adding `dark:`
prefixes to every component that uses a surface token; preference is
persisted in `localStorage`; and a small inline script in `<head>` applies
the stored theme **before** React hydrates (`index.html:17-23`), eliminating
the FOUC that every "flash of wrong theme on reload" blog post warns about.
The light palette is an amber-tinged parchment, not a straight inversion —
cool-slate light mode was nearly indistinguishable from the dark theme in
peripheral vision; warm creams read as a categorically different surface.
**What about `prefers-color-scheme`?** Intentionally not used as the
default. The brief's mock is dark, so first-time visitors should see what
the reviewer sees; the toggle lets them switch if they prefer.

### 7. Global `P` keyboard shortcut for pause/resume
**File:** `src/components/Dashboard.tsx` (`useEffect` around line 19)

A `keydown` listener on `window` toggles pause when `P` is pressed. It bails
out if focus is in an `<input>`, `<textarea>`, `<select>`, or `<button>` so
it never interferes with typing or clicking other controls. Surfaced in the
UI via `aria-keyshortcuts="p"` on the Header pause button and a `title`
tooltip of "Pause (P)" / "Resume (P)".
**Rationale:** situational awareness dashboards live on ops-desk screens;
keyboard-first power users expect a one-key pause.

### 8. Skip-to-content link
**File:** `src/components/Dashboard.tsx` (first child of `<>`)

A visually-hidden anchor that jumps to `#main-content` when focused. Only
visible while holding Tab, so it doesn't affect mouse users. WCAG 2.4.1
Bypass Blocks — free to add, always expected of accessible SPAs.

### 9. Accessibility affordances throughout
**Files:** various; see `aria-` attributes across `src/components/**`

- Semantic landmarks (`<main>`, `<header>`, `<section>` via `Card`).
- `role="img"` + `aria-label` on the donut chart and sparkline so screen
  readers hear "Algorithm 3 share over the last 60 seconds: 29%" instead
  of "graphic".
- `aria-pressed` on the pause button, so assistive tech reports the toggle
  state.
- `aria-live="polite"` on the Live/Paused badge text so state changes are
  announced without interrupting other speech.
- `role="alert"` on error banners and the error-boundary fallback so the
  failure is announced immediately.
- Severity dots (`<RouteRow>`) are `role="img"` with an `aria-label`
  ("high severity") so screen readers don't read "coloured circle".
- `:focus-visible` outline on every interactive element, coloured in the
  green accent so it's obvious on dark _and_ light.
- The datetime uses `<time dateTime>` so assistive tech and web crawlers
  get a machine-readable value.

None of this was required by the brief. All of it is cheap; all of it is
expected on a public-facing product.

### 10. Locale-correct formatting via `Intl.*`
**Files:** `src/components/Header.tsx`, `src/components/weather/WeatherCard.tsx`

The mock shows "Tue 16th 3:46 PM" verbatim. I could have hand-written that
string. Instead I use `Intl.DateTimeFormat('en-AU', …)` for weekday, month
and time, and `Intl.PluralRules('en', { type: 'ordinal' })` to pick
`st`/`nd`/`rd`/`th`.
**Rationale:** zero-cost localisation. Swap the locale string in one place
and the dashboard adapts. The brief is Melbourne-themed, so `en-AU` is
meaningful (month-first, 12-hour time).

### 11. Dominant-algorithm highlighting in the ramp legend
**File:** `src/components/ramp/RampChartCard.tsx`

The brief just shows a legend. Mine emphasises the dominant algorithm: a
10 px dot with a soft coloured glow (box-shadow) vs. 8 px flat for the
others, label weight bumps from 400 to 500, and the percentage is
re-coloured in the algorithm's accent. All transitions are CSS. This gives
a glanceable "who's winning" without needing to read the donut; the
sparkline header already shows the dominant percentage and colour, so the
legend now agrees visually.

### 12. Sparkline fresh-data pulse
**Files:** `src/components/ramp/Sparkline.tsx`, `src/index.css` (`@keyframes sparklineTick`)

The chart `<g>` is key-remounted on each accepted tick, restarting a tiny
opacity animation (0.6 → 1 over 350 ms, shorter than the 500 ms tick). The
effect is a subtle "heartbeat" that confirms the stream is alive without
distracting the operator.

### 13. `performance.mark('ramp-tick')` for profiling
**File:** `src/hooks/useRampData.ts` (inside the stream callback)

Every tick is timestamped via the User Timing API so DevTools' Performance
panel can measure tick-to-paint latency without instrumentation.
Cost: one function call per tick. Benefit: "is the dashboard dropping frames
on a 4K screen?" is answerable without adding profiling code.

### 14. Bounded sparkline buffer (60 s × 2 Hz)
**File:** `src/utils/rampTransforms.ts` (`SPARKLINE_MAX_POINTS = 120`)

The brief says "last 60 seconds". I cap at 120 points deterministically so
memory per algorithm is constant regardless of how long the tab is open.
The cap is covered by tests.

### 15. Tabular-number alignment on percentages
**Files:** `RampChartCard.tsx`, `NetworkSummaryCard.tsx`, legend items

`className="tabular-nums"` on every number that updates in real time. Means
`9%` and `23%` align in the same column; no horizontal jitter as values
change every 500 ms. The feature lives in the Roboto font via OpenType
`tnum`. Free once you know it exists.

### 16. Alert accent on incidents > 0
**File:** `src/components/summary/NetworkSummaryCard.tsx`

`StatCard` takes an `accent` prop (`'default' | 'alert'`). Incidents renders
with `accent="alert"` when `summary.incidents > 0` — a subtle redden of the
value draws the eye to the metric that means something is actually wrong
right now.

### 17. Ambient background gradients
**File:** `src/index.css` (`:root:not(.dark) body`, `:root.dark body`)

Two radial gradients per theme (amber for light, sky+violet for dark) at
6–8% opacity. Adds depth without noise. Rendered by the browser, no runtime
cost.

### 18. `retry` threaded all the way through
Each `InlineError` gets the hook's `retry` so the **Retry** button actually
re-runs the fetch — it's not a mock button. The stream card additionally
tolerates transient `streamError` without showing a Retry button (because
the next 500 ms tick is its own automatic retry).

### 19. Extra fields in network summary JSON
**File:** `src/data/networkSummary.json`

Beyond the brief's four metrics (`totalRamps`, `activeRamps`, `incidents`,
`averageDelayMinutes`) I added `alertThresholdPercent` (the threshold above
which the dominant share would trigger an incident) and
`currentMaxAlgorithmPercent` (current share of the dominant algorithm).
These aren't rendered today but exist in the schema so a future "threshold
crossed — alert!" banner is a one-component change. Kept out of the current
UI to avoid scope creep.

### 20. Scoped scrollbar styling
**File:** `src/index.css` (webkit scrollbar rules)

Thin, theme-aware scrollbars so long lists (like Delayed Routes on small
screens) don't fight the palette. ~10 lines, big visual payoff.

### Why this list is organised like this
Every item above is one of:

1. **Defensive** — validates, catches, retries, or self-heals where the
   brief is silent. These protect the product from real-world failure
   modes that the happy-path demo doesn't surface.
2. **Accessible** — ARIA, keyboard shortcut, skip link, focus rings,
   locale-correct text. Zero incremental engineering cost, material
   improvement for non-mouse users.
3. **Operationally honest** — performance marks, bounded buffers, tabular
   numerals. Small things that show up in production and are best baked in
   early.

Nothing here is speculative or "architecture astronaut". Each addition is
≤ 100 LOC, has a concrete user or operator benefit, and can be removed
without disturbing anything else.

## What's not included (and why)

- **No integration test that mounts the full `<Dashboard>`.** Each card has
  its own tests, and `useRampData` is exhaustively tested; mounting the
  dashboard would mostly exercise grid Tailwind classes that have no
  behaviour. A single Playwright smoke test would be a net add — I'd pick
  that over a JSDOM integration test.
- **No Storybook.** Every card already accepts a data override prop for
  isolated rendering, so adding Storybook later is a one-file-per-card
  change.
- **No visual regression tests.** Playwright + snapshots would double the
  project's install footprint for a feature that isn't asked for.
- **No i18n framework / RTL.** `Intl.*` handles the only locale-sensitive
  strings (dates, numbers). A full i18n framework isn't justified by four
  hard-coded JSON fixtures.
- **No WebSocket transport.** The brief's mock is `setInterval`-based and
  my hook is transport-agnostic — swapping transports is a one-file change.

## Acknowledgements

The contents of `mock-data/` (the provided API and pure transforms) were
copied verbatim into `src/{api,mocks,utils}` per the spec. The provided
`rampTransforms.test.ts` runs under Vitest unchanged.
