'use client';

/**
 * Chain Withdraw Modal Component
 * Modal for withdrawing money from a chain (right to left)
 */

import React, { useState, useEffect } from 'react';
import { Chain, DepositResult } from '@/app/types/chain';
import { Account } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { withdrawFromChain } from '@/app/services/depositService';
import { Button, Input, Modal } from '@/app/components/shared';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { ChevronDown, Save, X } from 'lucide-react';

// Custom SVG Icons
const WarningIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

interface ChainWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onConfirmWithdraw: (result: DepositResult, description?: string) => void;
}

export function ChainWithdrawModal({
  isOpen,
  onClose,
  chain,
  accounts,
  onConfirmWithdraw,
}: ChainWithdrawModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<DepositResult | null>(null);
  const [description, setDescription] = useState<string>('');
  const [saveForFuture, setSaveForFuture] = useState<boolean>(false);
  const [savedDescriptions, setSavedDescriptions] = useState<string[]>([]);
  const [showSavedDescriptions, setShowSavedDescriptions] = useState<boolean>(false);

  // Load saved descriptions on mount
  useEffect(() => {
    const saved = getFromStorage<string[]>(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS) || [];
    setSavedDescriptions(saved);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setSaveForFuture(false);
      setShowSavedDescriptions(false);
    }
  }, [isOpen]);

  const handleSaveDescription = (desc: string) => {
    if (!desc.trim()) return;
    const saved = getFromStorage<string[]>(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS) || [];
    // Remove if already exists (to move to front)
    const filtered = saved.filter(s => s.toLowerCase() !== desc.toLowerCase());
    // Add to front, keep max 10
    const updated = [desc.trim(), ...filtered].slice(0, 10);
    setToStorage(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS, updated);
    setSavedDescriptions(updated);
  };

  const handleDeleteSavedDescription = (desc: string) => {
    const saved = getFromStorage<string[]>(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS) || [];
    const updated = saved.filter(s => s !== desc);
    setToStorage(STORAGE_KEYS.SAVED_CHAIN_DESCRIPTIONS, updated);
    setSavedDescriptions(updated);
  };

  // Calculate total available across chain accounts
  const totalAvailable = chain
    ? chain.accounts.reduce((sum, ca) => {
        const account = accounts.find((a) => a.id === ca.accountId);
        return sum + (account?.amount || 0);
      }, 0)
    : 0;

  const handlePreview = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!chain) return;

    const result = withdrawFromChain(chain.id, numAmount, accounts);
    setPreview(result);
  };

  const handleConfirm = () => {
    if (preview && preview.success) {
      // Save description for future if toggle is on
      if (saveForFuture && description.trim()) {
        handleSaveDescription(description.trim());
      }
      onConfirmWithdraw(preview, description.trim() || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setPreview(null);
    setDescription('');
    setSaveForFuture(false);
    setShowSavedDescriptions(false);
    onClose();
  };

  if (!chain) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Withdraw from ${chain.name}`}
      size="lg"
    >
      <div className="space-y-4">
        {!preview ? (
          <>
            <Input
              label="Withdrawal Amount"
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

            {/* Total available */}
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total available in chain: <span className="font-medium text-foreground">{formatCurrency(totalAvailable)}</span>
            </p>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this withdrawal for?"
                />
                {savedDescriptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSavedDescriptions(!showSavedDescriptions)}
                    className="absolute right-3 top-8 p-1 text-slate-400 hover:text-french-blue transition-colors"
                    title="Show saved descriptions"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showSavedDescriptions ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>

              {/* Saved descriptions dropdown */}
              {showSavedDescriptions && savedDescriptions.length > 0 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-surface max-h-32 overflow-y-auto">
                  {savedDescriptions.map((saved, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDescription(saved);
                          setShowSavedDescriptions(false);
                        }}
                        className="flex-1 text-left text-sm text-foreground hover:text-french-blue truncate"
                      >
                        {saved}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedDescription(saved)}
                        className="ml-2 p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove saved description"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save for future toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-french-blue focus:ring-french-blue"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" />
                  Save description for future use
                </span>
              </label>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  Withdrawal Order (Right to Left):
                </h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  Withdraws from last account first
                </span>
              </div>
              <div className="space-y-2">
                {[...chain.accounts].reverse().map((ca, index) => {
                  const account = accounts.find((a) => a.id === ca.accountId);
                  if (!account) return null;

                  return (
                    <div
                      key={account.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-slate-400">{index + 1}.</span>
                      <span className="flex items-center">
                        {(() => {
                          const IconComponent = getLucideIcon(account.icon);
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                      </span>
                      <span className="text-jet-black dark:text-white">
                        {account.name}
                      </span>
                      <span className="text-slate-500">
                        ({formatCurrency(account.amount)} available)
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
              <Button onClick={handlePreview} fullWidth variant="danger">
                Preview Withdrawal
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
                  Withdrawal Breakdown:
                </h4>
                {preview.deposits.map((withdrawal) => (
                  <div
                    key={withdrawal.accountId}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <span className="text-jet-black dark:text-white">
                      {withdrawal.accountName}
                    </span>
                    <div className="text-right">
                      <span className="text-rose-600 font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </span>
                      <span className="text-slate-500 text-sm block">
                        New balance: {formatCurrency(withdrawal.newBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preview.remainingAmount > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                <WarningIcon /> {formatCurrency(preview.remainingAmount)} could not be withdrawn
                (insufficient funds in chain)
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
                variant="danger"
              >
                Confirm Withdrawal
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
