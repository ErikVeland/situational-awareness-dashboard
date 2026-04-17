import type { ReactNode } from 'react';

interface CardProps {
  /** Left-aligned, all-caps label above the card content. */
  title?: string;
  /** Content rendered in the right side of the header (e.g. a badge). */
  headerRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Shared card shell — dark rounded container with an optional header strip.
 * Kept deliberately dumb: no data, no state. Makes each widget independently
 * testable without having to mount the whole Dashboard.
 */
export default function Card({
  title,
  headerRight,
  className,
  children,
}: CardProps) {
  return (
    <section
      className={[
        'rounded-xl bg-bg-card/80 ring-1 ring-white/5',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.02)]',
        'flex flex-col overflow-hidden',
        className ?? '',
      ].join(' ')}
    >
      {(title || headerRight) && (
        <header className="flex items-center justify-between px-5 pt-4 pb-3 text-xs tracking-[0.18em] text-slate-400">
          {title ? <span className="uppercase">{title}</span> : <span />}
          {headerRight}
        </header>
      )}
      <div className="flex-1 px-5 pb-5">{children}</div>
    </section>
  );
}
