import { useEffect, useState } from 'react';
import { useThemeContext } from '@/components/ui/theme-provider';

export default function useTheme() {
  const { theme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is mounted before returning the theme
  // This prevents hydration mismatch between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Stub function that does nothing since we only support dark mode
  const toggleTheme = () => {
    console.warn("Theme toggling is disabled - dark mode only");
  };

  // Only return the theme if the component is mounted
  // to avoid hydration mismatch
  return {
    theme: mounted ? theme : undefined,
    setTheme: () => {}, // No-op function
    toggleTheme,
    isDark: true, // Always dark mode
    isLight: false, // Light mode is disabled
  };
}
