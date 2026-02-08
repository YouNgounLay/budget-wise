'use client';

/**
 * Accounts Page
 * Dedicated page for managing accounts
 */

import React, { useState, useCallback } from 'react';
import { MainLayout } from '../components/layout';
import { Button } from '../components/shared';
import {
  AccountList,
  AccountForm,
  AccountRulesModal,
  TransactionModal,
} from '../components/account';
import { useAccounts } from '../context/AccountContext';
import { useRules } from '../context/RuleContext';
import { Account, CreateAccountDTO } from '../types/account';
import { CreateAccountRuleDTO, RuleExecutionResult } from '../types/rule';
import { formatCurrency } from '../utils/helpers';

export default function AccountsPage() {
  const {
    state: accountState,
    createAccount,
    updateAccount,
    deleteAccount,
    depositToAccount,
    withdrawFromAccount,
    updateAccountsFromDeposit,
  } = useAccounts();
  
  const {
    state: ruleState,
    createRule,
    deleteRule,
    toggleRuleActive,
    executeRule,
    applyRuleExecution,
  } = useRules();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [transactionAccount, setTransactionAccount] = useState<Account | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [rulesAccount, setRulesAccount] = useState<Account | null>(null);

  // Calculate stats
  const totalBalance = accountState.accounts.reduce((sum, acc) => sum + acc.amount, 0);

  // Handlers
  const handleCreate = (data: CreateAccountDTO) => {
    createAccount(data);
    setIsFormOpen(false);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };

  const handleUpdate = (data: CreateAccountDTO) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
    }
    setEditingAccount(undefined);
    setIsFormOpen(false);
  };

  const handleDelete = (account: Account) => {
    if (confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
      deleteAccount(account.id);
    }
  };

  const handleDeposit = (account: Account) => {
    setTransactionAccount(account);
    setTransactionType('deposit');
  };

  const handleWithdraw = (account: Account) => {
    setTransactionAccount(account);
    setTransactionType('withdraw');
  };

  const handleTransaction = (accountId: string, amount: number) => {
    if (transactionType === 'deposit') {
      depositToAccount(accountId, amount);
    } else {
      withdrawFromAccount(accountId, amount);
    }
  };

  const handleManageRules = (account: Account) => {
    setRulesAccount(account);
  };

  const handleCreateRule = useCallback((data: CreateAccountRuleDTO) => {
    return createRule(data);
  }, [createRule]);

  const handleDeleteRule = useCallback((id: string) => {
    deleteRule(id);
  }, [deleteRule]);

  const handleToggleRule = useCallback((id: string) => {
    toggleRuleActive(id);
  }, [toggleRuleActive]);

  const handleExecuteRule = useCallback((ruleId: string): RuleExecutionResult | null => {
    return executeRule(ruleId, accountState.accounts);
  }, [executeRule, accountState.accounts]);

  const handleApplyRuleExecution = useCallback((result: RuleExecutionResult) => {
    const updatedAccounts = applyRuleExecution(result, accountState.accounts);
    updateAccountsFromDeposit(updatedAccounts);
  }, [applyRuleExecution, accountState.accounts, updateAccountsFromDeposit]);

  if (accountState.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading accounts...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jet-black dark:text-white">
              Accounts
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage your budget accounts
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Account</Button>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-6 p-4 bg-surface rounded-xl border border-border">
          <div>
            <p className="text-sm text-muted">
              Total Accounts
            </p>
            <p className="text-2xl font-bold text-foreground">
              {accountState.accounts.length}
            </p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <p className="text-sm text-muted">
              Combined Balance
            </p>
            <p className="text-2xl font-bold text-french-blue">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div>
            <p className="text-sm text-muted">
              Active Rules
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {ruleState.rules.filter((r) => r.isActive).length}
            </p>
          </div>
        </div>

        {/* Account list */}
        <AccountList
          accounts={accountState.accounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onManageRules={handleManageRules}
        />
      </div>

      {/* Account Form Modal */}
      <AccountForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAccount(undefined);
        }}
        onSubmit={editingAccount ? handleUpdate : handleCreate}
        account={editingAccount}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={!!transactionAccount}
        onClose={() => setTransactionAccount(null)}
        account={transactionAccount}
        type={transactionType}
        onSubmit={handleTransaction}
      />

      {/* Account Rules Modal */}
      <AccountRulesModal
        isOpen={!!rulesAccount}
        onClose={() => setRulesAccount(null)}
        account={rulesAccount}
        accounts={accountState.accounts}
        rules={ruleState.rules}
        onCreateRule={handleCreateRule}
        onDeleteRule={handleDeleteRule}
        onToggleRule={handleToggleRule}
        onExecuteRule={handleExecuteRule}
        onApplyRuleExecution={handleApplyRuleExecution}
      />
    </MainLayout>
  );
}
