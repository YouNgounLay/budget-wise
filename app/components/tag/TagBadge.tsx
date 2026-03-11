'use client';

/**
 * Tag Badge Component
 * Displays a single tag with its color
 */

import React from 'react';
import { Tag } from '@/app/types/tag';
import { ACCOUNT_COLORS } from '@/app/types/account';

interface TagBadgeProps {
  tag: Tag;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  showRemove?: boolean;
}

export function TagBadge({ 
  tag, 
  onRemove, 
  size = 'sm',
  showRemove = false 
}: TagBadgeProps) {
  const color = tag.color === 'custom' && tag.customColor 
    ? tag.customColor 
    : ACCOUNT_COLORS[tag.color];

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-white ${sizeClasses}`}
      style={{ backgroundColor: color }}
    >
      {tag.name}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${tag.name} tag`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
