import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DelayedRoutesCard from './DelayedRoutesCard';
import type { DelayedRoute } from '../../api/types';

const ROUTES: DelayedRoute[] = [
  {
    id: '1',
    name: 'Monash Fwy Out',
    via: ['Kings Way', 'EastLink'],
    distanceKm: 13,
    delayMinutes: 45,
    severity: 'high',
  },
  {
    id: '2',
    name: 'Western Ring Rd',
    via: ['West Gate Fwy'],
    distanceKm: 5,
    delayMinutes: 5,
    severity: 'medium',
  },
];

describe('<DelayedRoutesCard>', () => {
  it('renders one row per route with name, distance, and delay', () => {
    render(<DelayedRoutesCard routes={ROUTES} />);
    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('Monash Fwy Out')).toBeInTheDocument();
    expect(screen.getByText('Western Ring Rd')).toBeInTheDocument();
    expect(screen.getByText('13 km')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('renders severity dots with the correct aria-label', () => {
    render(<DelayedRoutesCard routes={ROUTES} />);
    expect(screen.getByLabelText('high severity')).toBeInTheDocument();
    expect(screen.getByLabelText('medium severity')).toBeInTheDocument();
  });

  it('shows empty state when there are no routes', () => {
    render(<DelayedRoutesCard routes={[]} />);
    expect(screen.getByText(/0 active/i)).toBeInTheDocument();
    expect(screen.getByText(/No delayed routes/i)).toBeInTheDocument();
  });
});
