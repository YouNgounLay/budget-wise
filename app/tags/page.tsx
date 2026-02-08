'use client';

/**
 * Tags Page
 * View all tags and their associated accounts
 */

import React from 'react';
import { MainLayout } from '../components/layout';
import { Button } from '../components/shared';
import { TagList, TagForm } from '../components/tag';
import { useTags } from '../context/TagContext';
import { useAccounts } from '../context/AccountContext';
import { CreateTagDTO } from '../types/tag';
import { useState } from 'react';

export default function TagsPage() {
  const { state: tagState, createTag, updateTag, deleteTag } = useTags();
  const { state: accountState } = useAccounts();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateTag = (data: CreateTagDTO) => {
    createTag(data);
  };

  if (tagState.isLoading || accountState.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading tags...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jet-black dark:text-white">
              Tags
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Organize your accounts with tags
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Tag</Button>
        </div>

        {/* Info box */}
        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
          <h3 className="font-medium text-jet-black dark:text-white mb-2">
            🏷️ About Tags
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tags help you categorize and group your accounts. You can add multiple tags to each account
            and view all accounts associated with a specific tag. This is great for tracking expenses
            across different categories like &ldquo;Monthly Bills&rdquo;, &ldquo;Savings Goals&rdquo;, or &ldquo;Shared Expenses&rdquo;.
          </p>
        </div>

        {/* Tag list */}
        <TagList
          tags={tagState.tags}
          accounts={accountState.accounts}
          onEditTag={(id, data) => updateTag(id, data)}
          onDeleteTag={deleteTag}
          onCreateTag={handleCreateTag}
        />
      </div>

      {/* Create Tag Form */}
      <TagForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => {
          handleCreateTag(data);
          setIsFormOpen(false);
        }}
      />
    </MainLayout>
  );
}
