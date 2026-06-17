import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS, THEMES } from '../utils/constants';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check local storage first, but default to light mode for this app
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored) return stored;
    
    // Always default to light mode for better visibility
    return THEMES.LIGHT;
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (theme === THEMES.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Store preference
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // We don't auto-switch based on system theme for this app
  // to ensure consistent visibility and user experience

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
  };

  const setLightTheme = () => setTheme(THEMES.LIGHT);
  const setDarkTheme = () => setTheme(THEMES.DARK);

  const isDark = theme === THEMES.DARK;
  const isLight = theme === THEMES.LIGHT;

  const value = {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
