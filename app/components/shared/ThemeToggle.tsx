'use client';

/**
 * ThemeToggle Component
 * Animated toggle button for switching between light and dark themes
 * Uses custom Sun/Moon icons to clearly indicate current theme
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Sun Icon Component
 * Displayed when dark mode is active (click to switch to light)
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

/**
 * Moon Icon Component
 * Displayed when light mode is active (click to switch to dark)
 */
function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * ThemeToggle Button
 * Provides visual feedback and accessible toggle for theme switching
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon-wrapper">
        {/* Sun icon - shown in dark mode */}
        <SunIcon
          className={`theme-toggle__icon theme-toggle__icon--sun ${
            isDark ? 'theme-toggle__icon--visible' : 'theme-toggle__icon--hidden'
          }`}
        />
        {/* Moon icon - shown in light mode */}
        <MoonIcon
          className={`theme-toggle__icon theme-toggle__icon--moon ${
            !isDark ? 'theme-toggle__icon--visible' : 'theme-toggle__icon--hidden'
          }`}
        />
      </span>
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
}
