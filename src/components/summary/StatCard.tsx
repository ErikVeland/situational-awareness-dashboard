import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: 'default' | 'alert';
}

export default function StatCard({
  label,
  value,
  unit,
  accent = 'default',
}: StatCardProps) {
  const color = accent === 'alert' ? 'text-red-400' : 'text-slate-100';
  return (
    <div className="rounded-lg bg-bg-muted/60 ring-1 ring-white/5 px-4 py-3">
      <p className="text-xs tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-light leading-none ${color}`}>
        {value}
        {unit && (
          <span className="ml-1 align-baseline text-sm text-slate-400">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
