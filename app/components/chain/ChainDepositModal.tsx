'use client';

/**
 * Chain Deposit Modal Component
 * Modal for depositing money to a chain
 */

import React, { useState } from 'react';
import { Chain, DepositResult } from '@/app/types/chain';
import { Account, ACCOUNT_ICONS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { depositToChain } from '@/app/services/depositService';
import { Button, Input, Modal } from '@/app/components/shared';

interface ChainDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onConfirmDeposit: (result: DepositResult) => void;
}

export function ChainDepositModal({
  isOpen,
  onClose,
  chain,
  accounts,
  onConfirmDeposit,
}: ChainDepositModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<DepositResult | null>(null);

  const handlePreview = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!chain) return;

    const result = depositToChain(chain.id, numAmount, accounts);
    setPreview(result);
  };

  const handleConfirm = () => {
    if (preview && preview.success) {
      onConfirmDeposit(preview);
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setPreview(null);
    onClose();
  };

  if (!chain) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Deposit to ${chain.name}`}
      size="lg"
    >
      <div className="space-y-4">
        {!preview ? (
          <>
            <Input
              label="Deposit Amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="0.00"
              min={0}
              step={0.01}
              error={error}
              autoFocus
            />

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  {chain.distributionMode === 'percentage' ? 'Percentage Distribution:' : 'Chain Order:'}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  chain.distributionMode === 'percentage'
                    ? 'bg-french-blue/20 text-french-blue'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                }`}>
                  {chain.distributionMode === 'percentage' ? '📊 Percentage' : '📋 Sequential'}
                </span>
              </div>
              <div className="space-y-2">
                {chain.accounts.map((ca, index) => {
                  const account = accounts.find((a) => a.id === ca.accountId);
                  if (!account) return null;

                  const isPercentageMode = chain.distributionMode === 'percentage';

                  return (
                    <div
                      key={account.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-slate-400">{index + 1}.</span>
                      <span>{account.icon === 'custom' && account.customEmoji ? account.customEmoji : ACCOUNT_ICONS[account.icon]}</span>
                      <span className="text-jet-black dark:text-white">
                        {account.name}
                      </span>
                      <span className="text-slate-500">
                        {isPercentageMode 
                          ? `(${ca.percentage || 0}%)`
                          : `(${formatCurrency(account.amount)} / ${formatCurrency(ca.limit)})`
                        }
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1">
              <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
                Cancel
              </Button>
              <Button onClick={handlePreview} fullWidth>
                Preview Deposit
              </Button>
            </div>
          </>
        ) : (
          <>
            <div
              className={`p-4 rounded-lg ${
                preview.success
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-rose-50 dark:bg-rose-900/20'
              }`}
            >
              <p
                className={`font-medium ${
                  preview.success
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                {preview.message}
              </p>
            </div>

            {preview.deposits.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  Deposit Breakdown:
                </h4>
                {preview.deposits.map((deposit) => (
                  <div
                    key={deposit.accountId}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <span className="text-jet-black dark:text-white">
                      {deposit.accountName}
                    </span>
                    <div className="text-right">
                      <span className="text-emerald-600 font-medium">
                        +{formatCurrency(deposit.amount)}
                      </span>
                      <span className="text-slate-500 text-sm block">
                        New balance: {formatCurrency(deposit.newBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preview.remainingAmount > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ {formatCurrency(preview.remainingAmount)} could not be deposited
                (all accounts reached their limits)
              </p>
            )}

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreview(null)}
                fullWidth
              >
                Go Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!preview.success}
                fullWidth
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Deposit
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
