'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carica il tema dal localStorage
    const savedTheme = localStorage.getItem('travelmate-theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    
    // Applica immediatamente al DOM
    applyTheme(savedTheme);
    setIsLoaded(true);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      body.style.backgroundColor = '#0f172a';
      body.style.color = '#f1f5f9';
    } else {
      root.classList.remove('dark');
      body.style.backgroundColor = '#ffffff'; // BIANCO PURO
      body.style.color = '#111827';
    }
    
    root.style.colorScheme = newTheme;
    root.style.backgroundColor = newTheme === 'dark' ? '#0f172a' : '#ffffff';
    localStorage.setItem('travelmate-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme, isLoaded };
}

// Componente per inizializzare il tema prima dell'hydration
export function ThemeInitializer() {
  useEffect(() => {
    // Questo script viene eseguito non appena il componente viene montato
    const initTheme = () => {
      const savedTheme = localStorage.getItem('travelmate-theme') || 'light';
      const root = document.documentElement;
      const body = document.body;
      
      if (savedTheme === 'dark') {
        root.classList.add('dark');
        if (body) {
          body.style.backgroundColor = '#0f172a';
          body.style.color = '#f1f5f9';
        }
      } else {
        root.classList.remove('dark');
        if (body) {
          body.style.backgroundColor = '#ffffff'; // BIANCO PURO
          body.style.color = '#111827';
        }
      }
      
      root.style.colorScheme = savedTheme;
      root.style.backgroundColor = savedTheme === 'dark' ? '#0f172a' : '#ffffff';
    };
    
    initTheme();
  }, []);

  return null;
}