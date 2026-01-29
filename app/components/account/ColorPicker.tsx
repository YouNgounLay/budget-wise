'use client';

/**
 * Color Picker Component
 * Google Docs-style color picker with preset colors and custom color support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AccountColor, ACCOUNT_COLORS } from '@/app/types/account';

interface ColorPickerProps {
  value: AccountColor;
  onChange: (color: AccountColor) => void;
  onCustomColorChange?: (hex: string) => void;
  customColorValue?: string;
  label?: string;
}

// Extended color palette similar to Google Docs
const COLOR_PALETTE = [
  // Row 1 - Grayscale
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
  // Row 2 - Reds
  ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
  // Row 3 - Light variants
  ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  // Row 4 - Medium light
  ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  // Row 5 - Medium
  ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  // Row 6 - Medium dark
  ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
  // Row 7 - Dark
  ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
  // Row 8 - Very dark
  ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'],
];

// Helper functions for color conversion
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function ColorPicker({ 
  value, 
  onChange, 
  onCustomColorChange,
  customColorValue = '#4a86e8',
  label 
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(customColorValue);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [hexInput, setHexInput] = useState(customColorValue);
  const [hsv, setHsv] = useState(() => hexToHsv(customColorValue));
  const [isDraggingSV, setIsDraggingSV] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  
  const svPickerRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  
  // Exclude 'custom' from preset colors list
  const presetColors = Object.entries(ACCOUNT_COLORS).filter(
    ([key]) => key !== 'custom'
  ) as [AccountColor, string][];

  useEffect(() => {
    setCustomColor(customColorValue);
    setHexInput(customColorValue);
    setHsv(hexToHsv(customColorValue));
  }, [customColorValue]);

  const updateColor = useCallback((newHex: string) => {
    setCustomColor(newHex);
    setHexInput(newHex);
    onCustomColorChange?.(newHex);
  }, [onCustomColorChange]);

  const handleSVChange = useCallback((clientX: number, clientY: number) => {
    if (!svPickerRef.current) return;
    const rect = svPickerRef.current.getBoundingClientRect();
    const s = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const v = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    updateColor(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [hsv, updateColor]);

  const handleHueChange = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360));
    const newHsv = { ...hsv, h };
    setHsv(newHsv);
    updateColor(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
  }, [hsv, updateColor]);

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!input.startsWith('#')) {
      input = '#' + input;
    }
    setHexInput(input);
    
    if (isValidHex(input)) {
      setCustomColor(input);
      setHsv(hexToHsv(input));
      onCustomColorChange?.(input);
    }
  };

  const handlePaletteColorClick = (hex: string) => {
    onChange('custom');
    updateColor(hex);
    setHsv(hexToHsv(hex));
  };

  // Mouse event handlers for SV picker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSV) {
        handleSVChange(e.clientX, e.clientY);
      } else if (isDraggingHue) {
        handleHueChange(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSV(false);
      setIsDraggingHue(false);
    };

    if (isDraggingSV || isDraggingHue) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSV, isDraggingHue, handleSVChange, handleHueChange]);

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
        <div className="flex flex-wrap gap-1.5">
          {presetColors.map(([colorKey, colorHex]) => (
            <button
              key={colorKey}
              type="button"
              onClick={() => onChange(colorKey)}
              className={`
                w-7 h-7 rounded transition-all duration-150
                hover:scale-110 border border-slate-200 dark:border-slate-600
                ${
                  value === colorKey
                    ? 'ring-2 ring-offset-1 ring-french-blue'
                    : ''
                }
              `}
              style={{ backgroundColor: colorHex }}
              title={colorKey.replace('-', ' ')}
              aria-label={`Select ${colorKey} color`}
            />
          ))}
        </div>
      </div>

      {/* Custom color toggle */}
      <button
        type="button"
        onClick={() => setShowCustomPicker(!showCustomPicker)}
        className="flex items-center gap-2 text-sm text-french-blue hover:text-yale-blue dark:text-fresh-sky dark:hover:text-strong-cyan transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Custom color
        <svg 
          className={`w-4 h-4 transition-transform ${showCustomPicker ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Custom color picker panel */}
      {showCustomPicker && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
          {/* Color palette grid */}
          <div className="mb-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Standard colors</p>
            <div className="space-y-0.5">
              {COLOR_PALETTE.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-0.5">
                  {row.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handlePaletteColorClick(hex)}
                      className={`
                        w-4 h-4 rounded-sm transition-all duration-100
                        hover:scale-125 hover:z-10 border border-slate-300 dark:border-slate-600
                        ${value === 'custom' && customColor.toLowerCase() === hex.toLowerCase() 
                          ? 'ring-2 ring-french-blue ring-offset-1' 
                          : ''}
                      `}
                      style={{ backgroundColor: hex }}
                      title={hex.toUpperCase()}
                      aria-label={`Select color ${hex}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Advanced color picker */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Custom</p>
            
            <div className="flex gap-3">
              {/* Saturation/Value picker */}
              <div
                ref={svPickerRef}
                className="relative w-28 h-28 rounded cursor-crosshair border border-slate-300 dark:border-slate-600 flex-shrink-0"
                style={{
                  background: `
                    linear-gradient(to top, #000, transparent),
                    linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))
                  `,
                }}
                onMouseDown={(e) => {
                  setIsDraggingSV(true);
                  onChange('custom');
                  handleSVChange(e.clientX, e.clientY);
                }}
              >
                {/* SV cursor */}
                <div
                  className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    backgroundColor: customColor,
                  }}
                />
              </div>

              <div className="flex-1 space-y-2">
                {/* Hue slider */}
                <div>
                  <div
                    ref={hueSliderRef}
                    className="relative h-3 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                    style={{
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                    }}
                    onMouseDown={(e) => {
                      setIsDraggingHue(true);
                      onChange('custom');
                      handleHueChange(e.clientX);
                    }}
                  >
                    {/* Hue cursor */}
                    <div
                      className="absolute top-1/2 w-2 h-5 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-white shadow-md pointer-events-none"
                      style={{
                        left: `${(hsv.h / 360) * 100}%`,
                        backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                      }}
                    />
                  </div>
                </div>

                {/* Hex input */}
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexInputChange}
                    onFocus={() => onChange('custom')}
                    className={`
                      flex-1 px-2 py-1 text-xs font-mono rounded border 
                      bg-white dark:bg-slate-900
                      ${isValidHex(hexInput) 
                        ? 'border-slate-300 dark:border-slate-600' 
                        : 'border-rose-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-french-blue
                    `}
                    placeholder="#000000"
                    maxLength={7}
                  />
                  {/* Preview swatch */}
                  <div
                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0"
                    style={{ backgroundColor: isValidHex(hexInput) ? hexInput : customColor }}
                  />
                </div>
                {!isValidHex(hexInput) && hexInput.length > 1 && (
                  <p className="text-xs text-rose-500">Invalid hex</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show selected custom color indicator when picker is closed */}
      {value === 'custom' && !showCustomPicker && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
            style={{ backgroundColor: customColor }}
          />
          <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
            {customColor.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
