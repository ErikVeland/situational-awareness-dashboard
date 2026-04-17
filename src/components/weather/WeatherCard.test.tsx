import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import WeatherCard from './WeatherCard';
import type { WeatherData } from '../../api/types';

vi.mock('../../hooks/useWeather');
import { useWeather } from '../../hooks/useWeather';
const mockUseWeather = vi.mocked(useWeather);

beforeEach(() => {
  // Provide a safe default so tests that pass a data prop override don't crash
  // when the component still calls the hook internally.
  mockUseWeather.mockReturnValue(makeState());
});

const SAMPLE: WeatherData = {
  city: 'Melbourne',
  temperature: 32,
  unit: 'C',
  condition: 'partly-cloudy',
  datetime: '2024-01-16T15:46:00+11:00',
  humidity: 78,
  chanceOfRain: 34,
  windSpeed: 21,
  windUnit: 'kmh',
  tomorrow: { temperature: 30, condition: 'sunny' },
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

describe('<WeatherCard>', () => {
  it('renders city, temperature and metric rows from provided data', () => {
    render(<WeatherCard data={SAMPLE} />);
    expect(screen.getAllByText('Melbourne').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('34%')).toBeInTheDocument();
    expect(screen.getByText('21 kmh')).toBeInTheDocument();
    expect(screen.getByText('30°')).toBeInTheDocument();
  });

  describe('hook-driven states (no data override)', () => {
    it('shows a skeleton loader while data is loading', () => {
      mockUseWeather.mockReturnValue(makeState({ loading: true }));
      render(<WeatherCard />);
      expect(screen.getByLabelText('Loading weather')).toBeInTheDocument();
    });

    it('shows InlineError when the hook returns an error', () => {
      const retry = vi.fn();
      mockUseWeather.mockReturnValue(
        makeState({ error: new Error('Network failure'), retry }),
      );
      render(<WeatherCard />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Cannot reach weather data service/i),
      ).toBeInTheDocument();
    });

    it('calls retry when the Retry button is clicked', async () => {
      const retry = vi.fn();
      mockUseWeather.mockReturnValue(
        makeState({ error: new Error('Network failure'), retry }),
      );
      render(<WeatherCard />);
      await userEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(retry).toHaveBeenCalledTimes(1);
    });

    it('renders the happy-path data from the hook when no override is given', () => {
      mockUseWeather.mockReturnValue(makeState({ data: SAMPLE }));
      render(<WeatherCard />);
      expect(screen.getByText('32')).toBeInTheDocument();
    });
  });

  it('has no axe accessibility violations', async () => {
    mockUseWeather.mockReturnValue(makeState({ data: SAMPLE }));
    const { container } = render(<WeatherCard />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
