'use client';

/**
 * Transaction Modal Component
 * Modal for depositing or withdrawing from an account
 */

import React, { useState } from 'react';
import { Account } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal } from '@/app/components/shared';

type TransactionType = 'deposit' | 'withdraw';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  type: TransactionType;
  onSubmit: (accountId: string, amount: number) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  account,
  type,
  onSubmit,
}: TransactionModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Deposit' : 'Withdraw';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!isDeposit && account && numAmount > account.amount) {
      setError('Insufficient funds');
      return;
    }

    if (account) {
      onSubmit(account.id, numAmount);
    }

    setAmount('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`${title} - ${account.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Current Balance
          </p>
          <p className="text-2xl font-bold text-jet-black dark:text-white">
            {formatCurrency(account.amount)}
          </p>
        </div>

        <Input
          label={`${title} Amount`}
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

        {amount && !error && (
          <div className="text-center py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New Balance
            </p>
            <p
              className={`text-xl font-bold ${
                isDeposit ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(
                isDeposit
                  ? account.amount + parseFloat(amount || '0')
                  : account.amount - parseFloat(amount || '0')
              )}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1">
          <Button type="button" variant="secondary" onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            className={isDeposit ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {title}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
