'use client';

/**
 * Chain List Component
 * Displays a list of chains
 */

import React from 'react';
import { Chain } from '@/app/types/chain';
import { Account } from '@/app/types/account';
import { ChainDisplay } from './ChainDisplay';

interface ChainListProps {
  chains: Chain[];
  accounts: Account[];
  onEdit?: (chain: Chain) => void;
  onDelete?: (chain: Chain) => void;
  onDeposit?: (chain: Chain) => void;
  onManageAccounts?: (chain: Chain) => void;
  emptyMessage?: string;
}

export function ChainList({
  chains,
  accounts,
  onEdit,
  onDelete,
  onDeposit,
  onManageAccounts,
  emptyMessage = 'No chains yet. Create your first chain to start organizing your deposits!',
}: ChainListProps) {
  if (chains.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔗</div>
        <p className="text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="chain-list space-y-4">
      {chains.map((chain) => (
        <ChainDisplay
          key={chain.id}
          chain={chain}
          accounts={accounts}
          onEdit={onEdit ? () => onEdit(chain) : undefined}
          onDelete={onDelete ? () => onDelete(chain) : undefined}
          onDeposit={onDeposit ? () => onDeposit(chain) : undefined}
          onManageAccounts={
            onManageAccounts ? () => onManageAccounts(chain) : undefined
          }
        />
      ))}
    </div>
  );
}
