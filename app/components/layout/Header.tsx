'use client';

/**
 * Header Component
 * Application header with search and settings
 */

import React from 'react';
import { SearchBar } from '../shared/SearchBar';
import { SettingsModal } from '../shared/SettingsModal';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onDataChange?: () => void;
  onStartTutorial?: () => void;
}

export function Header({ isMobileMenuOpen, onToggleMobileMenu, onDataChange, onStartTutorial }: HeaderProps) {
  return (
    <header className="header bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            {/* Replacing emoji with SVG icon */}
            <svg className="w-7 h-7 text-french-blue" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor" opacity="0.15" />
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-xl font-bold text-jet-black dark:text-white">
              Budget<span className="text-french-blue">Wise</span>
            </span>
          </a>

          {/* Search Bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <SettingsModal
              onStartTutorial={onStartTutorial}
              onDataChange={onDataChange}
            />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onToggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6 text-slate-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-slate-600 dark:text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
