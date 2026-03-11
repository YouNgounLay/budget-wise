'use client';

/**
 * FontPicker Component
 * Allows users to select from default fonts or add custom Google Fonts
 */

import React, { useState, useEffect } from 'react';
import { FontConfig, DEFAULT_FONTS } from '@/app/types/theme';
import {
  loadCustomFonts,
  addCustomFont,
  removeCustomFont,
  isValidGoogleFontsUrl,
  parseAllFontNamesFromUrl,
  createSingleFontUrl,
  loadFontStylesheet,
} from '@/app/services/fontService';

// Inline SVG Icons
function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

interface FontPickerProps {
  selectedFontId: string;
  onFontSelect: (font: FontConfig) => void;
}

export function FontPicker({ selectedFontId, onFontSelect }: FontPickerProps) {
  const [customFonts, setCustomFonts] = useState<FontConfig[]>([]);
  const [isAddingFont, setIsAddingFont] = useState(false);
  const [fontUrl, setFontUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [detectedFonts, setDetectedFonts] = useState<string[]>([]);
  const [selectedPreviewFont, setSelectedPreviewFont] = useState<string | null>(null);

  useEffect(() => {
    setCustomFonts(loadCustomFonts());
  }, []);

  // Load all font stylesheets for preview
  useEffect(() => {
    const allFonts = [...DEFAULT_FONTS, ...customFonts];
    allFonts.forEach(font => {
      if (font.googleFontsUrl) {
        loadFontStylesheet(font);
      }
    });
  }, [customFonts]);

  // Preview font from URL as user types
  useEffect(() => {
    if (fontUrl && isValidGoogleFontsUrl(fontUrl)) {
      const fonts = parseAllFontNamesFromUrl(fontUrl);
      if (fonts.length > 0) {
        setDetectedFonts(fonts);
        // Default to last font (most likely the one user wants)
        setSelectedPreviewFont(fonts[fonts.length - 1]);
        // Dynamically load for preview
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      } else {
        setDetectedFonts([]);
        setSelectedPreviewFont(null);
      }
    } else {
      setDetectedFonts([]);
      setSelectedPreviewFont(null);
    }
  }, [fontUrl]);

  const handleAddFont = () => {
    setUrlError(null);

    if (!fontUrl.trim()) {
      setUrlError('Please enter a Google Fonts URL');
      return;
    }

    if (!isValidGoogleFontsUrl(fontUrl)) {
      setUrlError('Invalid Google Fonts URL. Must start with https://fonts.googleapis.com/');
      return;
    }

    if (!selectedPreviewFont) {
      setUrlError('No font detected in URL');
      return;
    }

    // Create a clean single-font URL for the selected font
    const singleFontUrl = createSingleFontUrl(fontUrl, selectedPreviewFont);
    const newFont = addCustomFont(singleFontUrl);
    
    if (newFont) {
      setCustomFonts(loadCustomFonts());
      setFontUrl('');
      setIsAddingFont(false);
      setDetectedFonts([]);
      setSelectedPreviewFont(null);
    } else {
      setUrlError(`Font "${selectedPreviewFont}" already exists`);
    }
  };

  const handleRemoveFont = (fontId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const removed = removeCustomFont(fontId);
    if (removed) {
      setCustomFonts(loadCustomFonts());
      // If the removed font was selected, switch to default
      if (selectedFontId === fontId) {
        const defaultFont = DEFAULT_FONTS[0];
        onFontSelect(defaultFont);
      }
    }
  };

  const allFonts = [...DEFAULT_FONTS, ...customFonts];

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-[var(--text-primary)]">
        Select Font
      </div>

      {/* Font Options */}
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {allFonts.map(font => (
          <div
            key={font.id}
            className={`relative flex items-center justify-between p-3 rounded-lg border transition-all ${
              selectedFontId === font.id
                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                : 'border-[var(--border)] hover:border-[var(--accent)]/50 bg-[var(--bg-secondary)]'
            }`}
          >
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => onFontSelect(font)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFontSelect(font);
                }
              }}
            >
              <span
                className="text-lg text-[var(--text-primary)]"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </span>
              {font.isCustom && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                  Custom
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedFontId === font.id && (
                <CheckIcon className="w-5 h-5 text-[var(--accent)]" />
              )}
              {font.isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveFont(font.id, e)}
                  className="p-1 rounded hover:bg-red-500/20 text-red-500"
                  aria-label={`Remove ${font.name}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Font Section */}
      {isAddingFont ? (
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Add Custom Font
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAddingFont(false);
                setFontUrl('');
                setUrlError(null);
                setDetectedFonts([]);
                setSelectedPreviewFont(null);
              }}
              className="p-1 rounded hover:bg-[var(--bg-primary)]"
            >
              <XMarkIcon className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Google Fonts URL
            </label>
            <input
              type="text"
              value={fontUrl}
              onChange={(e) => {
                setFontUrl(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://fonts.googleapis.com/css2?family=..."
              className="w-full p-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-500">{urlError}</p>
            )}
          </div>

          {/* Font Selection when multiple fonts detected */}
          {detectedFonts.length > 1 && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">
                Select Font ({detectedFonts.length} fonts detected)
              </label>
              <select
                value={selectedPreviewFont || ''}
                onChange={(e) => setSelectedPreviewFont(e.target.value)}
                className="w-full p-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {detectedFonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Font Preview */}
          {selectedPreviewFont && (
            <div className="p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-secondary)] mb-1">
                Preview
              </div>
              <div
                className="text-lg text-[var(--text-primary)]"
                style={{ fontFamily: `"${selectedPreviewFont}", sans-serif` }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
              <div className="text-xs text-[var(--accent)] mt-1">
                {selectedPreviewFont}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddingFont(false);
                setFontUrl('');
                setUrlError(null);
                setDetectedFonts([]);
                setSelectedPreviewFont(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddFont}
              disabled={!selectedPreviewFont}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-[var(--accent)] border border-[var(--border)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
              Add Font
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingFont(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add Custom Font
        </button>
      )}

      {/* Help Text */}
      <p className="text-xs text-[var(--text-secondary)]">
        To add a custom font, go to{' '}
        <a
          href="https://fonts.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          fonts.google.com
        </a>
        , select a font, and copy the embed URL.
      </p>
    </div>
  );
}
