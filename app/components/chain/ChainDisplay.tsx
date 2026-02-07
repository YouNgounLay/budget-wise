'use client';

/**
 * Chain Display Component
 * Visual representation of a chain with accounts in order
 * Handles overflow by wrapping to next row
 */

import React from 'react';
import { Chain } from '@/app/types/chain';
import { Account, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Card } from '@/app/components/shared';

interface ChainDisplayProps {
  chain: Chain;
  accounts: Account[];
  onEdit?: () => void;
  onDelete?: () => void;
  onDeposit?: () => void;
  onManageAccounts?: () => void;
  compact?: boolean;
}

export function ChainDisplay({
  chain,
  accounts,
  onEdit,
  onDelete,
  onDeposit,
  onManageAccounts,
  compact = false,
}: ChainDisplayProps) {
  // Map chain accounts to full account data
  const chainAccounts = chain.accounts
    .map((ca) => {
      const account = accounts.find((a) => a.id === ca.accountId);
      return account ? { ...account, limit: ca.limit } : null;
    })
    .filter(Boolean) as (Account & { limit: number })[];
  console.log(chainAccounts);

  // Get overflow account if set
  const overflowAccount = chain.overflowAccountId
    ? accounts.find((a) => a.id === chain.overflowAccountId)
    : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">
            {chain.name}
          </h4>
          <p className="text-sm text-muted">
            {chain.accounts.length} account(s)
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-jet-black dark:text-white">
              {chain.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {chain.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Edit chain"
              >
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                aria-label="Delete chain"
              >
                <svg
                  className="w-4 h-4 text-rose-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="p-4">
        {chainAccounts.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <p>No accounts in this chain yet.</p>
            {onManageAccounts && (
              <button
                onClick={onManageAccounts}
                className="mt-2 text-french-blue hover:text-fresh-sky transition-colors"
              >
                Add accounts →
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {chainAccounts.map((account, index) => (
              <React.Fragment key={account.id}>
                {/* Account chip */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700"
                  style={{
                    borderLeft: `3px solid ${ACCOUNT_COLORS[account.color]}`,
                  }}
                >
                  <span className="text-xl">{ACCOUNT_ICONS[account.icon]}</span>
                  <div className="text-sm">
                    <p className="font-medium text-jet-black dark:text-white">
                      {account.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {formatCurrency(account.amount)} / {formatCurrency(account.limit)}
                    </p>
                  </div>
                </div>

                {/* Arrow between accounts */}
                {index < chainAccounts.length - 1 && (
                  <svg
                    className="w-6 h-6 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}

            {/* Overflow account (no limit) */}
            {overflowAccount && (
              <>
                {/* Arrow to overflow */}
                {chainAccounts.length > 0 && (
                  <svg
                    className="w-6 h-6 text-slate-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                )}
                {/* Overflow account chip */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-2 border-dashed border-emerald-400 dark:border-emerald-600"
                  style={{
                    borderLeft: `3px solid ${ACCOUNT_COLORS[overflowAccount.color]}`,
                  }}
                >
                  <span className="text-xl">{ACCOUNT_ICONS[overflowAccount.icon]}</span>
                  <div className="text-sm">
                    <p className="font-medium text-jet-black dark:text-white flex items-center gap-1">
                      {overflowAccount.name}
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300">
                        ∞
                      </span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {formatCurrency(overflowAccount.amount)} <span className="text-emerald-600 dark:text-emerald-400">· No limit</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        {onDeposit && (
          <button
            onClick={onDeposit}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 transition-colors"
          >
            Deposit to Chain
          </button>
        )}
        {onManageAccounts && (
          <button
            onClick={onManageAccounts}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 transition-colors"
          >
            Manage Accounts
          </button>
        )}
      </div>
    </Card>
  );
}
