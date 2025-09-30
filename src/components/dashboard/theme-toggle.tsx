'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = (checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
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
