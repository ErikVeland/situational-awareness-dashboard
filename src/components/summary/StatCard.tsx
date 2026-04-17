interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  /**
   * Visual accent for the value:
   *   default — neutral slate (Total ramps, Incidents when zero)
   *   ok      — live-green (healthy "Active" count)
   *   warn    — amber (non-zero but non-critical, e.g. average delay)
   *   alert   — red (active incident or threshold breach)
   */
  accent?: 'default' | 'ok' | 'warn' | 'alert';
}

const VALUE_COLOR: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-slate-800 dark:text-slate-100',
  ok: 'text-accent-live',
  warn: 'text-amber-500 dark:text-amber-400',
  alert: 'text-red-500 dark:text-red-400',
};

export default function StatCard({
  label,
  value,
  unit,
  accent = 'default',
}: StatCardProps) {
  const color = VALUE_COLOR[accent];

  // Intl.NumberFormat for locale-appropriate number formatting
  const formatted = new Intl.NumberFormat(undefined).format(value);

  return (
    <div className="rounded-lg bg-bg-muted/60 ring-1 ring-bg-muted px-4 py-3">
      <p className="text-xs tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-light leading-none ${color}`}>
        {formatted}
        {unit && (
          <span className="ml-1 align-baseline text-sm text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
