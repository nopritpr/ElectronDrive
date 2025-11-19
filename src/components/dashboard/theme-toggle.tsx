'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function ThemeToggle() {
  // Set initial state from localStorage only on the client side
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return true; // Default to dark on server
  });

  // Effect to apply the theme and update localStorage
  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]); // This effect runs only when isDark changes

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-5 w-5 text-muted-foreground" />
      <Switch checked={isDark} onCheckedChange={toggleTheme} id="theme-toggle" />
      <Moon className="h-5 w-5 text-muted-foreground" />
    </div>
  );
}
