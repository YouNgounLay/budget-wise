'use client';

/**
 * Chain Edit Modal Component
 * Combined modal for editing chain settings and managing accounts
 * Replaces separate ChainForm and ManageChainAccountsModal
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chain, CreateChainDTO, ChainDistributionMode } from '@/app/types/chain';
import { Account, AccountColor, ACCOUNT_COLORS } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { Button, Input, Modal, Select } from '@/app/components/shared';
import { ColorPicker } from '@/app/components/account/ColorPicker';
import { FileText, PieChart, List, Infinity, ChevronUp, ChevronDown, Pencil, Check, X, Trash2 } from 'lucide-react';

// Custom Icon wrappers for backward compatibility
const DocumentIcon = () => <FileText className="w-5 h-5" />;
const ChartIcon = () => <PieChart className="w-5 h-5" />;
const ListIcon = () => <List className="w-5 h-5" />;
const InfinityIcon = () => <Infinity className="w-5 h-5" />;

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
  existingChains?: Chain[];
  onSave: (data: CreateChainDTO) => void;
  onAddAccount: (chainId: string, accountId: string, limit?: number, percentage?: number) => void;
  onRemoveAccount: (chainId: string, accountId: string) => void;
  onReorder: (chainId: string, newOrder: string[]) => void;
  onUpdateLimit: (chainId: string, accountId: string, newLimit: number) => void;
  onUpdatePercentage: (chainId: string, accountId: string, newPercentage: number) => void;
  onToggleBuffer: (chainId: string) => void;
  onSetBufferAccount: (chainId: string, accountId: string | null) => void;
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
  existingChains = [],
  onSave,
  onAddAccount,
  onRemoveAccount,
  onReorder,
  onUpdateLimit,
  onUpdatePercentage,
  onToggleBuffer,
  onSetBufferAccount,
  onToggleDistributionMode,
  isCreating = false,
}: ChainEditModalProps) {
  const [formData, setFormData] = useState<CreateChainDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChainDTO, string>>>({});
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [newLimit, setNewLimit] = useState<string>('');
  const [newPercentage, setNewPercentage] = useState<string>('');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
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
      setEditingAccountId(null);
      setEditValue('');
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
    } else {
      // Check for duplicate name (case-insensitive)
      const normalizedName = formData.name.trim().toLowerCase();
      const duplicate = existingChains.find(
        (c) => c.name.toLowerCase() === normalizedName && c.id !== chain?.id
      );
      if (duplicate) {
        newErrors.name = 'A chain with this name already exists';
      }
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

  // Start editing an account
  const handleStartEdit = useCallback((accountId: string, currentValue: number) => {
    setEditingAccountId(accountId);
    setEditValue(currentValue.toString());
  }, []);

  // Confirm edit and save
  const handleConfirmEdit = useCallback((accountId: string) => {
    if (!chain) return;
    const value = parseFloat(editValue);
    if (isNaN(value) || value < 0) {
      setEditingAccountId(null);
      setEditValue('');
      return;
    }
    
    if (isPercentageMode) {
      if (value <= 100) {
        onUpdatePercentage(chain.id, accountId, value);
      }
    } else {
      onUpdateLimit(chain.id, accountId, value);
    }
    
    setEditingAccountId(null);
    setEditValue('');
  }, [chain, editValue, isPercentageMode, onUpdateLimit, onUpdatePercentage]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingAccountId(null);
    setEditValue('');
  }, []);

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
                        className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg overflow-visible"
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
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === chainAccountsWithData.length - 1}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Account info */}
                        {(() => { const AccountIcon = getLucideIcon(account.icon); return (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ACCOUNT_COLORS[account.color]}20` }}>
                            <AccountIcon className="w-4 h-4" style={{ color: ACCOUNT_COLORS[account.color] }} strokeWidth={1.5} />
                          </div>
                        ); })()}
                        <div className="flex-1">
                          <p className="font-medium text-jet-black dark:text-white">
                            {account.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            Balance: {formatCurrency(account.amount)}
                          </p>
                        </div>

                        {/* Edit button / Edit mode */}
                        {editingAccountId === account.id ? (
                          <div className="flex flex-col gap-2">
                            {/* Edit value row */}
                            <div className="flex items-center gap-2 relative z-10">
                              <span className="text-xs text-muted">
                                {isPercentageMode ? 'Percentage:' : 'Limit:'}
                              </span>
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24 text-sm"
                                min={0}
                                max={isPercentageMode ? 100 : undefined}
                                autoFocus
                              />
                              {isPercentageMode && <span className="text-sm text-slate-500">%</span>}
                            </div>
                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleConfirmEdit(account.id)}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded transition-colors"
                              >
                                <CheckIcon /> Confirm
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded transition-colors"
                              >
                                <CloseIcon /> Cancel
                              </button>
                            </div>
                            {/* Remove account button */}
                            <button
                              type="button"
                              onClick={() => {
                                onRemoveAccount(chain.id, account.id);
                                handleCancelEdit();
                              }}
                              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-rose-600 border border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove Account
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              {isPercentageMode ? `${account.percentage}%` : `Limit: ${formatCurrency(account.limit)}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(account.id, isPercentageMode ? account.percentage : account.limit)}
                              className="p-1.5 text-french-blue hover:bg-french-blue/10 rounded-lg transition-colors"
                              aria-label="Edit account"
                            >
                              <EditIcon />
                            </button>
                          </div>
                        )}
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
                            label: a.name,
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
                    <div className="mt-3 space-y-3">
                      {/* Buffer Type Selection */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onSetBufferAccount(chain.id, null)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            !chain.bufferAccountId
                              ? 'bg-emerald-600 text-white'
                              : 'bg-surface border border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <InfinityIcon /> Virtual Buffer
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Select first available account if switching to account buffer
                            if (availableAccounts.length > 0 && !chain.bufferAccountId) {
                              onSetBufferAccount(chain.id, availableAccounts[0].id);
                            }
                          }}
                          disabled={availableAccounts.length === 0}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chain.bufferAccountId
                              ? 'bg-emerald-600 text-white'
                              : 'bg-surface border border-border text-foreground hover:bg-slate-50 dark:hover:bg-slate-700'
                          } ${availableAccounts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={availableAccounts.length === 0 ? 'No available accounts (all accounts are in the chain)' : ''}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <BankIcon /> Use Account
                          </span>
                        </button>
                      </div>

                      {/* Virtual Buffer Display */}
                      {!chain.bufferAccountId && (
                        <div className="p-3 bg-surface rounded-lg border border-emerald-200 dark:border-emerald-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-600"><BankIcon /></span>
                              <span className="font-medium text-foreground">Chain Buffer (Unlimited)</span>
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

                      {/* Account Buffer Selector */}
                      {chain.bufferAccountId && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Select Buffer Account:
                          </label>
                          <select
                            value={chain.bufferAccountId}
                            onChange={(e) => onSetBufferAccount(chain.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {availableAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.amount)})
                              </option>
                            ))}
                            {/* Also include current buffer account if it was removed from available */}
                            {chain.bufferAccountId && !availableAccounts.some(a => a.id === chain.bufferAccountId) && (
                              <option value={chain.bufferAccountId}>
                                {accounts.find(a => a.id === chain.bufferAccountId)?.name || 'Unknown'} (current buffer)
                              </option>
                            )}
                          </select>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Overflow funds will be deposited directly to this account
                          </p>
                        </div>
                      )}
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
