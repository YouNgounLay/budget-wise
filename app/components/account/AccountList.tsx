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
        <div className="mb-4 flex justify-center">
          <svg className="w-16 h-16 text-french-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="account-list flex flex-col gap-4">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit ? () => onEdit(account) : undefined}
          onDeposit={onDeposit ? () => onDeposit(account) : undefined}
          onWithdraw={onWithdraw ? () => onWithdraw(account) : undefined}
        />
      ))}
    </div>
  );
}
