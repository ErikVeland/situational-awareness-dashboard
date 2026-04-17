import { useMemo } from 'react';
import Card from '../Card';
import WeatherIcon from './WeatherIcon';
import type { WeatherData } from '../../api/types';
import { useWeather } from '../../hooks/useWeather';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const hour12 = ((hours + 11) % 12) + 1;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${weekday} ${day}${ordinal}  ${hour12}:${minutes} ${ampm}`;
}

interface WeatherRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function WeatherRow({ label, value, icon }: WeatherRowProps) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-slate-200">
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
        <span className="rounded-full bg-bg-muted px-2.5 py-1 text-xs tracking-wider text-slate-300">
          {data?.city ?? '—'}
        </span>
      }
    >
      {!data ? (
        <p className="text-sm text-slate-400">
          {state.error ? `Error loading weather: ${state.error.message}` : 'Loading…'}
        </p>
      ) : (
        <div className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
          <div>
            <p className="text-sm text-slate-300">{data.city}</p>
            <p className="mt-1 text-6xl font-light leading-none tracking-tight">
              {data.temperature}
              <span className="align-top text-3xl text-slate-400">°</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">{formattedDate}</p>
          </div>
          <div className="flex items-start justify-end">
            <WeatherIcon condition={data.condition} />
          </div>

          <div className="col-span-2 mt-4 border-t border-white/5 pt-3">
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
