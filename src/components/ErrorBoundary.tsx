import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors from any descendant and presents a full-page
 * fallback with a retry button that resets the boundary.
 *
 * Must be a class component — React's error boundary API (getDerivedStateFromError
 * / componentDidCatch) is not yet available as hooks.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-bg p-6"
      >
        <div className="w-full max-w-sm rounded-xl bg-bg-card p-8 text-center ring-1 ring-white/5 dark:ring-white/5">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          {this.state.error && (
            <p className="mt-2 break-words text-sm text-slate-500 dark:text-slate-400">
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 rounded-md bg-accent-live/10 px-5 py-2 text-sm font-medium text-accent-live ring-1 ring-accent-live/30 hover:bg-accent-live/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-live"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
