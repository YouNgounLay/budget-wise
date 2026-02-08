'use client';

/**
 * Chain Edit Modal Component
 * Combined modal for editing chain settings and managing accounts
 * Replaces separate ChainForm and ManageChainAccountsModal
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chain, CreateChainDTO, ChainDistributionMode } from '@/app/types/chain';
import { Account, AccountColor, ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal, Select } from '@/app/components/shared';
import { ColorPicker } from '@/app/components/account/ColorPicker';

// Custom SVG Icons
const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const InfinityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.303 0-4.303 8 0 8 5.606 0 7.644-8 12.739-8z" />
  </svg>
);

const BankIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface ChainEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain | null;
  accounts: Account[];
  onSave: (data: CreateChainDTO) => void;
  onAddAccount: (chainId: string, accountId: string, limit?: number, percentage?: number) => void;
  onRemoveAccount: (chainId: string, accountId: string) => void;
  onReorder: (chainId: string, newOrder: string[]) => void;
  onUpdateLimit: (chainId: string, accountId: string, newLimit: number) => void;
  onUpdatePercentage: (chainId: string, accountId: string, newPercentage: number) => void;
  onToggleBuffer: (chainId: string) => void;
  onToggleDistributionMode: (chainId: string) => void;
  isCreating?: boolean;
}

const defaultFormData: CreateChainDTO = {
  name: '',
  description: '',
  defaultLimit: 2000,
  color: 'french-blue',
  customColor: '#4a86e8',
};

export function ChainEditModal({
  isOpen,
  onClose,
  chain,
  accounts,
  onSave,
  onAddAccount,
  onRemoveAccount,
  onReorder,
  onUpdateLimit,
  onUpdatePercentage,
  onToggleBuffer,
  onToggleDistributionMode,
  isCreating = false,
}: ChainEditModalProps) {
  const [formData, setFormData] = useState<CreateChainDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChainDTO, string>>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [newLimit, setNewLimit] = useState<string>('');
  const [newPercentage, setNewPercentage] = useState<string>('');
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');
  const [editingPercentageId, setEditingPercentageId] = useState<string | null>(null);
  const [editPercentageValue, setEditPercentageValue] = useState<string>('');
  const [showAppearance, setShowAppearance] = useState(false);
  const [showModeInfo, setShowModeInfo] = useState(false);

  // Reset form when modal opens/closes or chain changes
  useEffect(() => {
    if (isOpen && chain && !isCreating) {
      setFormData({
        name: chain.name,
        description: chain.description,
        defaultLimit: chain.defaultLimit,
        color: chain.color || 'french-blue',
        customColor: chain.customColor || '#4a86e8',
      });
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setSelectedAccountId('');
      setNewLimit('');
      setNewPercentage('');
      setEditingLimitId(null);
      setEditLimitValue('');
      setEditingPercentageId(null);
      setEditPercentageValue('');
      setShowAppearance(false);
      setShowModeInfo(false);
    }
  }, [isOpen, chain, isCreating]);

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
    accounts.filter((a) => !chainAccountIds.has(a.id)),
    [accounts, chainAccountIds]
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

  const handleChange = (field: keyof CreateChainDTO, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateChainDTO, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Chain name is required';
    }

    if ((formData.defaultLimit ?? 0) < 0) {
      newErrors.defaultLimit = 'Default limit cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });

    onClose();
  };

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

  const handleToggleBuffer = useCallback(() => {
    if (!chain) return;
    onToggleBuffer(chain.id);
  }, [chain, onToggleBuffer]);

  // Check if buffer can be disabled
  const canDisableBuffer = chain?.bufferAmount === 0;

  // Get current color for preview
  const currentColor = formData.color === 'custom' && formData.customColor
    ? formData.customColor
    : ACCOUNT_COLORS[formData.color || 'french-blue'];

  const modalTitle = isCreating ? 'Create Chain' : 'Edit Chain';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-6">
          {/* Header: Chain Name and Distribution Mode */}
          <div className="flex flex-col gap-4 pb-4 border-b border-border">
            <div className="flex-1">
              <Input
                label="Chain Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Monthly Savings"
                error={errors.name}
                required
              />
            </div>

            {/* Distribution Mode - Inline with chain name for existing chains */}
            {!isCreating && chain && (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-french-blue/10 rounded-lg text-french-blue">
                    {isPercentageMode ? <ChartIcon /> : <ListIcon />}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-jet-black dark:text-white">
                      {isPercentageMode ? 'Percentage Mode' : 'Sequential Mode'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowModeInfo(!showModeInfo)}
                      className="ml-2 text-slate-400 hover:text-slate-600 inline-flex items-center"
                    >
                      <InfoIcon />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
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
            )}

            {/* Mode Info Dropdown */}
            {showModeInfo && !isCreating && chain && (
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                {isPercentageMode ? (
                  <p>Distribute deposits by percentage to each account. The total must equal 100%.</p>
                ) : (
                  <p>Fill accounts sequentially until their limits are reached, then move to the next account.</p>
                )}
              </div>
            )}

            {/* Percentage total indicator */}
            {!isCreating && chain && isPercentageMode && (
              <div className={`text-sm font-medium px-3 py-2 rounded-lg ${
                totalPercentage === 100 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                Total: {totalPercentage}% {totalPercentage !== 100 && '(must equal 100%)'}
              </div>
            )}
          </div>

          {/* Chain Details Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-jet-black dark:text-white flex items-center gap-2">
              <DocumentIcon /> Chain Details
            </h4>

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What is this chain for?"
              helperText="Describe the purpose of this deposit chain"
            />

            <Input
              label="Default Account Limit"
              type="number"
              value={formData.defaultLimit}
              onChange={(e) => handleChange('defaultLimit', parseFloat(e.target.value) || 0)}
              min={0}
              step={100}
              error={errors.defaultLimit}
              helperText="Default limit for each account in this chain"
            />
          </div>

          {/* Appearance Section */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAppearance(!showAppearance)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: currentColor }}
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-jet-black dark:text-white">
                    Appearance
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chain Color
                  </p>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-500 transition-transform ${showAppearance ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAppearance && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <ColorPicker
                  label="Chain Color"
                  value={formData.color || 'french-blue'}
                  onChange={(color: AccountColor) => handleChange('color', color)}
                  customColorValue={formData.customColor}
                  onCustomColorChange={(hex) => handleChange('customColor', hex)}
                />
              </div>
            )}
          </div>

          {/* Account Management Section - Only show when editing existing chain */}
          {!isCreating && chain && (
            <>
              {/* Current accounts - Chain Order */}
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
                            type="button"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move up"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === chainAccountsWithData.length - 1}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move down"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                                  type="button"
                                  onClick={() => handleSavePercentage(account.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPercentageId(null)}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                >
                                  <CloseIcon />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPercentageId(account.id);
                                  setEditPercentageValue(account.percentage.toString());
                                }}
                                className="text-sm text-slate-500 hover:text-french-blue flex items-center gap-1"
                              >
                                {account.percentage}% <EditIcon />
                              </button>
                            )
                          ) : (
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
                                  type="button"
                                  onClick={() => handleSaveLimit(account.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLimitId(null)}
                                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                                >
                                  <CloseIcon />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLimitId(account.id);
                                  setEditLimitValue(account.limit.toString());
                                }}
                                className="text-sm text-slate-500 hover:text-french-blue flex items-center gap-1"
                              >
                                Limit: {formatCurrency(account.limit)} <EditIcon />
                              </button>
                            )
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => onRemoveAccount(chain.id, account.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg"
                          aria-label="Remove from chain"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add account section - at bottom of chain order */}
                {availableAccounts.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-french-blue/5 to-fresh-sky/5 dark:from-french-blue/10 dark:to-fresh-sky/10 rounded-lg border-2 border-dashed border-french-blue/40 dark:border-french-blue/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-french-blue/10 rounded-lg text-french-blue">
                        <PlusCircleIcon />
                      </div>
                      <h4 className="font-medium text-jet-black dark:text-white">
                        Add Account to Chain
                      </h4>
                    </div>
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
                      <Button type="button" onClick={handleAddAccount} disabled={!selectedAccountId}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Buffer Account Section - Only show in sequential mode */}
              {!isPercentageMode && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-jet-black dark:text-white flex items-center gap-2">
                        <span className="text-emerald-600"><InfinityIcon /></span>
                        Buffer Account
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Stores overflow funds when all accounts reach their limits
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBuffer}
                      disabled={chain.hasBufferAccount && !canDisableBuffer}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        chain.hasBufferAccount
                          ? 'bg-emerald-500'
                          : 'bg-slate-300 dark:bg-slate-600'
                      } ${chain.hasBufferAccount && !canDisableBuffer ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={chain.hasBufferAccount && !canDisableBuffer ? 'Cannot disable while buffer has funds' : ''}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          chain.hasBufferAccount ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {chain.hasBufferAccount && (
                    <div className="mt-3 p-3 bg-surface rounded-lg border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600"><BankIcon /></span>
                          <span className="font-medium text-foreground">Chain Buffer</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(chain.bufferAmount)}
                          </p>
                          {chain.bufferAmount > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              Cannot disable until emptied
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky footer for action buttons */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1 mt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {isCreating ? 'Create Chain' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
