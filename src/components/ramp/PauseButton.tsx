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
      className={[
        'inline-flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition',
        paused
          ? 'border-accent-live/40 bg-accent-live/10 text-accent-live hover:bg-accent-live/20'
          : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
      ].join(' ')}
    >
      {paused ? 'Resume' : 'Pause'}
    </button>
  );
}
