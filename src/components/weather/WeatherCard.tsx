import { useMemo } from 'react';
import Card from '../Card';
import InlineError from '../InlineError';
import WeatherIcon from './WeatherIcon';
import type { WeatherData } from '../../api/types';
import { useWeather } from '../../hooks/useWeather';

/** Returns the English ordinal suffix for a day number via Intl.PluralRules. */
function dayOrdinal(n: number): string {
  const rules = new Intl.PluralRules('en', { type: 'ordinal' });
  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  };
  return suffixes[rules.select(n)] ?? 'th';
}

/**
 * Formats an ISO datetime string as "Tue 16th 3:46 PM" using Intl.DateTimeFormat
 * so weekday names and time format respect the user's locale.
 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat('en-AU', { weekday: 'short' }).format(
    d,
  );
  const time = new Intl.DateTimeFormat('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  const day = d.getDate();
  return `${weekday} ${day}${dayOrdinal(day)} ${time}`;
}

interface WeatherRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function WeatherRow({ label, value, icon }: WeatherRowProps) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-stone-400 dark:text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-stone-700 dark:text-slate-200">
        {value}
        {icon}
      </span>
    </div>
  );
}

interface Props {
  /** Override for testing / storybook; when omitted the hook is used. */
  data?: WeatherData;
}

export default function WeatherCard({ data: dataOverride }: Props) {
  const state = useWeather();
  const data = dataOverride ?? state.data;

  const formattedDate = useMemo(
    () => (data ? formatDate(data.datetime) : ''),
    [data],
  );

  return (
    <Card
      title="Weather"
      headerRight={
        <span className="rounded-full bg-accent-live/15 px-2.5 py-1 text-xs font-medium tracking-wider text-accent-live ring-1 ring-accent-live/30">
          {data?.city ?? '—'}
        </span>
      }
    >
      {state.error && !dataOverride ? (
        <InlineError
          error={state.error}
          resource="weather data"
          onRetry={state.retry}
        />
      ) : !data ? (
        <p className="text-sm text-stone-400 dark:text-slate-500 animate-pulse">
          Loading weather…
        </p>
      ) : (
        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
          <div>
            <p className="text-sm text-stone-500 dark:text-slate-300">
              {data.city}
            </p>
            <p className="mt-1 text-6xl font-light leading-none tracking-tight text-stone-800 dark:text-slate-100">
              {data.temperature}
              <span className="align-top text-3xl text-stone-400 dark:text-slate-400">
                °
              </span>
            </p>
            <p className="mt-2 text-xs text-stone-400 dark:text-slate-400">
              {formattedDate}
            </p>
          </div>
          <div className="flex items-start justify-end">
            <WeatherIcon condition={data.condition} />
          </div>

          <div className="col-span-2 mt-4 border-t border-stone-200/80 dark:border-white/5 pt-3">
            <WeatherRow label="Humidity" value={`${data.humidity}%`} />
            <WeatherRow
              label="Chance of Rain"
              value={`${data.chanceOfRain}%`}
            />
            <WeatherRow
              label="Wind"
              value={`${data.windSpeed} ${data.windUnit}`}
            />
            <WeatherRow
              label="Tomorrow"
              value={`${data.tomorrow.temperature}°`}
              icon={
                <WeatherIcon
                  condition={data.tomorrow.condition}
                  size={18}
                  className="inline-block"
                />
              }
            />
          </div>
        </div>
      )}
    </Card>
  );
}
