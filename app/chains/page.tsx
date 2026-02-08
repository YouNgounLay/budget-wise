'use client';

/**
 * Chains Page
 * Dedicated page for managing deposit/withdrawal chains
 */

import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Button } from '../components/shared';
import {
  ChainList,
  ChainForm,
  ChainDepositModal,
  ManageChainAccountsModal,
} from '../components/chain';
import { useAccounts } from '../context/AccountContext';
import { useChains } from '../context/ChainContext';
import { Chain, CreateChainDTO, DepositResult } from '../types/chain';
import { applyDeposits } from '../services/depositService';

export default function ChainsPage() {
  const { state: accountState, updateAccountsFromDeposit } = useAccounts();
  const {
    state: chainState,
    createChain,
    updateChain,
    deleteChain,
    addAccountToChain,
    removeAccountFromChain,
    reorderChainAccounts,
    updateAccountLimitInChain,
    updateAccountPercentageInChain,
    setOverflowAccount,
    toggleDistributionMode,
  } = useChains();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<Chain | undefined>();
  const [depositChainId, setDepositChainId] = useState<string | null>(null);
  const [managingChainId, setManagingChainId] = useState<string | null>(null);

  // Get live chain data from state
  const depositChain = depositChainId ? chainState.chains.find(c => c.id === depositChainId) || null : null;
  const managingChain = managingChainId ? chainState.chains.find(c => c.id === managingChainId) || null : null;

  // Handlers
  const handleCreate = (data: CreateChainDTO) => {
    createChain(data);
    setIsFormOpen(false);
  };

  const handleEdit = (chain: Chain) => {
    setEditingChain(chain);
    setIsFormOpen(true);
  };

  const handleUpdate = (data: CreateChainDTO) => {
    if (editingChain) {
      updateChain(editingChain.id, data);
    }
    setEditingChain(undefined);
    setIsFormOpen(false);
  };

  const handleDelete = (chain: Chain) => {
    if (
      confirm(
        `Are you sure you want to delete "${chain.name}"? This action cannot be undone.`
      )
    ) {
      deleteChain(chain.id);
    }
  };

  const handleChainDeposit = (result: DepositResult) => {
    const updatedAccounts = applyDeposits(result.deposits, accountState.accounts);
    updateAccountsFromDeposit(updatedAccounts);
  };

  if (chainState.isLoading || accountState.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading chains...</div>
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
              Deposit Chains
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Create and manage automated deposit chains
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>+ New Chain</Button>
        </div>

        {/* Info box */}
        <div className="p-4 bg-fresh-sky/10 border border-fresh-sky/30 rounded-xl">
          <h3 className="font-medium text-jet-black dark:text-white mb-2">
            💡 How Chains Work
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Deposit chains automatically distribute money across multiple accounts in order.
            When you deposit to a chain, funds fill each account until its limit is reached,
            then overflow to the next account. This helps you automate your savings strategy!
          </p>
        </div>

        {/* Chain list */}
        <ChainList
          chains={chainState.chains}
          accounts={accountState.accounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeposit={(chain) => setDepositChainId(chain.id)}
          onManageAccounts={(chain) => setManagingChainId(chain.id)}
        />
      </div>

      {/* Chain Form Modal */}
      <ChainForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingChain(undefined);
        }}
        onSubmit={editingChain ? handleUpdate : handleCreate}
        chain={editingChain}
      />

      {/* Chain Deposit Modal */}
      <ChainDepositModal
        isOpen={!!depositChainId}
        onClose={() => setDepositChainId(null)}
        chain={depositChain}
        accounts={accountState.accounts}
        onConfirmDeposit={handleChainDeposit}
      />

      {/* Manage Chain Accounts Modal */}
      <ManageChainAccountsModal
        isOpen={!!managingChainId}
        onClose={() => setManagingChainId(null)}
        chain={managingChain}
        accounts={accountState.accounts}
        onAddAccount={addAccountToChain}
        onRemoveAccount={removeAccountFromChain}
        onReorder={reorderChainAccounts}
        onUpdateLimit={updateAccountLimitInChain}
        onUpdatePercentage={updateAccountPercentageInChain}
        onSetOverflowAccount={setOverflowAccount}
        onToggleDistributionMode={toggleDistributionMode}
      />
    </MainLayout>
  );
}
