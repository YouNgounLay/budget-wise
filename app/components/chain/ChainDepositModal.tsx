'use client';

/**
 * Chain Deposit Modal Component
 * Modal for depositing money to a chain
 */

import React, { useState, useEffect } from 'react';
import { Chain, DepositResult } from '@/app/types/chain';
import { Account } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { depositToChain } from '@/app/services/depositService';
import { Button, Input, Modal } from '@/app/components/shared';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { ChevronDown, Save, X } from 'lucide-react';

// Custom SVG Icons
const ChartIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const InfinityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.303 0-4.303 8 0 8 5.606 0 7.644-8 12.739-8z" />
  </svg>
);

const BankIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

interface ChainDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onConfirmDeposit: (result: DepositResult, description?: string) => void;
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
      // Save description for future if toggle is on
      if (saveForFuture && description.trim()) {
        handleSaveDescription(description.trim());
      }
      onConfirmDeposit(preview, description.trim() || undefined);
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

            {/* Description Section */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this deposit for?"
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
                  {chain.distributionMode === 'percentage' ? 'Percentage Distribution:' : 'Chain Order:'}
                </h4>
                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center ${
                  chain.distributionMode === 'percentage'
                    ? 'bg-french-blue/20 text-french-blue'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                }`}>
                  {chain.distributionMode === 'percentage' ? <><ChartIcon /> Percentage</> : <><ListIcon /> Sequential</>}
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
                        {isPercentageMode 
                          ? `(${ca.percentage || 0}%)`
                          : `(${formatCurrency(account.amount)} / ${formatCurrency(ca.limit)})`
                        }
                      </span>
                    </div>
                  );
                })}
                {/* Buffer Account Display */}
                {chain.distributionMode === 'sequential' && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-slate-200 dark:border-slate-600 mt-2">
                    <span className="text-emerald-500"><InfinityIcon /></span>
                    <span className="text-emerald-600"><BankIcon /></span>
                    <span className="text-jet-black dark:text-white">
                      Buffer Account
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      chain.hasBufferAccount 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {chain.hasBufferAccount ? `Active (${formatCurrency(chain.bufferAmount)})` : 'Auto-enable on overflow'}
                    </span>
                  </div>
                )}
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
                {/* Buffer Deposit Display */}
                {preview.bufferDeposit && preview.bufferDeposit.amount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600"><BankIcon /></span>
                      <span className="text-jet-black dark:text-white font-medium">
                        Buffer Account
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 font-medium">
                        +{formatCurrency(preview.bufferDeposit.amount)}
                      </span>
                      <span className="text-slate-500 text-sm block">
                        New balance: {formatCurrency(preview.bufferDeposit.newBufferBalance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {preview.remainingAmount > 0 && !preview.bufferDeposit && (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
                <WarningIcon /> {formatCurrency(preview.remainingAmount)} could not be deposited
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
