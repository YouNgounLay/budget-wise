'use client';

/**
 * Icon Picker Component
 * Allows users to select an icon for their account
 * Shows curated popular icons with option to input custom emoji
 */

import React, { useState } from 'react';
import { AccountIcon, ACCOUNT_ICONS } from '@/app/types/account';

interface IconPickerProps {
  value: AccountIcon | string;
  onChange: (icon: AccountIcon, customEmoji?: string) => void;
  customEmoji?: string;
  label?: string;
}

// Curated list of popular icons (no duplicates)
const POPULAR_ICONS: AccountIcon[] = [
  'money',
  'bank',
  'wallet',
  'credit-card',
  'piggy-bank',
  'savings',
  'investment',
  'car',
  'home',
  'grocery',
  'food',
  'coffee',
  'shopping',
  'entertainment',
  'travel',
  'health',
  'fitness',
  'education',
  'business',
  'technology',
  'gifts',
  'heart',
  'star',
  'target',
];

// Regex to match a single emoji (supports most common emojis including skin tones and flags)
const EMOJI_REGEX = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\p{Emoji_Modifier})?(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\p{Emoji_Modifier})?)*$/u;

// Simple check for single emoji using segmenter (more reliable)
function isValidSingleEmoji(str: string): boolean {
  if (!str || str.length === 0) return false;
  
  // Use Intl.Segmenter if available for accurate grapheme counting
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    const segments = [...segmenter.segment(str)];
    if (segments.length !== 1) return false;
  }
  
  // Check if it matches emoji pattern
  return EMOJI_REGEX.test(str);
}

export function IconPicker({ value, onChange, customEmoji, label }: IconPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState(customEmoji || '');
  const [inputError, setInputError] = useState('');

  // Get the display emoji - either from ACCOUNT_ICONS or custom
  const getDisplayEmoji = (iconKey: AccountIcon | string): string => {
    if (iconKey === 'custom' && customEmoji) {
      return customEmoji;
    }
    return ACCOUNT_ICONS[iconKey as AccountIcon] || '📦';
  };

  const handleCustomEmojiSubmit = () => {
    const trimmed = customEmojiInput.trim();
    
    if (!trimmed) {
      setInputError('Please enter an emoji');
      return;
    }
    
    if (!isValidSingleEmoji(trimmed)) {
      setInputError('Please enter a single emoji only');
      return;
    }
    
    setInputError('');
    onChange('custom' as AccountIcon, trimmed);
    setShowCustomInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomEmojiSubmit();
    }
  };

  return (
    <div className="icon-picker">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      
      {/* Popular Icons Grid */}
      <div className="rounded-lg border border-border p-3 bg-surface">
        <div className="grid grid-cols-8 gap-2 mb-3">
          {POPULAR_ICONS.map((iconKey) => (
            <button
              key={iconKey}
              type="button"
              onClick={() => onChange(iconKey)}
              className={`
                p-2 rounded-lg text-xl transition-all duration-200
                hover:scale-110 hover:bg-slate-100 dark:hover:bg-slate-700
                ${
                  value === iconKey && !customEmoji
                    ? 'bg-french-blue/20 ring-2 ring-french-blue'
                    : 'bg-background'
                }
              `}
              title={iconKey}
              aria-label={`Select ${iconKey} icon`}
            >
              {ACCOUNT_ICONS[iconKey]}
            </button>
          ))}
        </div>

        {/* Custom Emoji Section */}
        <div className="border-t border-border pt-3">
          {showCustomInput ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customEmojiInput}
                  onChange={(e) => {
                    setCustomEmojiInput(e.target.value);
                    setInputError(''); // Clear error when typing
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste an emoji here..."
                  className={`flex-1 px-3 py-2 text-lg rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-french-blue ${
                    inputError ? 'border-rose-500' : 'border-border'
                  }`}
                  autoFocus
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleCustomEmojiSubmit}
                  className="px-3 py-2 bg-french-blue text-white rounded-lg hover:bg-yale-blue transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomEmojiInput(customEmoji || '');
                    setInputError('');
                  }}
                  className="px-3 py-2 text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
              {inputError && (
                <p className="text-sm text-rose-500">{inputError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-french-blue hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Custom Emoji
              </button>
              
              {/* Show currently selected custom emoji if any */}
              {value === 'custom' && customEmoji && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Selected:</span>
                  <span className="text-2xl p-1 bg-french-blue/20 ring-2 ring-french-blue rounded-lg">
                    {customEmoji}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
