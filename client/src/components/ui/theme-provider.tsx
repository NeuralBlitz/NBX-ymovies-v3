import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

// Simplified Theme type - only dark mode is supported
type Theme = "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  // Always use dark theme
  const [theme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove any existing theme classes and always add dark mode
    root.classList.remove("light", "system");
    root.classList.add("dark");
    
    // Store the theme in localStorage for consistency
    localStorage.setItem(storageKey, "dark");
  }, [storageKey]);

  // Provide theme context but enforce dark mode only
  const value = {
    theme,
    setTheme: () => {
      // No-op function - theme can't be changed
      console.warn("Theme changing is disabled - dark mode only");
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
