'use client';

/**
 * Account Card Component
 * Displays a single account with its details
 */

import React from 'react';
import { Account, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Card } from '@/app/components/shared';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  compact?: boolean;
}

export function AccountCard({
  account,
  onClick,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
  compact = false,
}: AccountCardProps) {
  const icon = ACCOUNT_ICONS[account.icon];
  // Use customColor if color is 'custom', otherwise use the preset color
  const color = account.color === 'custom' && account.customColor 
    ? account.customColor 
    : ACCOUNT_COLORS[account.color];

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-3 p-3 rounded-lg cursor-pointer
          bg-surface
          border border-border
          hover:shadow-md transition-shadow duration-200
        `}
        onClick={onClick}
        style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">
            {account.name}
          </h4>
          <p className="text-sm text-muted">
            {formatCurrency(account.amount)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Color banner */}
      <div className="h-2" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h3 className="font-semibold text-lg text-jet-black dark:text-white">
                {account.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {account.description}
              </p>
            </div>
          </div>

          {/* Actions dropdown */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Edit account"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                  aria-label="Delete account"
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
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-3xl font-bold" style={{ color }}>
            {formatCurrency(account.amount)}
          </p>
        </div>

        {/* Quick actions */}
        {(onDeposit || onWithdraw) && (
          <div className="flex gap-2">
            {onDeposit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeposit();
                }}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors"
              >
                + Deposit
              </button>
            )}
            {onWithdraw && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw();
                }}
                className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors"
              >
                - Withdraw
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
