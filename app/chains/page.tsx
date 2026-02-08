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
  ChainDepositModal,
  ChainEditModal,
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
    toggleBufferAccount,
    updateBufferAmount,
    toggleDistributionMode,
  } = useChains();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<Chain | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [depositChainId, setDepositChainId] = useState<string | null>(null);

  // Get live chain data from state
  const depositChain = depositChainId ? chainState.chains.find(c => c.id === depositChainId) || null : null;
  // Get live editing chain data from state
  const liveEditingChain = editingChain ? chainState.chains.find(c => c.id === editingChain.id) || null : null;

  // Handlers
  const handleCreate = () => {
    setEditingChain(null);
    setIsCreating(true);
    setIsEditModalOpen(true);
  };

  const handleEdit = (chain: Chain) => {
    setEditingChain(chain);
    setIsCreating(false);
    setIsEditModalOpen(true);
  };

  const handleSave = (data: CreateChainDTO) => {
    if (isCreating) {
      createChain(data);
    } else if (editingChain) {
      updateChain(editingChain.id, data);
    }
    setIsEditModalOpen(false);
    setEditingChain(null);
    setIsCreating(false);
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
    
    // Update buffer amount if there was buffer deposit
    if (result.bufferDeposit && depositChainId) {
      updateBufferAmount(depositChainId, result.bufferDeposit.newBufferBalance);
    }
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
          <Button onClick={handleCreate}>+ New Chain</Button>
        </div>

        {/* Info box */}
        <div className="p-4 bg-fresh-sky/10 border border-fresh-sky/30 rounded-xl">
          <h3 className="font-medium text-jet-black dark:text-white mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-fresh-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            How Chains Work
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
        />
      </div>

      {/* Chain Edit Modal (Combined form + account management) */}
      <ChainEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingChain(null);
          setIsCreating(false);
        }}
        chain={liveEditingChain}
        accounts={accountState.accounts}
        onSave={handleSave}
        onAddAccount={addAccountToChain}
        onRemoveAccount={removeAccountFromChain}
        onReorder={reorderChainAccounts}
        onUpdateLimit={updateAccountLimitInChain}
        onUpdatePercentage={updateAccountPercentageInChain}
        onToggleBuffer={toggleBufferAccount}
        onToggleDistributionMode={toggleDistributionMode}
        isCreating={isCreating}
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
