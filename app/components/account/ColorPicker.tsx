'use client';

/**
 * Color Picker Component
 * Allows users to select a color scheme for their account
 */

import React from 'react';
import { AccountColor, ACCOUNT_COLORS } from '@/app/types/account';

interface ColorPickerProps {
  value: AccountColor;
  onChange: (color: AccountColor) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const colors = Object.entries(ACCOUNT_COLORS) as [AccountColor, string][];

  return (
    <div className="color-picker">
      {label && (
        <label className="block text-sm font-medium text-jet-black dark:text-white mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map(([colorKey, colorHex]) => (
          <button
            key={colorKey}
            type="button"
            onClick={() => onChange(colorKey)}
            className={`
              w-10 h-10 rounded-full transition-all duration-200
              hover:scale-110
              ${
                value === colorKey
                  ? 'ring-2 ring-offset-2 ring-jet-black dark:ring-white'
                  : ''
              }
            `}
            style={{ backgroundColor: colorHex }}
            title={colorKey}
            aria-label={`Select ${colorKey} color`}
          />
        ))}
      </div>
    </div>
  );
}
