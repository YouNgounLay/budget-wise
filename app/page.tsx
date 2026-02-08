'use client';

/**
 * Dashboard Page
 * Main landing page showing overview of accounts and chains
 */

import React, { useState } from 'react';
import { MainLayout } from './components/layout';
import { Button, Card } from './components/shared';
import {
  AccountList,
  AccountForm,
  TransactionModal,
} from './components/account';
import {
  ChainList,
  ChainDepositModal,
  ChainEditModal,
} from './components/chain';
import { useAccounts } from './context/AccountContext';
import { useChains } from './context/ChainContext';
import { Account, CreateAccountDTO } from './types/account';
import { Chain, CreateChainDTO, DepositResult } from './types/chain';
import { applyDeposits } from './services/depositService';
import { formatCurrency } from './utils/helpers';


export default function Dashboard() {
  const { state: accountState, createAccount, updateAccount, deleteAccount, depositToAccount, withdrawFromAccount, updateAccountsFromDeposit } = useAccounts();
  const { state: chainState, createChain, updateChain, deleteChain, addAccountToChain, removeAccountFromChain, reorderChainAccounts, updateAccountLimitInChain, updateAccountPercentageInChain, toggleBufferAccount, updateBufferAmount, toggleDistributionMode } = useChains();

  // Account modals
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [transactionAccount, setTransactionAccount] = useState<Account | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');

  // Chain modals
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<Chain | undefined>();
  const [depositChainId, setDepositChainId] = useState<string | null>(null);

  // Get live chain data from state
  const depositChain = depositChainId ? chainState.chains.find(c => c.id === depositChainId) || null : null;

  // Calculate totals
  const totalBalance = accountState.accounts.reduce((sum, acc) => sum + acc.amount, 0);
  const totalAccounts = accountState.accounts.length;
  const totalChains = chainState.chains.length;

  // Account handlers
  const handleCreateAccount = (data: CreateAccountDTO) => {
    createAccount(data);
    setIsAccountFormOpen(false);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAccountFormOpen(true);
  };

  const handleUpdateAccount = (data: CreateAccountDTO) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
    }
    setEditingAccount(undefined);
    setIsAccountFormOpen(false);
  };

  const handleDeleteAccount = (account: Account) => {
    if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
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

  // Chain handlers
  const handleCreateChain = (data: CreateChainDTO) => {
    createChain(data);
    setIsChainModalOpen(false);
  };

  const handleEditChain = (chain: Chain) => {
    setEditingChain(chain);
    setIsChainModalOpen(true);
  };

  const handleUpdateChain = (data: CreateChainDTO) => {
    if (editingChain) {
      updateChain(editingChain.id, data);
    }
    setEditingChain(undefined);
    setIsChainModalOpen(false);
  };

  const handleCloseChainModal = () => {
    setIsChainModalOpen(false);
    setEditingChain(undefined);
  };

  const handleDeleteChain = (chain: Chain) => {
    if (confirm(`Are you sure you want to delete "${chain.name}"?`)) {
      deleteChain(chain.id);
    }
  };

  const handleChainDeposit = (result: DepositResult) => {
    const updatedAccounts = applyDeposits(result.deposits, accountState.accounts);
    updateAccountsFromDeposit(updatedAccounts);
    
    // Update buffer amount if there was a buffer deposit
    if (result.bufferDeposit) {
      updateBufferAmount(result.chainId, result.bufferDeposit.newBufferBalance);
    }
  };

  if (accountState.isLoading || chainState.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jet-black dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Overview of your budget accounts and chains
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-french-blue to-yale-blue text-white">
            <div className="text-sm opacity-80">Total Balance</div>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-500">Total Accounts</div>
            <div className="text-3xl font-bold text-jet-black dark:text-white">
              {totalAccounts}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-slate-500">Active Chains</div>
            <div className="text-3xl font-bold text-jet-black dark:text-white">
              {totalChains}
            </div>
          </Card>
        </div>

        {/* Accounts section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-jet-black dark:text-white">
              Your Accounts
            </h2>
            <Button onClick={() => setIsAccountFormOpen(true)}>
              + New Account
            </Button>
          </div>
          <AccountList
            accounts={accountState.accounts}
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        </section>

        {/* Chains section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-jet-black dark:text-white">
              Deposit Chains
            </h2>
            <Button onClick={() => setIsChainModalOpen(true)}>
              + New Chain
            </Button>
          </div>
          <ChainList
            chains={chainState.chains}
            accounts={accountState.accounts}
            onEdit={handleEditChain}
            onDelete={handleDeleteChain}
            onDeposit={(chain) => setDepositChainId(chain.id)}
          />
        </section>
      </div>

      {/* Account Form Modal */}
      <AccountForm
        isOpen={isAccountFormOpen}
        onClose={() => {
          setIsAccountFormOpen(false);
          setEditingAccount(undefined);
        }}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
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

      {/* Chain Edit Modal (combined form and account management) */}
      <ChainEditModal
        isOpen={isChainModalOpen}
        onClose={handleCloseChainModal}
        onSave={editingChain ? handleUpdateChain : handleCreateChain}
        chain={editingChain ?? null}
        accounts={accountState.accounts}
        onAddAccount={addAccountToChain}
        onRemoveAccount={removeAccountFromChain}
        onReorder={reorderChainAccounts}
        onUpdateLimit={updateAccountLimitInChain}
        onUpdatePercentage={updateAccountPercentageInChain}
        onToggleBuffer={toggleBufferAccount}
        onToggleDistributionMode={toggleDistributionMode}
        isCreating={!editingChain}
      />

      {/* Chain Deposit Modal */}
      <ChainDepositModal
        isOpen={!!depositChainId}
        onClose={() => setDepositChainId(null)}
        chain={depositChain}
        accounts={accountState.accounts}
        onConfirmDeposit={handleChainDeposit}
      />
    </MainLayout>
  );
}
