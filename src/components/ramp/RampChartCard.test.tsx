import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RampChartCard from './RampChartCard';
import type { RampDataState } from '../../hooks/useRampData';
import type { Algorithm, SparklinePoint } from '../../api/types';

function makeState(overrides: Partial<RampDataState> = {}): RampDataState {
  const history: Record<Algorithm, SparklinePoint[]> = {
    'Algorithm 1': [],
    'Algorithm 2': [],
    'Algorithm 3': [
      { timestamp: 0, value: 20 },
      { timestamp: 500, value: 30 },
    ],
    'Algorithm 4': [],
    'Algorithm 5': [],
  };

  return {
    distribution: {
      'Algorithm 1': 23,
      'Algorithm 2': 18,
      'Algorithm 3': 30,
      'Algorithm 4': 15,
      'Algorithm 5': 14,
    },
    dominantAlgorithm: 'Algorithm 3',
    history,
    paused: false,
    latestRampCount: 50,
    latestReceivedAt: Date.now(),
    streamError: null,
    togglePause: vi.fn(),
    ...overrides,
  };
}

describe('<RampChartCard>', () => {
  it('renders a legend of all algorithms with their percentages', () => {
    render(<RampChartCard state={makeState()} />);
    expect(screen.getByText('Algorithm 1')).toBeInTheDocument();
    expect(screen.getByText('Algorithm 5')).toBeInTheDocument();
    // Multiple 30% labels exist (donut label + legend + sparkline header)
    expect(screen.getAllByText('30%').length).toBeGreaterThanOrEqual(1);
  });

  it('shows the dominant algorithm in the sparkline header', () => {
    render(<RampChartCard state={makeState()} />);
    expect(screen.getByText(/Algorithm 3 — Last 60s/i)).toBeInTheDocument();
  });

  it('invokes togglePause when the pause button is clicked', async () => {
    const togglePause = vi.fn();
    render(<RampChartCard state={makeState({ togglePause })} />);
    await userEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(togglePause).toHaveBeenCalledTimes(1);
  });

  it('displays the current ramp count badge', () => {
    render(<RampChartCard state={makeState({ latestRampCount: 50 })} />);
    expect(screen.getByText('50 ramps')).toBeInTheDocument();
  });
});
