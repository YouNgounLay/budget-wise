'use client';

/**
 * Tags Page
 * View all tags and their associated accounts/transactions
 */

import React from 'react';
import { MainLayout } from '../components/layout';
import { Button } from '../components/shared';
import { TagList, TagForm } from '../components/tag';
import { useTags } from '../context/TagContext';
import { useAccounts } from '../context/AccountContext';
import { CreateTagDTO, TagEntityType } from '../types/tag';
import { useState } from 'react';

export default function TagsPage() {
  const { state: tagState, createTag, updateTag, deleteTag, getTagsByEntityType } = useTags();
  const { state: accountState } = useAccounts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TagEntityType>('account');

  const accountTags = getTagsByEntityType('account');
  const transactionTags = getTagsByEntityType('transaction');

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
              Organize your accounts and transactions with tags
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Tag</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Account Tags ({accountTags.length})
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'transaction'
                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Transaction Tags ({transactionTags.length})
          </button>
        </div>

        {/* Info box */}
        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
          <h3 className="font-medium text-jet-black dark:text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            About {activeTab === 'account' ? 'Account' : 'Transaction'} Tags
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {activeTab === 'account' 
              ? 'Account tags help you categorize and group your accounts. You can add multiple tags to each account and view all accounts associated with a specific tag. This is great for tracking expenses across different categories like "Monthly Bills", "Savings Goals", or "Shared Expenses".'
              : 'Transaction tags let you categorize individual transactions. Apply tags when making deposits or withdrawals to track spending patterns, income sources, or specific projects over time.'}
          </p>
        </div>

        {/* Tag list - filtered by active tab */}
        <TagList
          tags={activeTab === 'account' ? accountTags : transactionTags}
          accounts={accountState.accounts}
          onEditTag={(id, data) => updateTag(id, data)}
          onDeleteTag={deleteTag}
          onCreateTag={handleCreateTag}
          entityType={activeTab}
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
        entityType={activeTab}
      />
    </MainLayout>
  );
}
