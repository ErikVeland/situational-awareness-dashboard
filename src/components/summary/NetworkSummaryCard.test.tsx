import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import NetworkSummaryCard from './NetworkSummaryCard';
import type { NetworkSummary } from '../../api/types';

vi.mock('../../hooks/useNetworkSummary');
import { useNetworkSummary } from '../../hooks/useNetworkSummary';
const mockUseNetworkSummary = vi.mocked(useNetworkSummary);

beforeEach(() => {
  // Provide a safe default so tests that pass a prop override don't crash
  // when the component still calls the hook internally.
  mockUseNetworkSummary.mockReturnValue(makeState());
});

const SUMMARY: NetworkSummary = {
  totalRamps: 50,
  activeRamps: 47,
  incidents: 3,
  averageDelayMinutes: 26,
  alertThresholdPercent: 40,
  currentMaxAlgorithmPercent: 30,
};

function makeState(overrides = {}) {
  return {
    data: null,
    loading: false,
    error: null,
    retry: vi.fn(),
    ...overrides,
  };
}

describe('<NetworkSummaryCard>', () => {
  it('renders all four stats from the provided summary', () => {
    render(<NetworkSummaryCard summary={SUMMARY} />);
    expect(screen.getByText('Total ramps')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Avg delay')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
  });

  describe('hook-driven states (no summary override)', () => {
    it('shows a skeleton loader while data is loading', () => {
      mockUseNetworkSummary.mockReturnValue(makeState({ loading: true }));
      render(<NetworkSummaryCard />);
      expect(
        screen.getByLabelText('Loading network summary'),
      ).toBeInTheDocument();
    });

    it('shows InlineError when the hook returns an error', () => {
      mockUseNetworkSummary.mockReturnValue(
        makeState({ error: new Error('500 Internal Server Error') }),
      );
      render(<NetworkSummaryCard />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/network summary service error/i),
      ).toBeInTheDocument();
    });

    it('calls retry when the Retry button is clicked', async () => {
      const retry = vi.fn();
      mockUseNetworkSummary.mockReturnValue(
        makeState({ error: new Error('500 Internal Server Error'), retry }),
      );
      render(<NetworkSummaryCard />);
      await userEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(retry).toHaveBeenCalledTimes(1);
    });

    it('renders stats from the hook when no override is given', () => {
      mockUseNetworkSummary.mockReturnValue(makeState({ data: SUMMARY }));
      render(<NetworkSummaryCard />);
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    mockUseNetworkSummary.mockReturnValue(makeState({ data: SUMMARY }));
    const { container } = render(<NetworkSummaryCard />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
