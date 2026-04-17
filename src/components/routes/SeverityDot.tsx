import type { Severity } from '../../api/types';
import { SEVERITY_CLASS } from '../../api/types';

interface SeverityDotProps {
  severity: Severity;
}

/**
 * Coloured dot mapped from the Severity discriminated union.
 * Uses the `SEVERITY_CLASS satisfies Record<Severity,string>` map from the
 * shared types — keeps the classes type-safe and centralized.
 */
export default function SeverityDot({ severity }: SeverityDotProps) {
  return (
    <span
      role="img"
      aria-label={`${severity} severity`}
      className={[
        'inline-block h-2.5 w-2.5 rounded-full',
        SEVERITY_CLASS[severity],
      ].join(' ')}
    />
  );
}
