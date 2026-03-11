'use client';

/**
 * Color Picker Component
 * Simplified color picker with preset colors and custom hex color support
 * Features:
 * - Selection of preset theme colors
 * - Custom color via hex input with live preview
 * - Remembers custom colors for future use
 */

import React, { useState, useEffect } from 'react';
import { AccountColor, ACCOUNT_COLORS } from '@/app/types/account';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';

interface ColorPickerProps {
  value: AccountColor;
  onChange: (color: AccountColor) => void;
  onCustomColorChange?: (hex: string) => void;
  customColorValue?: string;
  label?: string;
}

// Helper function to validate hex color
function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// Maximum number of saved custom colors
const MAX_CUSTOM_COLORS = 12;

// Load saved custom colors from storage
function loadSavedColors(): string[] {
  const saved = getFromStorage<string[]>(STORAGE_KEYS.CUSTOM_COLORS);
  return saved || [];
}

// Save custom color to storage
function saveCustomColor(hex: string): void {
  const saved = loadSavedColors();
  // Remove if already exists (to move to front)
  const filtered = saved.filter(c => c.toLowerCase() !== hex.toLowerCase());
  // Add to front
  const updated = [hex, ...filtered].slice(0, MAX_CUSTOM_COLORS);
  setToStorage(STORAGE_KEYS.CUSTOM_COLORS, updated);
}

export function ColorPicker({ 
  value, 
  onChange, 
  onCustomColorChange,
  customColorValue = '#4a86e8',
  label 
}: ColorPickerProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [hexInput, setHexInput] = useState(customColorValue);
  const [savedColors, setSavedColors] = useState<string[]>([]);
  
  // Exclude 'custom' from preset colors list
  const presetColors = Object.entries(ACCOUNT_COLORS).filter(
    ([key]) => key !== 'custom'
  ) as [AccountColor, string][];

  // Load saved colors on mount
  useEffect(() => {
    setSavedColors(loadSavedColors());
  }, []);

  // Update hex input when customColorValue changes externally
  useEffect(() => {
    setHexInput(customColorValue);
  }, [customColorValue]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Auto-add # if missing
    if (input && !input.startsWith('#')) {
      input = '#' + input;
    }
    setHexInput(input);
    
    // If valid, update the color
    if (isValidHex(input)) {
      onChange('custom');
      onCustomColorChange?.(input);
    }
  };

  const handleAddCustomColor = () => {
    if (isValidHex(hexInput)) {
      // Save to storage
      saveCustomColor(hexInput);
      // Refresh saved colors
      setSavedColors(loadSavedColors());
      // Apply the color
      onChange('custom');
      onCustomColorChange?.(hexInput);
      setShowCustomInput(false);
    }
  };

  const handleSelectSavedColor = (hex: string) => {
    setHexInput(hex);
    onChange('custom');
    onCustomColorChange?.(hex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomColor();
    }
  };

  return (
    <div className="color-picker">
      {label && (
        <label className="block text-sm font-medium text-jet-black dark:text-white mb-2">
          {label}
        </label>
      )}
      
      {/* Theme preset colors */}
      <div className="mb-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Theme colors</p>
        <div className="flex flex-wrap gap-2">
          {presetColors.map(([colorKey, colorHex]) => (
            <button
              key={colorKey}
              type="button"
              onClick={() => onChange(colorKey)}
              className={`
                w-8 h-8 rounded-lg transition-all duration-150
                hover:scale-110 border-2
                ${
                  value === colorKey
                    ? 'ring-2 ring-offset-2 ring-french-blue border-white dark:border-slate-800'
                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                }
              `}
              style={{ backgroundColor: colorHex }}
              title={colorKey.replace('-', ' ')}
              aria-label={`Select ${colorKey} color`}
            />
          ))}
        </div>
      </div>

      {/* Saved custom colors */}
      {savedColors.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Recent custom colors</p>
          <div className="flex flex-wrap gap-2">
            {savedColors.map((hex, index) => (
              <button
                key={`${hex}-${index}`}
                type="button"
                onClick={() => handleSelectSavedColor(hex)}
                className={`
                  w-8 h-8 rounded-lg transition-all duration-150
                  hover:scale-110 border-2
                  ${
                    value === 'custom' && customColorValue?.toLowerCase() === hex.toLowerCase()
                      ? 'ring-2 ring-offset-2 ring-french-blue border-white dark:border-slate-800'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
                style={{ backgroundColor: hex }}
                title={hex.toUpperCase()}
                aria-label={`Select custom color ${hex}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom color section */}
      <div className="border-t border-border pt-3">
        {showCustomInput ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">Add custom color</p>
            <div className="flex items-center gap-3">
              {/* Live preview swatch */}
              <div
                className={`w-12 h-12 rounded-lg border-2 flex-shrink-0 ${
                  isValidHex(hexInput) ? 'border-slate-300 dark:border-slate-600' : 'border-rose-400'
                }`}
                style={{ backgroundColor: isValidHex(hexInput) ? hexInput : '#cccccc' }}
              />
              
              <div className="flex-1">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="#RRGGBB"
                  className={`
                    w-full px-3 py-2 text-sm font-mono rounded-lg border 
                    bg-surface text-foreground
                    ${isValidHex(hexInput) 
                      ? 'border-border' 
                      : 'border-rose-400'
                    }
                    focus:outline-none focus:ring-2 focus:ring-french-blue
                  `}
                  maxLength={7}
                  autoFocus
                />
                {!isValidHex(hexInput) && hexInput.length > 1 && (
                  <p className="text-xs text-rose-500 mt-1">Enter a valid hex color (e.g., #FF5733)</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCustomColor}
                disabled={!isValidHex(hexInput)}
                className="flex-1 px-3 py-2 bg-french-blue text-white rounded-lg hover:bg-yale-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add Color
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(false);
                  setHexInput(customColorValue);
                }}
                className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-french-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add custom color
          </button>
        )}
      </div>

      {/* Show selected color indicator */}
      {value === 'custom' && !showCustomInput && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div
            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
            style={{ backgroundColor: customColorValue }}
          />
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {customColorValue?.toUpperCase()}
          </span>
          <span className="text-xs text-muted">• Selected</span>
        </div>
      )}
    </div>
  );
}
