/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // 'class' strategy: dark mode activates when the `dark` class is on <html>.
  // This lets useTheme toggle the class programmatically and persist to
  // localStorage, with a tiny inline script in index.html to prevent flash.
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // All bg colours are CSS-variable-backed so they flip for free when
        // the `dark` class is toggled — no need for `dark:` prefixes in
        // components that use these tokens.
        bg: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
          muted: 'rgb(var(--color-bg-muted) / <alpha-value>)',
        },
        accent: {
          live: '#22c55e',
          algo1: '#f472b6', // pink
          algo2: '#38bdf8', // sky
          algo3: '#34d399', // emerald
          algo4: '#fbbf24', // amber
          algo5: '#a78bfa', // violet
        },
      },
    },
  },
  plugins: [],
};
