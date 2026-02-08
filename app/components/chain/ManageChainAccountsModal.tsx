'use client';

/**
 * Manage Chain Accounts Modal Component
 * Modal for adding, removing, and reordering accounts in a chain
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chain, ChainDistributionMode } from '@/app/types/chain';
import { Account, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal, Select } from '@/app/components/shared';

interface ManageChainAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onAddAccount: (chainId: string, accountId: string, limit?: number, percentage?: number) => void;
  onRemoveAccount: (chainId: string, accountId: string) => void;
  onReorder: (chainId: string, newOrder: string[]) => void;
  onUpdateLimit: (chainId: string, accountId: string, newLimit: number) => void;
  onUpdatePercentage: (chainId: string, accountId: string, newPercentage: number) => void;
  onSetOverflowAccount: (chainId: string, accountId: string | null) => void;
  onToggleDistributionMode: (chainId: string) => void;
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
  onUpdatePercentage,
  onSetOverflowAccount,
  onToggleDistributionMode,
}: ManageChainAccountsModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [newLimit, setNewLimit] = useState<string>('');
  const [newPercentage, setNewPercentage] = useState<string>('');
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');
  const [editingPercentageId, setEditingPercentageId] = useState<string | null>(null);
  const [editPercentageValue, setEditPercentageValue] = useState<string>('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAccountId('');
      setNewLimit('');
      setNewPercentage('');
      setEditingLimitId(null);
      setEditLimitValue('');
      setEditingPercentageId(null);
      setEditPercentageValue('');
    }
  }, [isOpen]);

  // Check if chain is in percentage mode
  const isPercentageMode = chain?.distributionMode === 'percentage';

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    if (!chain) return 0;
    return chain.accounts.reduce((sum, acc) => sum + (acc.percentage || 0), 0);
  }, [chain?.accounts]);

  // Memoize expensive computations
  const chainAccountIds = useMemo(() => 
    new Set(chain?.accounts.map((ca) => ca.accountId) ?? []),
    [chain?.accounts]
  );

  const availableAccounts = useMemo(() => 
    accounts.filter(
      (a) => !chainAccountIds.has(a.id) && a.id !== chain?.overflowAccountId
    ),
    [accounts, chainAccountIds, chain?.overflowAccountId]
  );

  const availableForOverflow = useMemo(() => 
    accounts.filter((a) => !chainAccountIds.has(a.id)),
    [accounts, chainAccountIds]
  );

  const overflowAccount = useMemo(() => 
    chain?.overflowAccountId
      ? accounts.find((a) => a.id === chain.overflowAccountId)
      : null,
    [accounts, chain?.overflowAccountId]
  );

  const chainAccountsWithData = useMemo(() => 
    (chain?.accounts ?? [])
      .map((ca) => {
        const account = accounts.find((a) => a.id === ca.accountId);
        return account ? { ...account, limit: ca.limit, percentage: ca.percentage || 0 } : null;
      })
      .filter(Boolean) as (Account & { limit: number; percentage: number })[],
    [chain?.accounts, accounts]
  );

  const handleAddAccount = useCallback(() => {
    if (!selectedAccountId || !chain) return;
    const limit = newLimit ? parseFloat(newLimit) : undefined;
    const percentage = newPercentage ? parseFloat(newPercentage) : undefined;
    onAddAccount(chain.id, selectedAccountId, limit, percentage);
    setSelectedAccountId('');
    setNewLimit('');
    setNewPercentage('');
  }, [selectedAccountId, newLimit, newPercentage, chain, onAddAccount]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0 || !chain) return;
    const newOrder = chain.accounts.map((ca) => ca.accountId);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(chain.id, newOrder);
  }, [chain, onReorder]);


  const handleMoveDown = useCallback((index: number) => {
    if (!chain || index === chain.accounts.length - 1) return;
    const newOrder = chain.accounts.map((ca) => ca.accountId);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(chain.id, newOrder);
  }, [chain, onReorder]);

  const handleSaveLimit = useCallback((accountId: string) => {
    if (!chain) return;
    const newLimitNum = parseFloat(editLimitValue);
    if (!isNaN(newLimitNum) && newLimitNum >= 0) {
      onUpdateLimit(chain.id, accountId, newLimitNum);
    }
    setEditingLimitId(null);
    setEditLimitValue('');
  }, [chain, editLimitValue, onUpdateLimit]);

  const handleSavePercentage = useCallback((accountId: string) => {
    if (!chain) return;
    const newPercentageNum = parseFloat(editPercentageValue);
    if (!isNaN(newPercentageNum) && newPercentageNum >= 0 && newPercentageNum <= 100) {
      onUpdatePercentage(chain.id, accountId, newPercentageNum);
    }
    setEditingPercentageId(null);
    setEditPercentageValue('');
  }, [chain, editPercentageValue, onUpdatePercentage]);

  const handleToggleMode = useCallback(() => {
    if (!chain) return;
    onToggleDistributionMode(chain.id);
  }, [chain, onToggleDistributionMode]);

  if (!isOpen || !chain) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Accounts - ${chain.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Distribution Mode Toggle */}
        <div className="p-4 bg-gradient-to-r from-french-blue/10 to-fresh-sky/10 dark:from-french-blue/20 dark:to-fresh-sky/20 rounded-lg border border-french-blue/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-jet-black dark:text-white flex items-center gap-2">
                {isPercentageMode ? '📊' : '📋'} Distribution Mode
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isPercentageMode
                  ? 'Distribute deposits by percentage to each account'
                  : 'Fill accounts sequentially until their limits are reached'}
              </p>
            </div>
            <button
              onClick={handleToggleMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPercentageMode
                  ? 'bg-french-blue'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPercentageMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className={`${!isPercentageMode ? 'text-french-blue font-medium' : 'text-slate-500'}`}>
              Sequential (Limits)
            </span>
            <span className={`${isPercentageMode ? 'text-french-blue font-medium' : 'text-slate-500'}`}>
              Percentage
            </span>
          </div>
          {isPercentageMode && (
            <div className={`mt-3 text-sm font-medium ${totalPercentage === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              Total: {totalPercentage}% {totalPercentage !== 100 && '(must equal 100%)'}
            </div>
          )}
        </div>

        {/* Add account section */}
        {availableAccounts.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
            <h4 className="font-medium text-jet-black dark:text-white">
              Add Account to Chain
            </h4>
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <Select
                  options={availableAccounts.map((a) => ({
                    value: a.id,
                    label: `${a.icon === 'custom' && a.customEmoji ? a.customEmoji : ACCOUNT_ICONS[a.icon]} ${a.name}`,
                  }))}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  placeholder="Select an account"
                />
              </div>
              {!isPercentageMode ? (
                <div className="w-28">
                  <Input
                    type="number"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    placeholder="Limit"
                    min={0}
                  />
                </div>
              ) : (
                <div className="w-20">
                  <Input
                    type="number"
                    value={newPercentage}
                    onChange={(e) => setNewPercentage(e.target.value)}
                    placeholder="%"
                    min={0}
                    max={100}
                  />
                </div>
              )}
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
                  className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg"
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
                  <span className="text-xl">{account.icon === 'custom' && account.customEmoji ? account.customEmoji : ACCOUNT_ICONS[account.icon]}</span>
                  <div className="flex-1">
                    <p className="font-medium text-jet-black dark:text-white">
                      {account.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Balance: {formatCurrency(account.amount)}
                    </p>
                  </div>

                  {/* Limit or Percentage */}
                  <div className="text-right">
                    {isPercentageMode ? (
                      // Percentage mode editing
                      editingPercentageId === account.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editPercentageValue}
                            onChange={(e) => setEditPercentageValue(e.target.value)}
                            className="w-20 text-sm"
                            min={0}
                            max={100}
                            autoFocus
                          />
                          <span className="text-sm text-slate-500">%</span>
                          <button
                            onClick={() => handleSavePercentage(account.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingPercentageId(null)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPercentageId(account.id);
                            setEditPercentageValue(account.percentage.toString());
                          }}
                          className="text-sm text-slate-500 hover:text-french-blue"
                        >
                          {account.percentage}% ✎
                        </button>
                      )
                    ) : (
                      // Sequential mode (limit) editing
                      editingLimitId === account.id ? (
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
                      )
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

        {/* Overflow Account Section - Only show in sequential mode */}
        {!isPercentageMode && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700">
          <h4 className="font-medium text-jet-black dark:text-white mb-3 flex items-center gap-2">
            <span className="text-lg">∞</span>
            Overflow Account (No Limit)
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Any remaining funds after all accounts reach their limits will go here.
          </p>
          
          {overflowAccount ? (
            <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-3">
                <span className="text-xl">{overflowAccount.icon === 'custom' && overflowAccount.customEmoji ? overflowAccount.customEmoji : ACCOUNT_ICONS[overflowAccount.icon]}</span>
                <div>
                  <p className="font-medium text-foreground">
                    {overflowAccount.name}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Balance: {formatCurrency(overflowAccount.amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSetOverflowAccount(chain.id, null)}
                className="px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Select
                options={availableForOverflow.map((a) => ({
                  value: a.id,
                  label: `${a.icon === 'custom' && a.customEmoji ? a.customEmoji : ACCOUNT_ICONS[a.icon]} ${a.name}`,
                }))}
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    onSetOverflowAccount(chain.id, e.target.value);
                  }
                }}
                placeholder="Select overflow account"
                className="flex-1"
              />
            </div>
          )}
        </div>
        )}

        <div className="flex justify-end pt-4 sticky bottom-0 bg-surface pb-1">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
