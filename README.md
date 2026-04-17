# Situational Awareness Dashboard

React 18 + TypeScript (strict) dashboard: weather, delayed routes, a
live ramp-algorithm donut with a 60-second history sparkline and a
pause toggle, and a network summary panel. Built for the Senior
Front-End React Developer take-home.

## Prerequisites

- Node.js ≥ 18.17 (I've been on Node 22)
- npm ≥ 9

Everything else is in `package.json`.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

### Scripts

| Command                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Vite dev server                         |
| `npm run build`        | Typecheck + production build            |
| `npm run preview`      | Preview the production build            |
| `npm test`             | Vitest, one-shot                        |
| `npm run test:watch`   | Vitest in watch mode                    |
| `npm run lint`         | ESLint                                  |
| `npm run lint:fix`     | ESLint with `--fix`                     |
| `npm run format`       | Prettier `--write` across the repo      |
| `npm run format:check` | Prettier `--check` (CI-safe, no writes) |
| `npm run typecheck`    | `tsc --noEmit`                          |

## How this maps to the brief

### Functional requirements

- **Weather widget** — `src/components/weather/WeatherCard.tsx`. City,
  temperature, datetime, icon, humidity, chance of rain, wind,
  tomorrow. Data flows `src/data/weather.json` → `getWeather()` →
  `useWeather()` → `WeatherCard`; nothing is inlined.
- **Delayed routes** — `DelayedRoutesCard.tsx` + `RouteRow.tsx` +
  `SeverityDot.tsx`. Severity is a discriminated union mapped to
  Tailwind classes via `SEVERITY_CLASS satisfies Record<Severity,
string>`: `high` is red, `medium` is amber, `low` is slate.
- **Ramp chart** — `RampChartCard.tsx` + `DonutChart.tsx`, subscribed
  via `useRampData()`, updated on every 500 ms tick.
- **History sparkline** — `Sparkline.tsx` plots the last 120 points
  (60 s × 2 Hz) of the currently dominant algorithm. Dominance is
  recomputed each tick, so when the leader changes, the sparkline
  tracks the new one.
- **Pause toggle** — `PauseButton.tsx` + `useRampData.ts`. The display
  freezes while the subscription keeps running; `latestReceivedAt`
  keeps advancing so the UI can prove the stream is alive. Mechanics
  below under _Pause semantics_.
- **Network summary** — `NetworkSummaryCard.tsx` + `StatCard.tsx`:
  Total, Active, Incidents, Avg delay.

### Architectural requirements

- **Independently testable widgets** — every card accepts an optional
  data-override prop so it can be mounted without its hook. Component
  tests in `src/components/**/*.test.tsx` use this.
- **No prop-drilling past one level** — the only cross-cutting state
  (the ramp stream + pause flag) lives in `useRampData`, is created
  once in `<Dashboard>`, and is handed down one level to `<Header>`
  and `<RampChartCard>`. Everything else is card-local.
- **Hardcoded data from JSON + typed constants** — fixtures sit under
  `src/data/*.json`, are loaded via a typed API function in `src/api/`,
  and are consumed through a hook (`useWeather`, `useDelayedRoutes`,
  `useNetworkSummary`). Types live in `src/api/types.ts`.
- **Severity as a discriminated union** — `type Severity = 'low' |
'medium' | 'high'` with `SEVERITY_CLASS satisfies Record<Severity,
string>`. Missing or mistyped keys fail the build.

### Evaluation criteria

- **TypeScript** — strict mode, `noUncheckedIndexedAccess`, generics
  in `useAsyncData<T>`, no `any`, no unsafe casts.
- **React** — hook composition, deliberate `useMemo` / `useCallback`,
  a `useRef` mirror for the pause flag so the subscription stays
  stable.
- **UI fidelity** — dark-theme Tailwind palette, Roboto, responsive
  grid that collapses to a single column on small screens.
- **Testing** — 59 passing specs; fake timers for the 500 ms stream
  and the 1 s clock; SVG edge cases; pause invariant.
- **Code quality** — small files, API → hook → card → primitive,
  JSDoc on every hook.

## Stack

- **React 18** with `StrictMode` on.
- **TypeScript** strict, plus `noUncheckedIndexedAccess` and
  `noImplicitAny`. No `any`, no unsafe casts beyond the one-liner that
  seeds empty records keyed by `Algorithm`.
- **Vite** for dev and build.
- **Tailwind CSS.** The provided types already ship Tailwind class
  names (`SEVERITY_CLASS = { high: 'bg-red-500', … }`), and it hits
  the dark-theme mock without maintaining a pile of scoped CSS.
- **Vitest + Testing Library.** Jest-compatible API, so the provided
  `rampTransforms.test.ts` runs unchanged.
- **Zod** at the JSON boundary — see _Beyond the brief_.
- **Husky + lint-staged + Prettier** for pre-commit hygiene — see
  _Tooling_ below.
- **No charting library.** The donut and sparkline are hand-rolled SVG;
  see _Tradeoffs_.

## Project layout

```
src/
├── api/                          # Provided mock API + types + Zod schemas
├── data/                         # JSON fixtures (hardcoded per brief)
├── utils/                        # Provided pure transforms + tests
├── hooks/
│   ├── useAsyncData.ts           # Generic Promise → state, with retry()
│   ├── useWeather.ts             # Thin wrappers around the mock APIs
│   ├── useDelayedRoutes.ts
│   ├── useNetworkSummary.ts
│   ├── useClock.ts               # 1-second ticker for the header
│   ├── useTheme.ts               # Dark/light toggle + localStorage
│   └── useRampData.ts            # Live stream + distribution + sparkline + pause
├── theme/
│   └── algorithmColors.ts        # Per-algorithm palette
├── components/
│   ├── Dashboard.tsx             # Layout + global keyboard shortcut
│   ├── Header.tsx                # Title, Live/Paused badge, clock, theme toggle
│   ├── Card.tsx                  # Shared card shell
│   ├── ErrorBoundary.tsx
│   ├── InlineError.tsx
│   ├── weather/                  # Weather widget + icon
│   ├── routes/                   # Delayed routes list + row + severity dot
│   ├── ramp/                     # Ramp chart, donut, sparkline, pause button
│   │                             #   *.geom.ts = pure SVG geometry (unit-tested)
│   └── summary/                  # Network summary cards
└── test/setup.ts
```

Each card is independently testable — its visible data is either a
prop override or comes from its own hook. The component tests
exercise the widgets with inline fixtures.

## Data flow

```
  data/*.json     ← hardcoded fixtures (weather, routes, summary)
       ↓
  api/*.ts        ← typed getters; JSON parsed through Zod schemas
       ↓
  hooks/use*.ts   ← useAsyncData<T>, useRampData
       ↓
  components/*    ← presentational widgets
```

Only the ramp stream is live; everything else resolves once per mount.

## State architecture

Exactly one piece of state crosses component boundaries: the live
ramp stream plus the pause flag. `<Header>` needs them for the
Live/Paused badge, `<RampChartCard>` needs them for the donut,
sparkline, and pause button.

Instead of Context or an external store, `useRampData()` is called
once in `<Dashboard>` and the result is passed into `<RampChartCard>`
by composition. That satisfies the "no prop-drilling past one level"
constraint without the Provider boilerplate. If a third consumer
ever shows up — a banner, an audit log, anything — promoting the
hook to a Context Provider is a one-file change; the return shape
is already provider-friendly.

Per-widget data (`useWeather`, `useDelayedRoutes`,
`useNetworkSummary`) stays local to the card that renders it. That
keeps each widget self-contained and mountable in isolation. A
generic `useAsyncData<T>` handles the Promise → state plumbing,
including cancellation on unmount and a stable `retry()` callback
for the inline error banners.

### `useRampData` — pause semantics

The brief says "freeze the displayed chart and sparkline while data
continues to be received in the background". The hook does that by:

1. Registering exactly one subscription in a `useEffect` with an
   empty dep array.
2. Keeping the paused flag in state and mirroring it in a `useRef`,
   so the callback always sees the current value without
   resubscribing — resubscribing would reset the timer and the
   history.
3. Always updating `latestReceivedAt` and `latestRampCount` (so the
   UI can show the stream is alive) and only flushing `distribution`
   and `history` when `!pausedRef.current`.
4. Using functional state updaters throughout, which is StrictMode-safe
   and sidesteps stale closures.

This invariant is covered by `src/hooks/useRampData.test.ts` with
fake timers and a mocked `Math.random`.

## Memoisation

I memoise when there's a concrete reason, not reflexively:

- **Pure derivations.** `dominantAlgorithm` is a `useMemo` over
  `distribution`. Recomputing on every render is cheap, but the memo
  keeps a stable reference and makes intent explicit.
- **SVG geometry.** `DonutChart` memoises its arc-path list, and
  `Sparkline` memoises its path `d` attribute. These are the only
  computations that scale with data size (per-point clamping, polar
  math).
- **Stable callbacks.** `togglePause` is wrapped in `useCallback` so
  a future `React.memo` on `<PauseButton>` won't break.
- **Header date formatting** is `useMemo`'d — cheap, but rendered
  every second, so avoiding string churn is worth it.

The sparkline buffer itself doesn't need React-level memoisation:
`appendSparklinePoint` returns a new array per tick, so `Object.is`
does the right thing and the chart re-renders exactly once per
accepted tick.

## TypeScript

- `Severity` is the required `'low' | 'medium' | 'high'` union,
  mapped to CSS classes via `SEVERITY_CLASS satisfies Record<Severity,
string>`. Wrong keys or wrong-typed values fail the build.
- `AlgorithmDistribution = Record<Algorithm, number>` — exhaustive by
  construction.
- `useAsyncData<T>` is generic and preserves the payload type all the
  way to the consumer.
- Bracketed index access (`ALGORITHMS[0]`) respects
  `noUncheckedIndexedAccess`. I either narrow with a non-null
  assertion (safe because `ALGORITHMS` is a module-level literal
  constant) or handle `undefined` explicitly.

## Testing

Highlights:

- **Fake timers** (`vi.useFakeTimers`) for the 500 ms stream in
  `useRampData` and the 1 s clock in `useClock`.
- **Deterministic randomness** — `vi.spyOn(Math, 'random')` in the
  ramp tests makes the distribution reproducible.
- **Pause invariant** — advance 2 s of fake time while paused, assert
  the displayed distribution and history didn't change, assert
  `latestReceivedAt` did.
- **Cleanup** — both timer-based hooks verify `clearInterval` fires on
  unmount.
- **SVG edge cases** — empty data, single point, full-circle arc,
  out-of-domain values.

```bash
npm test
```

## Tradeoffs

<details>
<summary>Five conscious tradeoffs (click to expand)</summary>

- **Hand-rolled SVG instead of Recharts/Victory.** The donut and
  sparkline are ~100 LOC each. Upside: no runtime dependency, tiny
  bundle, deterministic output that snapshot-tests cleanly, and the
  geometry (`buildArcPath` in `DonutChart.geom.ts`,
  `buildSparklinePath` in `Sparkline.geom.ts`) is exported as pure
  functions I can unit-test. Downside: no hover tooltips, no
  animations, no axes. For a real product I'd reach for Recharts.
- **`useRampData` returns a value, not a Provider.** The stream is a
  singleton (one interval) but hooks re-run the subscription on each
  call. Centralising it in `<Dashboard>` and passing `ramp` down one
  level is simpler than wrapping the tree in Context, and only two
  things read it today.
- **Per-card hooks instead of lifted data.** Each widget mounts in
  isolation, which is useful for tests and for a future Storybook.
  Four `useEffect`s across four JSON fixtures isn't a measurable
  cost.
- **No React Query / SWR.** Four endpoints, one of which is a live
  subscription. Nothing to cache, nothing to dedupe. `useAsyncData`
  is one file and easy to swap.
- **Approximate visual fidelity.** The mock's exact hex values aren't
  published, so the dark palette and algorithm colours are picked
  from Tailwind Slate + jewel tones to match the feel. Layout,
  typography (Roboto), and placement match the mock.

</details>

## Beyond the brief

The brief is covered. Below is what I went further on and why.
Everything here is optional — the brief still passes without any of
it — but each piece earns its place by being either defensive, more
accessible, or cheap operational polish. Click any entry to expand it.

<details>
<summary><strong>1. Zod at the JSON boundary</strong></summary>

`src/api/schemas.ts`, used in every `src/api/get*.ts`.

TypeScript's types are erased at runtime, so `src/data/*.json` is
effectively `unknown`. A typo in a JSON file compiles fine and shows
up as `NaN` three components deeper. Each API function parses its
payload through a Zod schema before returning, so bad fields fail
loudly at the boundary, nothing downstream needs defensive `?.`
chains, and `InlineError` can recognise `ZodError` by name and show
schema-specific copy. Twenty lines per resource, and it's what stops
a silent regression the day a real backend ships an incompatible
response.

</details>

<details>
<summary><strong>2. App-root ErrorBoundary with retry</strong></summary>

`src/components/ErrorBoundary.tsx`, mounted in `src/App.tsx`.

If anything throws during render React unmounts the whole tree and
the user gets a white screen indistinguishable from an outage. The
boundary catches that, logs the stack, and shows a fallback card
with a Retry button that resets its own state. ~60 LOC well spent.

</details>

<details>
<summary><strong>3. Per-widget InlineError with typed categorisation</strong></summary>

`src/components/InlineError.tsx`.

One widget's failure shouldn't kill the whole dashboard, so each card
renders its own inline banner. `InlineError` inspects the `Error`
and picks copy accordingly: `ZodError` → "invalid format";
`AbortError` → timeout; fetch `TypeError` → "cannot reach service";
4xx / 5xx patterns → access-denied or server-error. The fallback
includes the raw message so a developer can triage from a support
log. Generic "something went wrong" copy is how you lose bug reports.

</details>

<details>
<summary><strong>4. <code>useAsyncData</code> exposes <code>retry()</code></strong></summary>

`src/hooks/useAsyncData.ts`.

The hook returns a stable `retry()` that re-runs the fetch without
remounting the card, and `InlineError`'s Retry button is wired into
it. A transient blip is one click, not a page reload.

</details>

<details>
<summary><strong>5. Ramp-stream error recovery</strong></summary>

`src/hooks/useRampData.ts`, look for `streamError`.

The brief's mock can't throw, but any real transport (WebSocket, SSE,
shared worker) can. The stream callback is wrapped in try/catch: the
error is surfaced via `streamError`, the card keeps rendering the
last-known distribution (no flicker), and `setInterval` keeps going
so the next successful tick clears the error automatically.
`setInterval` callbacks swallow exceptions in most runtimes — without
the try/catch, one bad tick silently stops the timer.

</details>

<details>
<summary><strong>6. Dark / light theme, persisted, no FOUC</strong></summary>

`src/hooks/useTheme.ts`, `src/index.css`, `tailwind.config.js`,
`index.html`.

The mock is dark only; shipping both themes costs almost nothing with
Tailwind's `class` strategy and CSS variables for surface colours.
Preference is persisted to `localStorage`, and a small inline script
in `<head>` applies the stored theme _before_ React hydrates
(`index.html:17-23`), so there's no flash of the wrong theme on
reload.

The light palette is a warm parchment, not a straight inversion.
Cool-slate light mode was barely distinguishable from the dark theme
in peripheral vision; a tan/amber surface reads as categorically
different.

I didn't honour `prefers-color-scheme` as the default because the
mock is dark and first-time visitors should see what the reviewer
sees. The toggle lets them change it.

</details>

<details>
<summary><strong>7. Global <code>P</code> shortcut for pause</strong></summary>

`src/components/Dashboard.tsx`, around the `useEffect`.

A `keydown` listener on `window` toggles pause when `P` is pressed.
It no-ops when focus is in an `<input>`, `<textarea>`, `<select>`,
or another `<button>`, so it never interferes with normal typing.
Surfaced in the UI via `aria-keyshortcuts="p"` and a tooltip on the
pause button. Ops-desk dashboards get left running on wall screens;
a one-key pause matters.

</details>

<details>
<summary><strong>8. Skip-to-content link</strong></summary>

`src/components/Dashboard.tsx`, first child of the fragment.

Visually hidden anchor that jumps to `#main-content` when focused.
Only visible under keyboard focus. WCAG 2.4.1 — trivial to add,
always expected.

</details>

<details>
<summary><strong>9. Accessibility generally</strong></summary>

Scan for `aria-` across `src/components/**`.

- Landmarks (`<main>`, `<header>`, `<section>` via `Card`).
- `role="img"` + `aria-label` on the donut, sparkline, and severity
  dots, so screen readers hear "Algorithm 3 share over the last 60
  seconds: 29%" instead of "graphic" or "circle".
- `aria-pressed` on the pause button.
- `aria-live="polite"` on the Live/Paused badge text so state
  changes are announced without interrupting.
- `role="alert"` on error banners and the boundary fallback.
- `:focus-visible` ring coloured in the live-green accent so it
  reads on both themes.
- The header datetime uses `<time dateTime>` for a machine-readable
  timestamp.

</details>

<details>
<summary><strong>10. Locale-correct formatting via <code>Intl</code></strong></summary>

`src/components/Header.tsx`, `src/components/weather/WeatherCard.tsx`.

The mock shows "Tue 16th 3:46 PM". Rather than hand-concatenate that,
I use `Intl.DateTimeFormat('en-AU', …)` for weekday / month / time
and `Intl.PluralRules('en', { type: 'ordinal' })` for
`st` / `nd` / `rd` / `th`. Swap the locale string in one place and
the UI adapts. `en-AU` is the right call for a Melbourne-themed
dashboard (month-first, 12-hour time).

</details>

<details>
<summary><strong>11. Dominant-algorithm highlighting in the legend</strong></summary>

`src/components/ramp/RampChartCard.tsx`.

The mock shows a flat legend. Mine emphasises the dominant algorithm:
a 10 px dot with a soft coloured glow (box-shadow) instead of an
8 px flat one, label weight bumps 400 → 500, and the percentage is
re-coloured in the algorithm's accent. All pure CSS transitions. You
can tell who's winning without reading the donut, and the legend
finally agrees with the sparkline header.

</details>

<details>
<summary><strong>12. Sparkline "fresh data" pulse</strong></summary>

`src/components/ramp/Sparkline.tsx`, `@keyframes sparklineTick` in
`src/index.css`.

The chart `<g>` is key-remounted on each accepted tick, which
restarts a short opacity keyframe (0.6 → 1 over 350 ms, well under
the 500 ms interval). It reads as a tiny heartbeat — you can tell at
a glance the stream is live.

</details>

<details>
<summary><strong>13. <code>performance.mark('ramp-tick')</code></strong></summary>

`src/hooks/useRampData.ts`, inside the stream callback.

One call per tick via the User Timing API, so DevTools' Performance
panel can measure tick-to-paint latency without any extra
instrumentation.

</details>

<details>
<summary><strong>14. Bounded sparkline buffer (60 s × 2 Hz)</strong></summary>

`src/utils/rampTransforms.ts`, `SPARKLINE_MAX_POINTS = 120`.

The brief says "last 60 seconds". I cap at 120 points deterministically
so memory per algorithm stays constant however long the tab is open.
Covered by tests.

</details>

<details>
<summary><strong>15. Tabular-number alignment</strong></summary>

`className="tabular-nums"` on every percentage that changes in real
time — legend, donut, network summary. Roboto's OpenType `tnum`
makes `9%` and `23%` occupy the same width, so the layout doesn't
jitter each tick.

</details>

<details>
<summary><strong>16. Alert accent on incidents > 0</strong></summary>

`src/components/summary/NetworkSummaryCard.tsx`.

`StatCard` takes an `accent` prop (`'default' | 'alert'`). The
incidents stat renders with `accent="alert"` when
`summary.incidents > 0` — the number reddens so the eye lands on the
metric that actually matters right now.

</details>

<details>
<summary><strong>17. Ambient background gradients</strong></summary>

`src/index.css` (`:root:not(.dark) body`, `:root.dark body`).

Two radial gradients per theme (amber for light, sky + violet for
dark), 6–8% opacity. Adds depth without noise; rendered by the
browser at zero runtime cost.

</details>

<details>
<summary><strong>18. <code>retry</code> wired end-to-end</strong></summary>

Every `InlineError` gets the hook's `retry`, so the Retry button
actually re-runs the fetch. The ramp card doesn't render a Retry
button for `streamError` because the next 500 ms tick is its own
automatic retry.

</details>

<details>
<summary><strong>19. Extra fields in <code>networkSummary.json</code></strong></summary>

Beyond the four metrics the brief asks for I added
`alertThresholdPercent` (the threshold above which the dominant
share would count as an incident) and `currentMaxAlgorithmPercent`
(the current dominant share). They aren't rendered yet — the schema
is there so a future "threshold crossed" banner is a one-component
change that doesn't need to touch the data layer again.

</details>

<details>
<summary><strong>20. Theme-aware scrollbars</strong></summary>

`src/index.css`, webkit scrollbar rules. Thin, tinted to match each
palette, ~10 lines. Long lists stop fighting the theme.

</details>

## What's not included (and why)

<details>
<summary>Five things I consciously left out (click to expand)</summary>

- **No full `<Dashboard>` integration test.** Each card has its own
  tests and `useRampData` is exhaustively covered; mounting the
  dashboard in JSDOM would mostly be asserting on grid classes. A
  Playwright smoke test would be a better add.
- **No Storybook.** Every card already takes a data-override prop,
  so adding Storybook later is one file per card.
- **No visual regression tests.** Playwright + snapshots would double
  the project's install footprint for something no one asked for.
- **No i18n framework / RTL.** `Intl.*` covers everything
  locale-sensitive in the UI today; a framework isn't justified by
  four JSON fixtures.
- **No WebSocket transport.** The brief's mock is `setInterval`-based
  and `useRampData` is transport-agnostic — it just receives a
  callback. Swapping to a real transport is a one-file change.

</details>

## Tooling

<details>
<summary>Pre-commit hygiene via Husky v9 (click to expand)</summary>

- `.husky/pre-commit` runs `npx lint-staged` (ESLint `--fix` then
  Prettier `--write` on staged files), followed by `npm run typecheck`.
  `lint-staged` alone only sees touched files, so the project-wide
  typecheck catches regressions that a per-file pass would miss.
- `.prettierrc.json` sets single quotes, trailing commas, 80 cols,
  2-space indent, LF line endings. `.prettierignore` skips `dist`,
  `mock-data`, and the lockfile; markdown is formatted too.
- `eslint-config-prettier` sits last in `.eslintrc.cjs` so no
  stylistic ESLint rule fights Prettier.
- `npm install` wires the hook up automatically via the `prepare`
  script.

</details>

## Acknowledgements

The provided mock API and pure transforms were placed verbatim in
`src/api/` and `src/utils/`. JSON fixtures sit under `src/data/`.
`rampTransforms.test.ts` runs unchanged under Vitest.
