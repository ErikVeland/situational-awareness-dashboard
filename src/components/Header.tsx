import { useClock } from '../hooks/useClock';

interface HeaderProps {
  /** Whether the live ramp stream is currently active (not paused). */
  isLive: boolean;
}

function formatHeaderDate(d: Date): string {
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
  const month = d.toLocaleDateString(undefined, { month: 'short' });
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const hour12 = ((hours + 11) % 12) + 1;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${weekday} ${day}${ordinal} ${month} ${hour12}:${minutes} ${ampm}`;
}

export default function Header({ isLive }: HeaderProps) {
  const now = useClock(1000);
  return (
    <header className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-lg font-medium tracking-[0.22em] text-slate-200">
          SITUATIONAL AWARENESS DASHBOARD
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Melbourne Traffic Management — CoreITS
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider',
            isLive
              ? 'bg-accent-live/15 text-accent-live ring-1 ring-accent-live/30'
              : 'bg-slate-600/20 text-slate-400 ring-1 ring-slate-500/30',
          ].join(' ')}
          aria-live="polite"
        >
          <span
            className={[
              'h-1.5 w-1.5 rounded-full',
              isLive ? 'bg-accent-live animate-pulse' : 'bg-slate-400',
            ].join(' ')}
          />
          {isLive ? 'Live' : 'Paused'}
        </span>
        <time className="text-slate-300" dateTime={now.toISOString()}>
          {formatHeaderDate(now)}
        </time>
      </div>
    </header>
  );
}
