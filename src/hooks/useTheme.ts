import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return 'dark';
}

/**
 * Manages the dark/light theme preference.
 *
 * Persists to localStorage and synchronises with the `dark` class on
 * `document.documentElement` so Tailwind's `dark:` utilities activate.
 * Defaults to 'dark' when no preference has been stored.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  );

  return { theme, toggleTheme };
}
