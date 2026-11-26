'use client';

import { useEffect, useState } from 'react';

const EVENT_NAME = 'arsenekit-theme-change';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme || 'light';
    setTheme(current);
    const syncTheme = (event) => setTheme(event.detail || document.documentElement.dataset.theme || 'light');
    window.addEventListener(EVENT_NAME, syncTheme);
    return () => window.removeEventListener(EVENT_NAME, syncTheme);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem('arsenekit-theme', next);
    } catch {}
    setTheme(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  }

  const isDark = theme === 'dark';
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={'Switch to ' + (isDark ? 'light' : 'dark') + ' mode'} title={'Switch to ' + (isDark ? 'light' : 'dark') + ' mode'}>
      <span className="theme-toggle-icon" aria-hidden="true">{isDark ? '☀' : '◐'}</span>
      <span className="theme-toggle-label">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
