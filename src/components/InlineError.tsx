interface InlineErrorProps {
  /** The raw Error object — its type is used to produce a helpful message. */
  error: Error;
  /** E.g. "weather data", "delayed routes" — inserted into the user message. */
  resource: string;
  /** If provided, a Retry button is rendered and this is called on click. */
  onRetry?: () => void;
}

/** Warning triangle icon. */
function WarningIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Maps an Error object to a user-readable title and message. */
function categorise(error: Error, resource: string): { title: string; message: string } {
  // Zod validation errors
  if (error.name === 'ZodError') {
    return {
      title:   `Invalid ${resource} format`,
      message: 'The service returned data that doesn\'t match the expected schema. This usually means the API was updated — contact support if it persists.',
    };
  }

  // Abort / timeout
  if (error.name === 'AbortError') {
    return {
      title:   `${resource} request timed out`,
      message: 'The server took too long to respond. Check your network and try again.',
    };
  }

  // Network / fetch errors (TypeError from fetch API, or message-based match)
  if (
    (error instanceof TypeError && /fetch|network|failed to load/i.test(error.message)) ||
    /fetch|network|failed to load/i.test(error.message)
  ) {
    return {
      title:   `Cannot reach ${resource} service`,
      message: 'A network error occurred. Check your connection and try again.',
    };
  }

  // HTTP-like status errors
  if (/\b(404|not found)\b/i.test(error.message)) {
    return {
      title:   `${resource} not found`,
      message: 'The requested resource could not be found (HTTP 404).',
    };
  }
  if (/\b(401|403|unauthori[sz]ed|forbidden)\b/i.test(error.message)) {
    return {
      title:   `${resource} access denied`,
      message: 'You do not have permission to access this resource.',
    };
  }
  if (/\b(5\d\d|server error|internal error)\b/i.test(error.message)) {
    return {
      title:   `${resource} service error`,
      message: 'The server encountered an error. Please try again in a moment.',
    };
  }

  // Fallback — include the raw message so developers can triage
  return {
    title:   `Failed to load ${resource}`,
    message: error.message || 'An unexpected error occurred.',
  };
}

/**
 * Compact inline error state for use inside card bodies.
 *
 * Shows a contextual title, a human-readable description derived from the
 * error type, and an optional Retry button.
 */
export default function InlineError({ error, resource, onRetry }: InlineErrorProps) {
  const { title, message } = categorise(error, resource);

  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-900/10"
    >
      <div className="flex items-start gap-2.5">
        <WarningIcon />
        <div className="min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-amber-800/70 dark:text-amber-400/70 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="rounded px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:ring-amber-500/40 dark:hover:bg-amber-800/20 transition"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
