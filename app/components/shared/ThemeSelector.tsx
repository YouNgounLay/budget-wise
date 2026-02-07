'use client';

/**
 * Theme Selector Component
 * Dropdown for selecting and managing theme profiles
 */

import React, { useState, useRef, useEffect } from 'react';
import { useThemeCustomization } from '@/app/context/ThemeCustomizationContext';
import { useTheme } from '@/app/context/ThemeContext';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ThemeProfile } from '@/app/types/theme';

// Icon Components
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeSelector() {
  const { profiles, activeProfile, setActiveProfile, deleteProfile, resetToDefault } = useThemeCustomization();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ThemeProfile | undefined>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = (profile: ThemeProfile) => {
    setEditingProfile(profile);
    setShowCustomizer(true);
    setIsOpen(false);
  };

  const handleDeleteProfile = (profile: ThemeProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.id === 'default') return;
    if (confirm(`Delete "${profile.name}" theme?`)) {
      deleteProfile(profile.id);
    }
  };

  const handleCreateNew = () => {
    setEditingProfile(undefined);
    setShowCustomizer(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Theme settings"
        >
          {/* Current theme indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
              style={{
                backgroundColor: activeProfile
                  ? (theme === 'dark' ? activeProfile.darkColors.primary : activeProfile.lightColors.primary)
                  : '#2A4494',
              }}
            />
            <span className="text-sm font-medium text-jet-black dark:text-white hidden sm:inline">
              {activeProfile?.name || 'Default'}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-lg border border-border z-50 overflow-hidden">
            {/* Light/Dark mode toggle */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {theme === 'dark' ? (
                    <>
                      <MoonIcon className="w-4 h-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <SunIcon className="w-4 h-4" />
                      Light Mode
                    </>
                  )}
                </span>
                <button
                  onClick={() => toggleTheme()}
                  className="relative w-14 h-8 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-600 transition-all duration-300 flex items-center"
                  style={{ minWidth: 56, minHeight: 32 }}
                  aria-label="Toggle dark/light mode"
                >
                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10">
                    <SunIcon className={`w-5 h-5 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-40' : 'opacity-100'}`} />
                  </span>
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10">
                    <MoonIcon className={`w-5 h-5 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
                  </span>
                  <span
                    className={`absolute top-1 left-1 transition-all duration-300 ease-in-out w-6 h-6 rounded-full shadow-md z-20 ${theme === 'dark' ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white'}`}
                  />
                </button>
              </div>
            </div>

            {/* Profile list */}
            <div className="max-h-48 overflow-y-auto">
              <p className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                Theme Profiles
              </p>
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    activeProfile?.id === profile.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                  }`}
                  onClick={() => {
                    setActiveProfile(profile.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: theme === 'dark'
                          ? profile.darkColors.primary
                          : profile.lightColors.primary,
                      }}
                    />
                    <span className="text-sm text-jet-black dark:text-white">
                      {profile.name}
                    </span>
                    {activeProfile?.id === profile.id && (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProfile(profile);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {profile.id !== 'default' && (
                      <button
                        onClick={(e) => handleDeleteProfile(profile, e)}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create new button */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-french-blue hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Theme
              </button>
              <button
                onClick={() => {
                  resetToDefault();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      <ThemeCustomizer
        isOpen={showCustomizer}
        onClose={() => {
          setShowCustomizer(false);
          setEditingProfile(undefined);
        }}
        editingProfile={editingProfile}
      />
    </>
  );
}
