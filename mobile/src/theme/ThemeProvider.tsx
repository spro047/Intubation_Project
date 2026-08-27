import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { getThemePreference, setThemePreference } from '@/lib/storage';
import { colors } from '@/theme/tokens';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  page: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  ink: string;
  brand: typeof colors.brand;
  success: typeof colors.success;
  warning: typeof colors.warning;
  danger: typeof colors.danger;
  neutral: typeof colors.neutral;
  neo: typeof colors.neo;
}

interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  c: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const systemMode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';
  const [preference, setPreference] = useState<ThemeMode | null>(null);
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    getThemePreference()
      .then((saved) => {
        const savedMode: ThemeMode | null =
          saved === 'dark' || saved === 'light' ? saved : null;
        setPreference(savedMode);
        setThemeState(savedMode ?? systemMode);
      })
      .catch(() => setThemeState(systemMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preference === null) {
      setThemeState(systemMode);
    }
  }, [systemMode, preference]);

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setPreference(next);
    setThemePreference(next);
    setThemeState(next);
  };

  const setTheme = (mode: ThemeMode) => {
    setPreference(mode);
    setThemePreference(mode);
    setThemeState(mode);
  };

  const c: ThemeColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      ...colors,
      page: isDark ? colors.page.dark : colors.page.light,
      card: isDark ? colors.card.dark : colors.card.light,
      border: isDark ? colors.border.dark : colors.border.light,
      text: isDark ? '#FAFAFA' : '#111111',
      textMuted: isDark ? colors.neutral[300] : colors.neutral[600],
      textFaint: isDark ? colors.neutral[400] : colors.neutral[400],
    };
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
    c,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useSystemThemeListener() {
  React.useEffect(() => {
    const sub = Appearance.addChangeListener(() => {});
    return () => sub.remove();
  }, []);
}