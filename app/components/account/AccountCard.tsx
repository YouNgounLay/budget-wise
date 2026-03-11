'use client';

/**
 * Account Card Component
 * Displays a single account with its details in a compact layout
 * Structure: ICON Name | EDIT button on top row
 *            Balance | Deposit | Withdraw on bottom row
 */

import React from 'react';
import { Account, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { Pencil, Plus, Minus } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  onEdit?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  compact?: boolean;
}

export function AccountCard({
  account,
  onClick,
  onEdit,
  onDeposit,
  onWithdraw,
  compact = false,
}: AccountCardProps) {
  // Get the Lucide icon component
  const IconComponent = getLucideIcon(account.icon);
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
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <IconComponent className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">
            {account.name}
          </h4>
          <p className={`text-sm ${account.amount < 0 ? 'text-rose-500' : 'text-muted'}`}>
            {formatCurrency(account.amount)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      {/* Row 1: Icon, Name, Edit button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <IconComponent className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
          </div>
          <h3 className="font-semibold text-foreground truncate">
            {account.name}
          </h3>
        </div>
        
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Edit account"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Row 2: Balance, Deposit, Withdraw */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xl font-bold ${
            account.amount < 0 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-foreground'
          }`}>
            {formatCurrency(account.amount)}
          </p>
        </div>
        
        {(onDeposit || onWithdraw) && (
          <div className="flex gap-2 shrink-0">
            {onDeposit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeposit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-french-blue text-white hover:bg-yale-blue transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Deposit
              </button>
            )}
            {onWithdraw && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWithdraw();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Minus className="w-4 h-4" strokeWidth={2} />
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
