'use client';

/**
 * Header Component
 * Application header with navigation
 */

import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../shared/ThemeToggle';

export function Header() {
  return (
    <header className="header bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-jet-black dark:text-white">
              Budget<span className="text-french-blue">Wise</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/accounts"
              className="text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-colors"
            >
              Accounts
            </Link>
            <Link
              href="/chains"
              className="text-slate-600 dark:text-slate-300 hover:text-french-blue dark:hover:text-fresh-sky transition-colors"
            >
              Chains
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
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
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
