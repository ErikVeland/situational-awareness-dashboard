import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import WeatherCard from './WeatherCard';
import type { WeatherData } from '../../api/types';

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

describe('<WeatherCard>', () => {
  it('renders city, temperature and metric rows from provided data', () => {
    render(<WeatherCard data={SAMPLE} />);
    // City appears in both the badge and the main block
    expect(screen.getAllByText('Melbourne').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('Humidity')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('34%')).toBeInTheDocument();
    expect(screen.getByText('21 kmh')).toBeInTheDocument();
    expect(screen.getByText('30°')).toBeInTheDocument();
  });
});
