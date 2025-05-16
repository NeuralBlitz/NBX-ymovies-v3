import { useEffect, useState } from 'react';
import { useThemeContext } from '@/components/ui/theme-provider';

export default function useTheme() {
  const { theme, setTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before returning the theme
  // This prevents hydration mismatch between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Only return the theme if the component is mounted
  // to avoid hydration mismatch
  return {
    theme: mounted ? theme : undefined,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
