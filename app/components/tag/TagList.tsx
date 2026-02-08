'use client';

/**
 * Tag List Component
 * Displays all tags with associated accounts
 */

import React, { useState } from 'react';
import { Tag } from '@/app/types/tag';
import { Account, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { TagBadge } from './TagBadge';
import { TagForm } from './TagForm';
import { Card, Button } from '@/app/components/shared';
import { formatCurrency } from '@/app/utils/helpers';
import { CreateTagDTO } from '@/app/types/tag';

interface TagListProps {
  tags: Tag[];
  accounts: Account[];
  onEditTag: (id: string, data: Partial<Tag>) => void;
  onDeleteTag: (id: string) => void;
  onCreateTag: (data: CreateTagDTO) => void;
}

export function TagList({ 
  tags, 
  accounts, 
  onEditTag, 
  onDeleteTag,
  onCreateTag 
}: TagListProps) {
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);

  // Get accounts for a specific tag
  const getAccountsForTag = (tagId: string): Account[] => {
    return accounts.filter((account) => account.tagIds?.includes(tagId));
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: CreateTagDTO) => {
    if (editingTag) {
      onEditTag(editingTag.id, data);
    } else {
      onCreateTag(data);
    }
    setIsFormOpen(false);
    setEditingTag(null);
  };

  const handleDelete = (tag: Tag) => {
    const accountsWithTag = getAccountsForTag(tag.id);
    const message = accountsWithTag.length > 0
      ? `This tag is used by ${accountsWithTag.length} account(s). Are you sure you want to delete "${tag.name}"?`
      : `Are you sure you want to delete "${tag.name}"?`;
    
    if (confirm(message)) {
      onDeleteTag(tag.id);
    }
  };

  if (tags.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏷️</div>
          <h3 className="text-lg font-semibold text-jet-black dark:text-white mb-2">
            No Tags Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Create tags to organize and categorize your accounts.
          </p>
          <Button onClick={handleCreate}>Create First Tag</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tags.map((tag) => {
          const tagAccounts = getAccountsForTag(tag.id);
          const isExpanded = expandedTagId === tag.id;
          const totalBalance = tagAccounts.reduce((sum, acc) => sum + acc.amount, 0);

          return (
            <Card key={tag.id} padding="none" className="overflow-hidden">
              {/* Tag Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setExpandedTagId(isExpanded ? null : tag.id)}
              >
                <div className="flex items-center gap-3">
                  <TagBadge tag={tag} size="md" />
                  <div>
                    <span className="text-sm text-muted">
                      {tagAccounts.length} account{tagAccounts.length !== 1 ? 's' : ''}
                    </span>
                    {tagAccounts.length > 0 && (
                      <span className="text-sm text-muted ml-2">
                        · Total: {formatCurrency(totalBalance)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(tag);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Edit tag"
                  >
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tag);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                    aria-label="Delete tag"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Expand arrow */}
                  <svg
                    className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded content - Account list */}
              {isExpanded && (
                <div className="border-t border-border">
                  {tagAccounts.length === 0 ? (
                    <div className="p-4 text-center text-muted text-sm">
                      No accounts with this tag yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {tagAccounts.map((account) => {
                        const icon = account.icon === 'custom' && account.customEmoji
                          ? account.customEmoji
                          : ACCOUNT_ICONS[account.icon];
                        const color = account.color === 'custom' && account.customColor
                          ? account.customColor
                          : ACCOUNT_COLORS[account.color];

                        return (
                          <div
                            key={account.id}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800"
                            style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
                          >
                            <span className="text-xl">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {account.name}
                              </p>
                              <p className="text-sm text-muted truncate">
                                {account.description}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground">
                              {formatCurrency(account.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Tag Form Modal */}
      <TagForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTag(null);
        }}
        onSubmit={handleFormSubmit}
        tag={editingTag || undefined}
      />
    </>
  );
}
