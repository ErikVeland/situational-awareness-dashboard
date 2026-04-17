import { useClock } from '../hooks/useClock';
import { useTheme } from '../hooks/useTheme';
import { dayOrdinal } from '../utils/formatDate';

interface HeaderProps {
  /** Whether the live ramp stream is currently active (not paused). */
  isLive: boolean;
  /** Called when the user presses the pause keyboard shortcut. */
  onTogglePause: () => void;
}

/**
 * Formats a Date as "Tue 16th Apr 3:46 PM" using Intl.DateTimeFormat so
 * the output respects the user's locale for weekday/month names and time.
 */
function formatHeaderDate(d: Date): string {
  const weekday = new Intl.DateTimeFormat('en-AU', { weekday: 'short' }).format(
    d,
  );
  const month = new Intl.DateTimeFormat('en-AU', { month: 'short' }).format(d);
  const time = new Intl.DateTimeFormat('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
  const day = d.getDate();
  return `${weekday} ${day}${dayOrdinal(day)} ${month} ${time}`;
}

/** Sun icon for light mode. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        const x1 = 12 + Math.cos(r) * 6.5;
        const y1 = 12 + Math.sin(r) * 6.5;
        const x2 = 12 + Math.cos(r) * 9;
        const y2 = 12 + Math.sin(r) * 9;
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** Moon icon for dark mode. */
function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export default function Header({ isLive, onTogglePause }: HeaderProps) {
  const now = useClock(1000);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="mb-5 flex items-start justify-between">
      <div>
        <h1 className="text-lg font-medium tracking-[0.22em] text-slate-700 dark:text-slate-200">
          SITUATIONAL AWARENESS DASHBOARD
        </h1>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Melbourne Traffic Management — CoreITS
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          title={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200 transition"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          <span className="hidden sm:inline">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* LIVE / PAUSED badge — aria-live so screen readers announce changes */}
        <button
          type="button"
          onClick={onTogglePause}
          aria-pressed={!isLive}
          aria-keyshortcuts="p"
          title={isLive ? 'Pause (P)' : 'Resume (P)'}
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider transition',
            isLive
              ? 'bg-accent-live/15 text-accent-live ring-1 ring-accent-live/30'
              : 'bg-slate-200/60 text-slate-500 ring-1 ring-slate-300/60 dark:bg-slate-600/20 dark:text-slate-400 dark:ring-slate-500/30',
          ].join(' ')}
        >
          <span
            aria-hidden
            className={[
              'h-1.5 w-1.5 rounded-full',
              isLive ? 'bg-accent-live animate-pulse' : 'bg-slate-400',
            ].join(' ')}
          />
          <span aria-live="polite">{isLive ? 'Live' : 'Paused'}</span>
        </button>

        <time
          className="text-slate-500 dark:text-slate-300"
          dateTime={now.toISOString()}
          aria-label={`Current time: ${formatHeaderDate(now)}`}
        >
          {formatHeaderDate(now)}
        </time>
      </div>
    </header>
  );
}
