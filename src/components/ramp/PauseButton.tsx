interface PauseButtonProps {
  paused: boolean;
  onToggle: () => void;
}

export default function PauseButton({ paused, onToggle }: PauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-keyshortcuts="p"
      title={paused ? 'Resume (P)' : 'Pause (P)'}
      className={[
        'inline-flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition',
        paused
          ? 'border-accent-live/40 bg-accent-live/10 text-accent-live hover:bg-accent-live/20'
          : 'border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
      ].join(' ')}
    >
      {paused ? 'Resume' : 'Pause'}
    </button>
  );
}
