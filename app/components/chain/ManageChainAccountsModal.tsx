'use client';

/**
 * Manage Chain Accounts Modal Component
 * Modal for adding, removing, and reordering accounts in a chain
 */

import React, { useState, useEffect } from 'react';
import { Chain } from '@/app/types/chain';
import { Account, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal, Select } from '@/app/components/shared';

interface ManageChainAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onAddAccount: (chainId: string, accountId: string, limit?: number) => void;
  onRemoveAccount: (chainId: string, accountId: string) => void;
  onReorder: (chainId: string, newOrder: string[]) => void;
  onUpdateLimit: (chainId: string, accountId: string, newLimit: number) => void;
}

export function ManageChainAccountsModal({
  isOpen,
  onClose,
  chain,
  accounts,
  onAddAccount,
  onRemoveAccount,
  onReorder,
  onUpdateLimit,
}: ManageChainAccountsModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [newLimit, setNewLimit] = useState<string>('');
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAccountId('');
      setNewLimit('');
      setEditingLimitId(null);
      setEditLimitValue('');
    }
  }, [isOpen]);

  if (!chain) return null;

  // Get accounts not in the chain
  const chainAccountIds = new Set(chain.accounts.map((ca) => ca.accountId));
  const availableAccounts = accounts.filter((a) => !chainAccountIds.has(a.id));

  // Get chain accounts with full data
  const chainAccountsWithData = chain.accounts
    .map((ca) => {
      const account = accounts.find((a) => a.id === ca.accountId);
      return account ? { ...account, limit: ca.limit } : null;
    })
    .filter(Boolean) as (Account & { limit: number })[];

  const handleAddAccount = () => {
    if (!selectedAccountId) return;
    const limit = newLimit ? parseFloat(newLimit) : undefined;
    onAddAccount(chain.id, selectedAccountId, limit);
    setSelectedAccountId('');
    setNewLimit('');
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = chain.accounts.map((ca) => ca.accountId);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(chain.id, newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === chain.accounts.length - 1) return;
    const newOrder = chain.accounts.map((ca) => ca.accountId);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(chain.id, newOrder);
  };

  const handleSaveLimit = (accountId: string) => {
    const newLimitNum = parseFloat(editLimitValue);
    if (!isNaN(newLimitNum) && newLimitNum >= 0) {
      onUpdateLimit(chain.id, accountId, newLimitNum);
    }
    setEditingLimitId(null);
    setEditLimitValue('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Accounts - ${chain.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Add account section */}
        {availableAccounts.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
            <h4 className="font-medium text-jet-black dark:text-white">
              Add Account to Chain
            </h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  options={availableAccounts.map((a) => ({
                    value: a.id,
                    label: `${ACCOUNT_ICONS[a.icon]} ${a.name}`,
                  }))}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  placeholder="Select an account"
                />
              </div>
              <div className="w-32">
                <Input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="Limit"
                  min={0}
                />
              </div>
              <Button onClick={handleAddAccount} disabled={!selectedAccountId}>
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Current accounts */}
        <div>
          <h4 className="font-medium text-jet-black dark:text-white mb-3">
            Chain Order
          </h4>
          {chainAccountsWithData.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              No accounts in this chain yet.
            </p>
          ) : (
            <div className="space-y-2">
              {chainAccountsWithData.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  style={{
                    borderLeftColor: ACCOUNT_COLORS[account.color],
                    borderLeftWidth: '4px',
                  }}
                >
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === chainAccountsWithData.length - 1}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Account info */}
                  <span className="text-xl">{ACCOUNT_ICONS[account.icon]}</span>
                  <div className="flex-1">
                    <p className="font-medium text-jet-black dark:text-white">
                      {account.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Balance: {formatCurrency(account.amount)}
                    </p>
                  </div>

                  {/* Limit */}
                  <div className="text-right">
                    {editingLimitId === account.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editLimitValue}
                          onChange={(e) => setEditLimitValue(e.target.value)}
                          className="w-24 text-sm"
                          min={0}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveLimit(account.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingLimitId(null)}
                          className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingLimitId(account.id);
                          setEditLimitValue(account.limit.toString());
                        }}
                        className="text-sm text-slate-500 hover:text-french-blue"
                      >
                        Limit: {formatCurrency(account.limit)} ✎
                      </button>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveAccount(chain.id, account.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg"
                    aria-label="Remove from chain"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
