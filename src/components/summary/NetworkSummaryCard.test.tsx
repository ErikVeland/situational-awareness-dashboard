import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkSummaryCard from './NetworkSummaryCard';
import type { NetworkSummary } from '../../api/types';

const SUMMARY: NetworkSummary = {
  totalRamps: 50,
  activeRamps: 47,
  incidents: 3,
  averageDelayMinutes: 26,
  alertThresholdPercent: 40,
  currentMaxAlgorithmPercent: 30,
};

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
});
