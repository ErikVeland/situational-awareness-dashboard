interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  accent?: 'default' | 'alert';
}

export default function StatCard({
  label,
  value,
  unit,
  accent = 'default',
}: StatCardProps) {
  const color =
    accent === 'alert'
      ? 'text-red-500 dark:text-red-400'
      : 'text-slate-800 dark:text-slate-100';

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
