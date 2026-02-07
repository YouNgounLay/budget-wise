'use client';

/**
 * Header Component
 * Application header with navigation
 */

import React, { useState } from 'react';
import { ThemeSelector } from '../shared/ThemeSelector';
import { DataImportExportModal } from '../shared/DataImportExportModal';

// Data Management Icon
function DataIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onDataChange?: () => void;
}

export function Header({ isMobileMenuOpen, onToggleMobileMenu, onDataChange }: HeaderProps) {
  const [showDataModal, setShowDataModal] = useState(false);

  const handleImportComplete = () => {
    onDataChange?.();
    // Reload the page to refresh all data
    window.location.reload();
  };

  return (
    <>
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/"
              className="nav-link text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-all no-underline"
              style={{ textDecoration: 'none' }}
            >
              Dashboard
            </a>
            <a
              href="/accounts"
              className="nav-link text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-all no-underline"
              style={{ textDecoration: 'none' }}
            >
              Accounts
            </a>
            <a
              href="/chains"
              className="nav-link text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-all no-underline"
              style={{ textDecoration: 'none' }}
            >
              Chains
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Data Import/Export Button */}
            <button
              onClick={() => setShowDataModal(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Import/Export Data"
              title="Import/Export Data"
            >
              <DataIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            
            <ThemeSelector />
            
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
      </div>
    </header>

    <DataImportExportModal
      isOpen={showDataModal}
      onClose={() => setShowDataModal(false)}
      onImportComplete={handleImportComplete}
    />
    </>
  );
}
