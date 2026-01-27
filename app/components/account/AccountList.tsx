'use client';

/**
 * Account List Component
 * Displays a grid of account cards
 */

import React from 'react';
import { Account } from '@/app/types/account';
import { AccountCard } from './AccountCard';

interface AccountListProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onDeposit?: (account: Account) => void;
  onWithdraw?: (account: Account) => void;
  emptyMessage?: string;
}

export function AccountList({
  accounts,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  emptyMessage = 'No accounts yet. Create your first account to get started!',
}: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">💰</div>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="account-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit ? () => onEdit(account) : undefined}
          onDelete={onDelete ? () => onDelete(account) : undefined}
          onDeposit={onDeposit ? () => onDeposit(account) : undefined}
          onWithdraw={onWithdraw ? () => onWithdraw(account) : undefined}
        />
      ))}
    </div>
  );
}
