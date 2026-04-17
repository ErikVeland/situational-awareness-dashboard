/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dashboard dark palette derived from the mock
        bg: {
          DEFAULT: '#0b1220',
          card: '#141a2b',
          muted: '#1b2235',
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
