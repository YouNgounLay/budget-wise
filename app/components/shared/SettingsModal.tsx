'use client';

/**
 * Settings Modal Component
 * Unified settings including theme, fonts, import/export, and tutorial access
 */

import React, { useState, useRef, useEffect } from 'react';
import { useThemeCustomization } from '@/app/context/ThemeCustomizationContext';
import { useTheme } from '@/app/context/ThemeContext';
import { ThemeCustomizer } from './ThemeCustomizer';
import { DataImportExportModal } from './DataImportExportModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { FontPicker } from './FontPicker';
import { Modal } from './Modal';
import { ThemeProfile } from '@/app/types/theme';

// Icon Components
function GearIcon({ className, isOpen }: { className?: string; isOpen?: boolean }) {
  return (
    <svg 
      className={`${className} transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

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

function DataIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function FontIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14M12 3v18M7.5 7.5L12 3l4.5 4.5M9 7.5h6" />
    </svg>
  );
}

interface SettingsModalProps {
  onStartTutorial?: () => void;
  onDataChange?: () => void;
}

export function SettingsModal({ onStartTutorial, onDataChange }: SettingsModalProps) {
  const { profiles, activeProfile, setActiveProfile, deleteProfile, resetToDefault, allFonts, activeFont, setActiveFont } = useThemeCustomization();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ThemeProfile | undefined>();
  const [showDataModal, setShowDataModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);
  const [deleteThemeTarget, setDeleteThemeTarget] = useState<ThemeProfile | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
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
    setDeleteThemeTarget(profile);
  };

  const confirmDeleteTheme = () => {
    if (deleteThemeTarget) {
      deleteProfile(deleteThemeTarget.id);
      setDeleteThemeTarget(null);
    }
  };

  const handleCreateNew = () => {
    setEditingProfile(undefined);
    setShowCustomizer(true);
    setIsOpen(false);
  };

  const handleImportComplete = () => {
    onDataChange?.();
    window.location.reload();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm
            transition-all duration-200 
            ${isOpen 
              ? 'bg-french-blue text-white shadow-lg shadow-french-blue/25 scale-105' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 hover:shadow-md'
            }
          `}
          aria-label="Settings"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <CloseIcon className="w-5 h-5" />
          ) : (
            <GearIcon className="w-5 h-5" isOpen={isOpen} />
          )}
          <span className="hidden sm:inline">Settings</span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-surface rounded-lg shadow-lg border border-border z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Settings</h3>
            </div>

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

            {/* Font Selection */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FontIcon className="w-4 h-4" />
                  Font
                </span>
                <button
                  onClick={() => {
                    setShowFontModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <span style={{ fontFamily: activeFont?.family }}>{activeFont?.name || 'Select'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Theme Profiles */}
            <div className="max-h-40 overflow-y-auto">
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

            {/* Theme actions */}
            <div className="p-2 border-t border-border space-y-1">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-french-blue hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Theme
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Reset to the default theme colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Theme to Default
              </button>
            </div>

            {/* Other actions */}
            <div className="p-2 border-t border-border space-y-1">
              {/* Data Import/Export */}
              <button
                onClick={() => {
                  setShowDataModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <DataIcon className="w-4 h-4" />
                Import/Export Data
              </button>

              {/* Tutorial */}
              {onStartTutorial && (
                <button
                  onClick={() => {
                    onStartTutorial();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <BookIcon className="w-4 h-4" />
                  Start Tutorial
                </button>
              )}
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

      <DataImportExportModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        onImportComplete={handleImportComplete}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteThemeTarget}
        onClose={() => setDeleteThemeTarget(null)}
        onConfirm={confirmDeleteTheme}
        title="Delete Theme"
        message="Are you sure you want to delete this theme?"
        itemName={deleteThemeTarget?.name}
      />

      {/* Reset Theme Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetToDefault();
          setShowResetConfirm(false);
          setIsOpen(false);
        }}
        title="Reset Theme to Default"
        message="This will switch your theme back to the default BudgetWise colors. Your custom themes will be preserved and you can switch back to them anytime."
        confirmText="Reset Theme"
        confirmVariant="primary"
        showUndoWarning={false}
      />

      {/* Font Picker Modal */}
      <Modal
        isOpen={showFontModal}
        onClose={() => setShowFontModal(false)}
        title="Font Settings"
        size="md"
      >
        <FontPicker
          selectedFontId={activeFont?.id || 'inter'}
          onFontSelect={(font) => {
            setActiveFont(font.id);
          }}
        />
      </Modal>
    </>
  );
}
