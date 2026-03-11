'use client';

/**
 * Account Rules Modal Component
 * Modal for managing allocation rules for an account
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Account } from '@/app/types/account';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import {
  AccountRule,
  CreateAccountRuleDTO,
  AllocationTarget,
  AllocationMode,
  DayOfWeek,
  DAY_OF_WEEK_LABELS,
  RuleExecutionResult,
  RuleFrequency,
  RULE_FREQUENCY_OPTIONS,
  RULE_FREQUENCY_LABELS,
  formatNextTriggerDate,
} from '@/app/types/rule';
import { formatCurrency } from '@/app/utils/helpers';
import { Button, Input, Modal, Select } from '@/app/components/shared';

interface AccountRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  accounts: Account[];
  rules: AccountRule[];
  onCreateRule: (data: CreateAccountRuleDTO) => { success: boolean; error?: string };
  onDeleteRule: (id: string) => void;
  onToggleRule: (id: string) => void;
  onExecuteRule: (ruleId: string) => RuleExecutionResult | null;
  onApplyRuleExecution: (result: RuleExecutionResult) => void;
}

export function AccountRulesModal({
  isOpen,
  onClose,
  account,
  accounts,
  rules,
  onCreateRule,
  onDeleteRule,
  onToggleRule,
  onExecuteRule,
  onApplyRuleExecution,
}: AccountRulesModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1);
  const [frequency, setFrequency] = useState<RuleFrequency>('weekly');
  const [thresholdAmount, setThresholdAmount] = useState<string>('');
  const [targets, setTargets] = useState<AllocationTarget[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [targetPercentage, setTargetPercentage] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [allocationMode, setAllocationMode] = useState<AllocationMode>('percentage');
  const [error, setError] = useState<string>('');
  const [executionPreview, setExecutionPreview] = useState<RuleExecutionResult | null>(null);

  // Get rules for this account
  const accountRules = useMemo(() => {
    if (!account) return [];
    return rules.filter((r) => r.sourceAccountId === account.id);
  }, [rules, account]);

  // Get available target accounts (exclude source and already added targets)
  const availableTargets = useMemo(() => {
    if (!account) return [];
    const addedTargetIds = new Set(targets.map((t) => t.accountId));
    return accounts.filter(
      (a) => a.id !== account.id && !addedTargetIds.has(a.id)
    );
  }, [account, accounts, targets]);

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return targets.reduce((sum, t) => sum + t.percentage, 0);
  }, [targets]);

  const resetForm = useCallback(() => {
    setIsCreating(false);
    setDayOfWeek(1);
    setFrequency('weekly');
    setThresholdAmount('');
    setTargets([]);
    setSelectedTargetId('');
    setTargetPercentage('');
    setTargetAmount('');
    setAllocationMode('percentage');
    setError('');
    setExecutionPreview(null);
  }, []);

  const handleAddTarget = useCallback(() => {
    if (!selectedTargetId) return;
    
    if (allocationMode === 'percentage') {
      if (!targetPercentage) return;
      const percentage = parseFloat(targetPercentage);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        setError('Percentage must be between 0.01 and 100');
        return;
      }
      setTargets((prev) => [...prev, { accountId: selectedTargetId, percentage, mode: 'percentage' }]);
    } else {
      if (!targetAmount) return;
      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Amount must be a positive number');
        return;
      }
      setTargets((prev) => [...prev, { accountId: selectedTargetId, percentage: 0, amount, mode: 'amount' }]);
    }
    
    setSelectedTargetId('');
    setTargetPercentage('');
    setTargetAmount('');
    setError('');
  }, [selectedTargetId, targetPercentage, targetAmount, allocationMode]);

  const handleRemoveTarget = useCallback((accountId: string) => {
    setTargets((prev) => prev.filter((t) => t.accountId !== accountId));
  }, []);

  const handleCreateRule = useCallback(() => {
    if (!account) return;

    const threshold = parseFloat(thresholdAmount);
    if (isNaN(threshold) || threshold <= 0) {
      setError('Threshold must be a positive number');
      return;
    }

    if (targets.length === 0) {
      setError('At least one target account is required');
      return;
    }

    // Validate total percentage doesn't exceed 100% for percentage mode targets
    const percentageTargets = targets.filter(t => t.mode === 'percentage');
    const totalPercentageValue = percentageTargets.reduce((sum, t) => sum + t.percentage, 0);
    if (totalPercentageValue > 100) {
      setError('Total percentage cannot exceed 100%');
      return;
    }

    const result = onCreateRule({
      sourceAccountId: account.id,
      dayOfWeek,
      frequency,
      thresholdAmount: threshold,
      targets,
    });

    if (result.success) {
      resetForm();
    } else {
      setError(result.error || 'Failed to create rule');
    }
  }, [account, dayOfWeek, frequency, thresholdAmount, targets, onCreateRule, resetForm]);

  const handleExecuteRule = useCallback((ruleId: string) => {
    const result = onExecuteRule(ruleId);
    if (result) {
      setExecutionPreview(result);
    }
  }, [onExecuteRule]);

  const handleConfirmExecution = useCallback(() => {
    if (executionPreview && executionPreview.success) {
      onApplyRuleExecution(executionPreview);
      setExecutionPreview(null);
    }
  }, [executionPreview, onApplyRuleExecution]);

  if (!isOpen || !account) return null;

  // Execution preview view
  if (executionPreview) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setExecutionPreview(null)}
        title="Rule Execution Preview"
        size="lg"
      >
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              executionPreview.success
                ? 'bg-emerald-50 dark:bg-emerald-900/20'
                : 'bg-rose-50 dark:bg-rose-900/20'
            }`}
          >
            <p
              className={`font-medium ${
                executionPreview.success
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {executionPreview.message}
            </p>
          </div>

          {executionPreview.success && (
            <>
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <p className="text-sm text-rose-700 dark:text-rose-400">
                  <strong>Deduct from {account.name}:</strong>{' '}
                  -{formatCurrency(executionPreview.excessAmount)}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  New balance: {formatCurrency(account.amount - executionPreview.excessAmount)}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  Allocations:
                </h4>
                {executionPreview.allocations.map((allocation) => (
                  <div
                    key={allocation.accountId}
                    className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"
                  >
                    <span className="text-jet-black dark:text-white">
                      {allocation.accountName} ({allocation.percentage}%)
                    </span>
                    <div className="text-right">
                      <span className="text-emerald-600 font-medium">
                        +{formatCurrency(allocation.amount)}
                      </span>
                      <span className="text-slate-500 text-sm block">
                        New balance: {formatCurrency(allocation.newBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setExecutionPreview(null)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExecution}
              disabled={!executionPreview.success}
              fullWidth
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm Execution
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={`Allocation Rules - ${account.name}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Info */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
          <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
            📅 How Rules Work
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Rules run on your selected day based on your chosen frequency (weekly, fortnightly, monthly, or annually). 
            If the account balance exceeds the threshold, excess funds are automatically distributed to target
            accounts. You can allocate by <strong>percentage</strong> (e.g., 50% to Savings) or <strong>fixed amount</strong> (e.g., $100 to Emergency Fund).
          </p>
        </div>

        {/* Existing Rules */}
        {accountRules.length > 0 && !isCreating && (
          <div>
            <h4 className="font-medium text-jet-black dark:text-white mb-3">
              Active Rules
            </h4>
            <div className="space-y-3">
              {accountRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border ${
                    rule.isActive
                      ? 'bg-surface border-french-blue/30'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            rule.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                              : 'bg-slate-200 text-slate-500 dark:bg-slate-700'
                          }`}
                        >
                          {rule.isActive ? 'Active' : 'Paused'}
                        </span>
                        <span className="text-sm font-medium text-jet-black dark:text-white">
                          {RULE_FREQUENCY_LABELS[rule.frequency]} on {DAY_OF_WEEK_LABELS[rule.dayOfWeek]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        When balance exceeds {formatCurrency(rule.thresholdAmount)}
                      </p>
                      {rule.isActive && (
                        <p className="text-sm text-french-blue dark:text-fresh-sky mt-1">
                          <span className="font-medium">Next trigger:</span> {formatNextTriggerDate(rule)}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        {rule.targets.map((target) => {
                          const targetAcc = accounts.find(
                            (a) => a.id === target.accountId
                          );
                          return (
                            <p
                              key={target.accountId}
                              className="text-sm text-slate-600 dark:text-slate-400"
                            >
                              → {targetAcc?.name || 'Unknown'}: {
                                target.mode === 'amount' 
                                  ? `$${target.amount?.toFixed(2)}`
                                  : `${target.percentage}%`
                              }
                            </p>
                          );
                        })}
                      </div>
                      {rule.lastExecuted && (
                        <p className="text-xs text-slate-400 mt-2">
                          Last executed: {new Date(rule.lastExecuted).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExecuteRule(rule.id)}
                        className="px-2 py-1 text-xs text-french-blue hover:bg-french-blue/10 rounded"
                        title="Execute now"
                      >
                        ▶ Run
                      </button>
                      <button
                        onClick={() => onToggleRule(rule.id)}
                        className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        {rule.isActive ? 'Pause' : 'Enable'}
                      </button>
                      <button
                        onClick={() => onDeleteRule(rule.id)}
                        className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Rule Form */}
        {isCreating ? (
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium text-jet-black dark:text-white">
              Create New Rule
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Frequency"
                options={RULE_FREQUENCY_OPTIONS.map(({ value, label }) => ({
                  value,
                  label,
                }))}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RuleFrequency)}
              />
              <Select
                label="Day of Week"
                options={Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
                value={dayOfWeek.toString()}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value) as DayOfWeek)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Threshold Amount"
                type="number"
                value={thresholdAmount}
                onChange={(e) => setThresholdAmount(e.target.value)}
                placeholder="e.g., 1000"
                min={0}
              />
            </div>

            {/* Add Targets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Accounts
              </label>

              {/* Allocation Mode Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAllocationMode('percentage')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    allocationMode === 'percentage'
                      ? 'bg-french-blue text-white border-french-blue'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setAllocationMode('amount')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    allocationMode === 'amount'
                      ? 'bg-french-blue text-white border-french-blue'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  Fixed Amount ($)
                </button>
              </div>
              
              {targets.length > 0 && (
                <div className="space-y-2 mb-3">
                  {targets.map((target) => {
                    const targetAcc = accounts.find((a) => a.id === target.accountId);
                    return (
                      <div
                        key={target.accountId}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded border"
                      >
                        <span className="text-sm flex items-center gap-1">
                          {(() => {
                            const IconComponent = getLucideIcon(targetAcc?.icon || 'money');
                            return <IconComponent className="w-4 h-4" />;
                          })()}
                          {targetAcc?.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {target.mode === 'percentage' 
                              ? `${target.percentage}%` 
                              : `$${target.amount?.toFixed(2)}`}
                          </span>
                          <button
                            onClick={() => handleRemoveTarget(target.accountId)}
                            className="text-rose-500 hover:bg-rose-100 rounded p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {/* Show summary for percentage mode */}
                  {targets.some(t => t.mode === 'percentage') && (
                    <p
                      className={`text-sm font-medium ${
                        totalPercentage <= 100
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      Total percentage: {totalPercentage}%{' '}
                      {totalPercentage > 100 && '(cannot exceed 100%)'}
                    </p>
                  )}
                  {/* Show summary for amount mode */}
                  {targets.some(t => t.mode === 'amount') && (
                    <p className="text-sm font-medium text-emerald-600">
                      Total fixed amount: ${targets.filter(t => t.mode === 'amount').reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {availableTargets.length > 0 && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      options={availableTargets.map((a) => ({
                        value: a.id,
                        label: a.name,
                      }))}
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      placeholder="Select target account"
                    />
                  </div>
                  <div className="w-24">
                    {allocationMode === 'percentage' ? (
                      <Input
                        type="number"
                        value={targetPercentage}
                        onChange={(e) => setTargetPercentage(e.target.value)}
                        placeholder="%"
                        min={0.01}
                        max={100}
                        step={0.01}
                      />
                    ) : (
                      <Input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        placeholder="$"
                        min={0.01}
                        step={0.01}
                      />
                    )}
                  </div>
                  <Button
                    onClick={handleAddTarget}
                    disabled={!selectedTargetId || (allocationMode === 'percentage' ? !targetPercentage : !targetAmount)}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-rose-500">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={resetForm} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleCreateRule} fullWidth>
                Create Rule
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsCreating(true)} fullWidth>
            + Create New Rule
          </Button>
        )}

        <div className="flex justify-end pt-4 sticky bottom-0 bg-surface pb-1">
          <Button
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
