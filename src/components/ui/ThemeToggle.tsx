'use client';

import { Moon, Sun, BookOpen } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/context/ThemeContext';

const THEME_ORDER: Theme[] = ['dark', 'light', 'sepia'];

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
  sepia: 'Sepia',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIndex]);
  };

  const icon =
    theme === 'light' ? (
      <Sun className="h-5 w-5" />
    ) : theme === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <BookOpen className="h-5 w-5" />
    );

  return (
    <Button variant="ghost" size="icon" onClick={cycleTheme} title={`Theme: ${THEME_LABELS[theme]}`}>
      {icon}
    </Button>
  );
}
