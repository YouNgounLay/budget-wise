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
  onWithdraw?: (chain: Chain) => void;
  emptyMessage?: string;
}

export function ChainList({
  chains,
  accounts,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  emptyMessage = 'No chains yet. Create your first chain to start organizing your deposits!',
}: ChainListProps) {
  if (chains.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 flex justify-center">
          <svg className="w-16 h-16 text-french-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>
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
          onWithdraw={onWithdraw ? () => onWithdraw(chain) : undefined}
        />
      ))}
    </div>
  );
}
