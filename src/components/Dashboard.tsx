import { useEffect } from 'react';
import Header from './Header';
import WeatherCard from './weather/WeatherCard';
import DelayedRoutesCard from './routes/DelayedRoutesCard';
import RampChartCard from './ramp/RampChartCard';
import NetworkSummaryCard from './summary/NetworkSummaryCard';
import { useRampData } from '../hooks/useRampData';

/**
 * Top-level dashboard page. The only cross-component state is the live ramp
 * stream (shared with the header's live badge), so it's created here and
 * passed into RampChartCard by composition. Everything else is card-local.
 */
export default function Dashboard() {
  const ramp = useRampData();
  const { togglePause } = ramp;

  // Global keyboard shortcut: press P to toggle pause/resume.
  // Ignored when focus is inside a form control or the pause button itself.
  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key !== 'p' && e.key !== 'P') return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName)
      ) {
        return;
      }
      e.preventDefault();
      togglePause();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePause]);

  return (
    <>
      {/* Skip-to-content link — visible only on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent-live focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="mx-auto max-w-[1400px] p-5 md:p-8"
        aria-label="Situational Awareness Dashboard"
      >
        <Header isLive={!ramp.paused} onTogglePause={ramp.togglePause} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <WeatherCard />
          <div className="md:col-span-1 lg:col-span-2">
            <DelayedRoutesCard />
          </div>

          <RampChartCard state={ramp} />
          <NetworkSummaryCard />
        </div>
      </main>
    </>
  );
}
