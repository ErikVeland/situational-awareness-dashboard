import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InlineError from './InlineError';

describe('<InlineError>', () => {
  describe('categorise() — error classification', () => {
    it('classifies ZodError by error name', () => {
      const err = Object.assign(new Error('Invalid input'), {
        name: 'ZodError',
      });
      render(<InlineError error={err} resource="weather data" />);
      expect(
        screen.getByText('Invalid weather data format'),
      ).toBeInTheDocument();
      expect(screen.getByText(/schema/i)).toBeInTheDocument();
    });

    it('classifies AbortError by error name', () => {
      const err = Object.assign(new Error('The user aborted'), {
        name: 'AbortError',
      });
      render(<InlineError error={err} resource="routes" />);
      expect(screen.getByText('routes request timed out')).toBeInTheDocument();
      expect(screen.getByText(/took too long/i)).toBeInTheDocument();
    });

    it('classifies network TypeError by message', () => {
      const err = new TypeError('Failed to fetch');
      render(<InlineError error={err} resource="network summary" />);
      expect(
        screen.getByText('Cannot reach network summary service'),
      ).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('classifies 404 by message content', () => {
      const err = new Error('Request failed with status 404 Not Found');
      render(<InlineError error={err} resource="delayed routes" />);
      expect(screen.getByText('delayed routes not found')).toBeInTheDocument();
    });

    it('classifies 401 / unauthorized by message content', () => {
      const err = new Error('401 Unauthorized');
      render(<InlineError error={err} resource="weather data" />);
      expect(
        screen.getByText('weather data access denied'),
      ).toBeInTheDocument();
    });

    it('classifies 403 / forbidden by message content', () => {
      const err = new Error('403 Forbidden');
      render(<InlineError error={err} resource="ramp stream" />);
      expect(screen.getByText('ramp stream access denied')).toBeInTheDocument();
    });

    it('classifies 500-range server errors by message content', () => {
      const err = new Error('500 Internal Server Error');
      render(<InlineError error={err} resource="network summary" />);
      expect(
        screen.getByText('network summary service error'),
      ).toBeInTheDocument();
    });

    it('falls back to a generic message for unknown errors', () => {
      const err = new Error('Something totally unexpected');
      render(<InlineError error={err} resource="routes" />);
      expect(screen.getByText('Failed to load routes')).toBeInTheDocument();
      expect(
        screen.getByText('Something totally unexpected'),
      ).toBeInTheDocument();
    });

    it('falls back gracefully when the error has no message', () => {
      const err = new Error('');
      render(<InlineError error={err} resource="routes" />);
      expect(screen.getByText('Failed to load routes')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  describe('Retry button', () => {
    it('renders a Retry button when onRetry is provided', () => {
      render(
        <InlineError
          error={new Error('oops')}
          resource="routes"
          onRetry={() => {}}
        />,
      );
      expect(
        screen.getByRole('button', { name: /retry/i }),
      ).toBeInTheDocument();
    });

    it('does not render a Retry button when onRetry is omitted', () => {
      render(<InlineError error={new Error('oops')} resource="routes" />);
      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
    });

    it('calls onRetry when the button is clicked', async () => {
      const onRetry = vi.fn();
      render(
        <InlineError
          error={new Error('oops')}
          resource="routes"
          onRetry={onRetry}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('renders with role="alert" for screen readers', () => {
    render(<InlineError error={new Error('oops')} resource="routes" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
