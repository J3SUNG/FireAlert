import React, { useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeContext } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

// Liskov Substitution Principle: This provider can be substituted for any context provider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme = 'light' }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Update theme in localStorage and document when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;