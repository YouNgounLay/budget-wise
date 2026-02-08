'use client';

/**
 * Rules Page
 * Displays all account allocation rules in a dedicated view
 */

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/app/components/layout';
import { Card, Button, Modal } from '@/app/components/shared';
import { useAccounts } from '@/app/context';
import { useRules } from '@/app/context';
import { AccountRule, DAY_OF_WEEK_LABELS, DayOfWeek, RuleExecutionResult, AllocationTarget, RuleFrequency, RULE_FREQUENCY_LABELS, RULE_FREQUENCY_OPTIONS, formatNextTriggerDate } from '@/app/types/rule';
import { Account } from '@/app/types/account';
import { formatCurrency } from '@/app/utils/helpers';

export default function RulesPage() {
  const { state: accountState, updateAccount, updateAccountsFromDeposit } = useAccounts();
  const accounts = accountState.accounts;
  const { state: ruleState, deleteRule, toggleRuleActive, executeRule, applyRuleExecution, createRule } = useRules();
  const rules = ruleState.rules;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [executionResult, setExecutionResult] = useState<RuleExecutionResult | null>(null);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  
  // Form state for creating new rules
  const [formDayOfWeek, setFormDayOfWeek] = useState<DayOfWeek>(0);
  const [formFrequency, setFormFrequency] = useState<RuleFrequency>('weekly');
  const [formThreshold, setFormThreshold] = useState<string>('');
  const [formTargets, setFormTargets] = useState<AllocationTarget[]>([]);

  // Group rules by account
  const rulesByAccount = useMemo(() => {
    const grouped: Record<string, AccountRule[]> = {};
    rules.forEach((rule) => {
      if (!grouped[rule.sourceAccountId]) {
        grouped[rule.sourceAccountId] = [];
      }
      grouped[rule.sourceAccountId].push(rule);
    });
    return grouped;
  }, [rules]);

  const getAccountById = (id: string): Account | undefined => {
    return accounts.find((a) => a.id === id);
  };

  const handleExecuteRule = (rule: AccountRule) => {
    const result = executeRule(rule.id, accounts);
    if (result && result.excessAmount > 0) {
      setExecutionResult(result);
      setIsExecuteModalOpen(true);
    }
  };

  const handleApplyExecution = () => {
    if (executionResult) {
      const updatedAccounts = applyRuleExecution(executionResult, accounts);
      updateAccountsFromDeposit(updatedAccounts);
      setExecutionResult(null);
      setIsExecuteModalOpen(false);
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      deleteRule(ruleId);
    }
  };

  const resetForm = () => {
    setSelectedAccountId('');
    setFormDayOfWeek(0);
    setFormFrequency('weekly');
    setFormThreshold('');
    setFormTargets([]);
  };

  const handleCreateRule = () => {
    if (!selectedAccountId || !formThreshold || formTargets.length === 0) return;
    
    const totalPercentage = formTargets.reduce((sum, t) => sum + t.percentage, 0);
    if (totalPercentage !== 100) {
      alert('Percentages must sum to 100%');
      return;
    }

    createRule({
      sourceAccountId: selectedAccountId,
      dayOfWeek: formDayOfWeek,
      frequency: formFrequency,
      thresholdAmount: parseFloat(formThreshold),
      targets: formTargets,
    });

    resetForm();
    setIsCreateModalOpen(false);
  };

  const addTarget = () => {
    const availableAccounts = accounts.filter(
      (a) => a.id !== selectedAccountId && !formTargets.some((t) => t.accountId === a.id)
    );
    if (availableAccounts.length > 0) {
      setFormTargets([...formTargets, { accountId: availableAccounts[0].id, percentage: 0 }]);
    }
  };

  const removeTarget = (index: number) => {
    setFormTargets(formTargets.filter((_, i) => i !== index));
  };

  const updateTarget = (index: number, field: 'accountId' | 'percentage', value: string | number) => {
    const updated = [...formTargets];
    if (field === 'accountId') {
      updated[index].accountId = value as string;
    } else {
      updated[index].percentage = Number(value);
    }
    setFormTargets(updated);
  };

  const totalPercentage = formTargets.reduce((sum, t) => sum + t.percentage, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Rules</h1>
            <p className="text-muted mt-1">
              Manage automatic fund allocation rules for your accounts
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            + Create Rule
          </Button>
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-4 flex justify-center text-slate-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Rules Yet</h3>
            <p className="text-muted mb-4">
              Create allocation rules to automatically distribute excess funds
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Your First Rule
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(rulesByAccount).map(([accountId, accountRules]) => {
              const account = getAccountById(accountId);
              if (!account) return null;

              return (
                <Card key={accountId} padding="none" className="overflow-hidden">
                  {/* Account Header */}
                  <div 
                    className="px-4 py-3 border-b border-border flex items-center gap-3"
                    style={{ 
                      backgroundColor: `color-mix(in srgb, ${account.color === 'custom' ? account.customColor : ''} 10%, transparent)`,
                      borderLeftWidth: '4px',
                      borderLeftColor: account.color === 'custom' ? account.customColor : `var(--${account.color})`
                    }}
                  >
                    <span className="text-2xl">
                      {account.icon === 'custom' ? account.customEmoji : account.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">{account.name}</h3>
                      <p className="text-sm text-muted">
                        Current Balance: {formatCurrency(account.amount)}
                      </p>
                    </div>
                  </div>

                  {/* Rules for this account */}
                  <div className="divide-y divide-border">
                    {accountRules.map((rule) => (
                      <div key={rule.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Rule trigger info */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                rule.isActive 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-sm text-muted">
                                <strong>{RULE_FREQUENCY_LABELS[rule.frequency]}</strong> on <strong>{DAY_OF_WEEK_LABELS[rule.dayOfWeek]}</strong>
                              </span>
                            </div>
                            
                            {/* Next trigger date */}
                            {rule.isActive && (
                              <p className="text-sm text-french-blue dark:text-fresh-sky mb-2">
                                <span className="font-medium">Next trigger:</span> {formatNextTriggerDate(rule)}
                              </p>
                            )}

                            {/* Threshold */}
                            <p className="text-sm text-foreground mb-2">
                              When balance exceeds{' '}
                              <span className="font-semibold text-french-blue">
                                {formatCurrency(rule.thresholdAmount)}
                              </span>
                              , distribute excess to:
                            </p>

                            {/* Allocation targets */}
                            <div className="flex flex-wrap gap-2">
                              {rule.targets.map((target) => {
                                const targetAccount = getAccountById(target.accountId);
                                return (
                                  <span
                                    key={target.accountId}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm"
                                  >
                                    <span>{targetAccount?.name || 'Unknown'}</span>
                                    <span className="font-medium text-french-blue">
                                      {target.percentage}%
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleExecuteRule(rule)}
                              className="p-2 rounded-lg hover:bg-french-blue/10 text-french-blue transition-colors"
                              title="Execute rule now"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleRuleActive(rule.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                rule.isActive 
                                  ? 'hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600' 
                                  : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600'
                              }`}
                              title={rule.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {rule.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
                              title="Delete rule"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          resetForm();
          setIsCreateModalOpen(false);
        }}
        title="Create Allocation Rule"
      >
        <div className="space-y-4">
          {/* Source Account */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Source Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(e.target.value);
                setFormTargets([]);
              }}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({formatCurrency(account.amount)})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Frequency
            </label>
            <select
              value={formFrequency}
              onChange={(e) => setFormFrequency(e.target.value as RuleFrequency)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground"
            >
              {RULE_FREQUENCY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Trigger Day
            </label>
            <select
              value={formDayOfWeek}
              onChange={(e) => setFormDayOfWeek(Number(e.target.value) as DayOfWeek)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground"
            >
              {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Threshold Amount
            </label>
            <input
              type="number"
              value={formThreshold}
              onChange={(e) => setFormThreshold(e.target.value)}
              placeholder="e.g. 1000"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground"
            />
            <p className="text-xs text-muted mt-1">
              Excess funds above this amount will be distributed
            </p>
          </div>

          {/* Allocation Targets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                Allocation Targets
              </label>
              <button
                type="button"
                onClick={addTarget}
                disabled={!selectedAccountId || formTargets.length >= accounts.length - 1}
                className="text-sm text-french-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Target
              </button>
            </div>

            {formTargets.length === 0 ? (
              <p className="text-sm text-muted py-2">
                No targets added yet. Click &quot;Add Target&quot; to add allocation destinations.
              </p>
            ) : (
              <div className="space-y-2">
                {formTargets.map((target, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={target.accountId}
                      onChange={(e) => updateTarget(index, 'accountId', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm"
                    >
                      {accounts
                        .filter((a) => a.id !== selectedAccountId)
                        .map((account) => (
                          <option 
                            key={account.id} 
                            value={account.id}
                            disabled={formTargets.some((t, i) => i !== index && t.accountId === account.id)}
                          >
                            {account.name}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      value={target.percentage}
                      onChange={(e) => updateTarget(index, 'percentage', e.target.value)}
                      min="0"
                      max="100"
                      className="w-20 px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm"
                    />
                    <span className="text-sm text-muted">%</span>
                    <button
                      type="button"
                      onClick={() => removeTarget(index)}
                      className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <p className={`text-sm ${totalPercentage === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  Total: {totalPercentage}% {totalPercentage !== 100 && '(must equal 100%)'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRule}
              disabled={!selectedAccountId || !formThreshold || formTargets.length === 0 || totalPercentage !== 100}
            >
              Create Rule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Execute Confirmation Modal */}
      <Modal
        isOpen={isExecuteModalOpen}
        onClose={() => {
          setExecutionResult(null);
          setIsExecuteModalOpen(false);
        }}
        title="Confirm Rule Execution"
      >
        {executionResult && (
          <div className="space-y-4">
            <p className="text-foreground">
              This will transfer{' '}
              <span className="font-semibold text-french-blue">
                {formatCurrency(executionResult.excessAmount)}
              </span>{' '}
              from{' '}
              <span className="font-semibold">
                {getAccountById(executionResult.sourceAccountId)?.name}
              </span>
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Allocations:</p>
              {executionResult.allocations.map((alloc) => (
                <div
                  key={alloc.accountId}
                  className="flex justify-between items-center px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <span>{getAccountById(alloc.accountId)?.name}</span>
                  <span className="font-medium text-french-blue">
                    {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setExecutionResult(null);
                  setIsExecuteModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleApplyExecution}>
                Apply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
