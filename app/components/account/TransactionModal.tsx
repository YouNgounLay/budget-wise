'use client';

/**
 * Transaction Modal Component
 * Modal for depositing or withdrawing from an account
 */

import React, { useState, useEffect } from 'react';
import { Account } from '@/app/types/account';
import { Tag, CreateTagDTO } from '@/app/types/tag';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal } from '@/app/components/shared';
import { TagPicker } from '@/app/components/tag/TagPicker';

type TransactionType = 'deposit' | 'withdraw';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  type: TransactionType;
  onSubmit: (accountId: string, amount: number, tagIds?: string[], description?: string) => void;
  availableTags?: Tag[];
  onCreateTag?: (data: CreateTagDTO) => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  account,
  type,
  onSubmit,
  availableTags = [],
  onCreateTag,
}: TransactionModalProps) {
  const [amount, setAmount] = useState<string>('10'); // Default to $10
  const [error, setError] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');

  const isDeposit = type === 'deposit';
  const title = isDeposit ? 'Deposit' : 'Withdraw';

  // Quick add amounts
  const quickAmounts = [10, 100, 1000];

  const handleQuickAdd = (quickAmount: number) => {
    const currentAmount = parseFloat(amount) || 0;
    const newAmount = currentAmount + quickAmount;
    setAmount(newAmount.toString());
    setError('');
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedTagIds([]);
      setDescription('');
    }
  }, [isOpen]);

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
      onSubmit(
        account.id, 
        numAmount, 
        selectedTagIds.length > 0 ? selectedTagIds : undefined,
        description.trim() || undefined
      );
    }

    setAmount('10');
    setError('');
    setSelectedTagIds([]);
    setDescription('');
    onClose();
  };

  const handleClose = () => {
    setAmount('10');
    setError('');
    setSelectedTagIds([]);
    setDescription('');
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
          step="any"
          error={error}
          autoFocus
        />

        {/* Quick add buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Quick add:</span>
          <div className="flex gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAdd(quickAmount)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-french-blue hover:text-white dark:hover:bg-french-blue transition-colors"
              >
                +${quickAmount}
              </button>
            ))}
          </div>
        </div>

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

        {/* Description field */}
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this transaction for?"
        />

        {/* Tags Section */}
        {availableTags.length > 0 && onCreateTag && (
          <TagPicker
            label="Tags (optional)"
            availableTags={availableTags}
            selectedTagIds={selectedTagIds}
            onAddTag={(tagId) => setSelectedTagIds((prev) => [...prev, tagId])}
            onRemoveTag={(tagId) => setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))}
            onCreateTag={onCreateTag}
            entityType="transaction"
          />
        )}

        {/* Scroll padding to ensure content can scroll past dropdown overlays */}
        <div className="h-32 shrink-0" aria-hidden="true" />

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
