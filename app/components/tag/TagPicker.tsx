'use client';

/**
 * Tag Picker Component
 * Select and create tags for accounts
 */

import React, { useState, useRef, useEffect } from 'react';
import { Tag, CreateTagDTO } from '@/app/types/tag';
import { AccountColor, ACCOUNT_COLORS } from '@/app/types/account';
import { TagBadge } from './TagBadge';
import { Button, Input } from '@/app/components/shared';

interface TagPickerProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (data: CreateTagDTO) => void;
  label?: string;
}

const QUICK_COLORS: AccountColor[] = [
  'french-blue',
  'fresh-sky',
  'strong-cyan',
  'emerald',
  'amber',
  'rose',
  'violet',
  'slate',
];

export function TagPicker({
  availableTags,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  label = 'Tags',
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<AccountColor>('french-blue');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNewTagForm(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTags = availableTags.filter((t) => selectedTagIds.includes(t.id));
  const unselectedTags = availableTags.filter((t) => !selectedTagIds.includes(t.id));

  const filteredTags = unselectedTags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    
    onCreateTag({
      name: newTagName.trim(),
      color: newTagColor,
    });
    
    setNewTagName('');
    setNewTagColor('french-blue');
    setShowNewTagForm(false);
  };

  const showCreateOption = searchQuery.trim() && 
    !availableTags.some((t) => t.name.toLowerCase() === searchQuery.toLowerCase());

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-jet-black dark:text-white">
          {label}
        </label>
      )}

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={tag}
              showRemove
              onRemove={() => onRemoveTag(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-surface hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          <span className="text-slate-500 dark:text-slate-400">
            {selectedTags.length === 0 ? 'Add tags...' : 'Add more tags...'}
          </span>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-border">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or create tag..."
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-surface focus:outline-none focus:ring-2 focus:ring-french-blue"
                autoFocus
              />
            </div>

            {/* Tag list */}
            <div className="max-h-40 overflow-y-auto">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      onAddTag(tag.id);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          tag.color === 'custom' && tag.customColor
                            ? tag.customColor
                            : ACCOUNT_COLORS[tag.color],
                      }}
                    />
                    <span className="text-sm text-foreground">{tag.name}</span>
                  </button>
                ))
              ) : !showCreateOption && !showNewTagForm ? (
                <div className="px-3 py-2 text-sm text-muted">
                  No tags found
                </div>
              ) : null}

              {/* Create new tag option */}
              {showCreateOption && !showNewTagForm && (
                <button
                  type="button"
                  onClick={() => {
                    setNewTagName(searchQuery.trim());
                    setShowNewTagForm(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-border"
                >
                  <svg className="w-4 h-4 text-french-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-french-blue">
                    Create &quot;{searchQuery.trim()}&quot;
                  </span>
                </button>
              )}
            </div>

            {/* New tag form */}
            {showNewTagForm && (
              <div className="p-3 border-t border-border space-y-3">
                <Input
                  label="Tag Name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
                
                <div>
                  <label className="block text-sm font-medium text-jet-black dark:text-white mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newTagColor === color
                            ? 'border-jet-black dark:border-white scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: ACCOUNT_COLORS[color] }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowNewTagForm(false);
                      setNewTagName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Create Tag
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
