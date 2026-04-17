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

  return (
    <main className="mx-auto max-w-[1400px] p-5 md:p-8">
      <Header isLive={!ramp.paused} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <WeatherCard />
        <div className="md:col-span-1 lg:col-span-2">
          <DelayedRoutesCard />
        </div>

        <RampChartCard state={ramp} />
        <NetworkSummaryCard />
      </div>
    </main>
  );
}
