import type { WeatherCondition } from '../../api/types';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  className?: string;
}

/**
 * Tiny inline-SVG weather glyph. Avoids pulling in an icon library for four icons.
 * Uses `aria-hidden` because the parent label already describes the weather.
 */
export default function WeatherIcon({
  condition,
  size = 72,
  className,
}: WeatherIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
    className,
  } as const;

  switch (condition) {
    case 'sunny':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="12" fill="#fbbf24" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = 32 + Math.cos(rad) * 18;
            const y1 = 32 + Math.sin(rad) * 18;
            const x2 = 32 + Math.cos(rad) * 26;
            const y2 = 32 + Math.sin(rad) * 26;
            return (
              <line
                key={a}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fbbf24"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    case 'cloudy':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="38" rx="20" ry="10" fill="#94a3b8" />
          <ellipse cx="22" cy="34" rx="10" ry="8" fill="#cbd5e1" />
          <ellipse cx="40" cy="32" rx="12" ry="10" fill="#cbd5e1" />
        </svg>
      );
    case 'rainy':
      return (
        <svg {...common}>
          <ellipse cx="32" cy="26" rx="16" ry="8" fill="#94a3b8" />
          <ellipse cx="38" cy="22" rx="10" ry="8" fill="#cbd5e1" />
          {[22, 32, 42].map((x) => (
            <line
              key={x}
              x1={x}
              y1={38}
              x2={x - 3}
              y2={50}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
    case 'partly-cloudy':
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="10" fill="#fbbf24" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const rad = (a * Math.PI) / 180;
            const x1 = 24 + Math.cos(rad) * 14;
            const y1 = 24 + Math.sin(rad) * 14;
            const x2 = 24 + Math.cos(rad) * 20;
            const y2 = 24 + Math.sin(rad) * 20;
            return (
              <line
                key={a}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fbbf24"
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
          <ellipse cx="40" cy="42" rx="14" ry="8" fill="#cbd5e1" />
          <ellipse cx="34" cy="38" rx="8" ry="6" fill="#e2e8f0" />
        </svg>
      );
  }
}
