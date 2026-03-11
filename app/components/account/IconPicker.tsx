'use client';

/**
 * Icon Picker Component
 * Searchable icon picker for account icons using Lucide icons
 * Features:
 * - Search bar to filter icons by name
 * - Grid display of all available icons
 * - Categorized icon browsing
 */

import React, { useState, useMemo } from 'react';
import { AccountIcon, ACCOUNT_ICONS } from '@/app/types/account';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { Search, ChevronDown } from 'lucide-react';

interface IconPickerProps {
  value: AccountIcon;
  onChange: (icon: AccountIcon) => void;
  label?: string;
}

// Icon categories for organized browsing
const ICON_CATEGORIES: Record<string, AccountIcon[]> = {
  'Money & Finance': [
    'money', 'bank', 'wallet', 'credit-card', 'piggy-bank', 'savings',
    'investment', 'chart', 'debt', 'receipt', 'calculator', 'gift-card', 'coupon'
  ],
  'Home & Utilities': [
    'home', 'rent', 'electricity', 'water', 'gas', 'internet', 'key', 'lock'
  ],
  'Transportation': [
    'car', 'bicycle', 'bus', 'train', 'plane', 'boat', 'truck'
  ],
  'Food & Drink': [
    'grocery', 'food', 'coffee', 'restaurant'
  ],
  'Shopping': [
    'shopping', 'clothing', 'gifts', 'box', 'package'
  ],
  'Health & Wellness': [
    'health', 'fitness', 'medicine', 'dental', 'glasses', 'spa', 'insurance'
  ],
  'Entertainment': [
    'entertainment', 'gaming', 'music', 'streaming', 'party', 'sports'
  ],
  'Education & Work': [
    'education', 'business', 'briefcase', 'graduation', 'books', 'school', 'library', 'folder'
  ],
  'Technology': [
    'technology', 'phone', 'computer', 'camera'
  ],
  'Travel & Vacation': [
    'travel', 'vacation', 'umbrella'
  ],
  'Life Events': [
    'baby', 'wedding', 'ring', 'haircut', 'pet'
  ],
  'Buildings': [
    'building', 'factory', 'hospital', 'church'
  ],
  'Symbols': [
    'star', 'heart', 'diamond', 'crown', 'trophy', 'target', 'rocket',
    'fire', 'snowflake', 'sun', 'moon', 'rainbow'
  ],
  'Other': [
    'art', 'tools', 'emergency', 'charity', 'taxes', 'calendar', 'clock', 'alarm'
  ],
};

// Get all icons as a flat array
const ALL_ICONS = Object.keys(ACCOUNT_ICONS).filter(
  (key) => key !== 'custom'
) as AccountIcon[];

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return null; // Return null to show categories view
    }
    const query = searchQuery.toLowerCase().trim();
    return ALL_ICONS.filter((iconKey) => 
      iconKey.toLowerCase().includes(query) ||
      iconKey.replace('-', ' ').toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Render a Lucide icon
  const renderIcon = (iconKey: AccountIcon) => {
    const IconComponent = getLucideIcon(iconKey);
    return <IconComponent className="w-5 h-5" strokeWidth={1.5} />;
  };

  const handleIconSelect = (iconKey: AccountIcon) => {
    onChange(iconKey);
    setSearchQuery('');
  };

  // Get the selected icon component
  const SelectedIconComponent = getLucideIcon(value);

  return (
    <div className="icon-picker">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      
      {/* Search bar */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search icons..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-french-blue"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        </div>
      </div>

      {/* Currently selected icon */}
      <div className="mb-3 flex items-center gap-3 p-3 bg-french-blue/10 rounded-lg">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-french-blue/20 text-french-blue">
          <SelectedIconComponent className="w-5 h-5" strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-french-blue">
          {value.replace('-', ' ')}
        </span>
        <span className="text-xs text-muted ml-auto">Selected</span>
      </div>

      {/* Icon grid */}
      <div className="rounded-lg border border-border bg-surface max-h-64 overflow-y-auto">
        {filteredIcons !== null ? (
          // Search results view
          <div className="p-3">
            {filteredIcons.length === 0 ? (
              <p className="text-center text-muted py-4">
                No icons found for &quot;{searchQuery}&quot;
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => handleIconSelect(iconKey)}
                    className={`
                      p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                      hover:scale-110 hover:bg-slate-100 dark:hover:bg-slate-700
                      ${
                        value === iconKey
                          ? 'bg-french-blue/20 ring-2 ring-french-blue text-french-blue'
                          : 'bg-background text-foreground'
                      }
                    `}
                    title={iconKey.replace('-', ' ')}
                    aria-label={`Select ${iconKey} icon`}
                  >
                    {renderIcon(iconKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Categories view
          <div className="divide-y divide-border">
            {Object.entries(ICON_CATEGORIES).map(([category, icons]) => (
              <div key={category}>
                <button
                  type="button"
                  onClick={() => setExpandedCategory(
                    expandedCategory === category ? null : category
                  )}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">
                    {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">{icons.length} icons</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted transition-transform ${
                        expandedCategory === category ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {expandedCategory === category && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50">
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((iconKey) => (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => handleIconSelect(iconKey)}
                          className={`
                            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                            hover:scale-110 hover:bg-white dark:hover:bg-slate-700
                            ${
                              value === iconKey
                                ? 'bg-french-blue/20 ring-2 ring-french-blue text-french-blue'
                                : 'bg-background text-foreground'
                            }
                          `}
                          title={iconKey.replace('-', ' ')}
                          aria-label={`Select ${iconKey} icon`}
                        >
                          {renderIcon(iconKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
