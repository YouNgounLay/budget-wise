'use client';

/**
 * Icon Picker Component
 * Allows users to select an icon for their account
 */

import React from 'react';
import { AccountIcon, ACCOUNT_ICONS } from '@/app/types/account';

interface IconPickerProps {
  value: AccountIcon;
  onChange: (icon: AccountIcon) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const icons = Object.entries(ACCOUNT_ICONS) as [AccountIcon, string][];

  return (
    <div className="icon-picker">
      {label && (
        <label className="block text-sm font-medium text-jet-black dark:text-white mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-5 gap-2">
        {icons.map(([iconKey, emoji]) => (
          <button
            key={iconKey}
            type="button"
            onClick={() => onChange(iconKey)}
            className={`
              p-3 rounded-lg text-2xl transition-all duration-200
              hover:scale-110 hover:bg-slate-100 dark:hover:bg-slate-700
              ${
                value === iconKey
                  ? 'bg-french-blue/20 ring-2 ring-french-blue'
                  : 'bg-slate-50 dark:bg-slate-800'
              }
            `}
            title={iconKey}
            aria-label={`Select ${iconKey} icon`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
