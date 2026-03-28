
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isPrivateArea = window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/dashboard');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (!isPrivateArea) return 'light';
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateMobile = () => setIsMobile(media.matches);

    updateMobile();
    media.addEventListener?.('change', updateMobile);
    window.addEventListener('resize', updateMobile);

    return () => {
      media.removeEventListener?.('change', updateMobile);
      window.removeEventListener('resize', updateMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile && theme !== 'light') {
      setTheme('light');
    }
  }, [isMobile, theme]);

  const toggleTheme = () => {
    if (isMobile) return;
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
