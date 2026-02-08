/**
 * Chain Service
 * Handles all operations for deposit/withdrawal chains
 */

import { Chain, CreateChainDTO, UpdateChainDTO, ChainAccountConfig } from '@/app/types/chain';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

const DEFAULT_LIMIT = 2000;

/**
 * Retrieves all chains from storage
 */
export function getAllChains(): Chain[] {
  return getFromStorage<Chain[]>(STORAGE_KEYS.CHAINS) || [];
}

/**
 * Retrieves a single chain by ID
 */
export function getChainById(id: string): Chain | null {
  const chains = getAllChains();
  return chains.find((chain) => chain.id === id) || null;
}

/**
 * Creates a new chain
 */
export function createChain(data: CreateChainDTO): Chain {
  const chains = getAllChains();
  const timestamp = getCurrentTimestamp();

  const newChain: Chain = {
    id: generateId(),
    name: data.name,
    description: data.description,
    accounts: [],
    hasBufferAccount: false,
    bufferAmount: 0,
    defaultLimit: data.defaultLimit ?? DEFAULT_LIMIT,
    distributionMode: 'sequential',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  chains.push(newChain);
  setToStorage(STORAGE_KEYS.CHAINS, chains);

  return newChain;
}

/**
 * Updates an existing chain
 */
export function updateChain(id: string, data: UpdateChainDTO): Chain | null {
  const chains = getAllChains();
  const index = chains.findIndex((chain) => chain.id === id);

  if (index === -1) return null;

  const updatedChain: Chain = {
    ...chains[index],
    ...data,
    updatedAt: getCurrentTimestamp(),
  };

  chains[index] = updatedChain;
  setToStorage(STORAGE_KEYS.CHAINS, chains);

  return updatedChain;
}

/**
 * Deletes a chain by ID
 */
export function deleteChain(id: string): boolean {
  const chains = getAllChains();
  const filteredChains = chains.filter((chain) => chain.id !== id);

  if (filteredChains.length === chains.length) return false;

  setToStorage(STORAGE_KEYS.CHAINS, filteredChains);
  return true;
}

/**
 * Adds an account to a chain (if not already present)
 */
export function addAccountToChain(
  chainId: string,
  accountId: string,
  limit?: number
): Chain | null {
  const chain = getChainById(chainId);
  if (!chain) return null;

  // Check if account already exists in chain
  const accountExists = chain.accounts.some(
    (acc) => acc.accountId === accountId
  );
  if (accountExists) return null;

  const newAccountConfig: ChainAccountConfig = {
    accountId,
    limit: limit ?? chain.defaultLimit,
    percentage: 0,
  };

  const updatedAccounts = [...chain.accounts, newAccountConfig];
  return updateChainAccounts(chainId, updatedAccounts);
}

/**
 * Removes an account from a chain
 */
export function removeAccountFromChain(
  chainId: string,
  accountId: string
): Chain | null {
  const chain = getChainById(chainId);
  if (!chain) return null;

  const updatedAccounts = chain.accounts.filter(
    (acc) => acc.accountId !== accountId
  );

  if (updatedAccounts.length === chain.accounts.length) return null;

  return updateChainAccounts(chainId, updatedAccounts);
}

/**
 * Reorders accounts in a chain
 */
export function reorderChainAccounts(
  chainId: string,
  newOrder: string[]
): Chain | null {
  const chain = getChainById(chainId);
  if (!chain) return null;

  // Validate that all account IDs exist in the chain
  const currentIds = new Set(chain.accounts.map((acc) => acc.accountId));
  const newIds = new Set(newOrder);

  if (
    currentIds.size !== newIds.size ||
    ![...currentIds].every((id) => newIds.has(id))
  ) {
    return null;
  }

  // Create new ordered accounts array
  const accountMap = new Map(
    chain.accounts.map((acc) => [acc.accountId, acc])
  );
  const reorderedAccounts = newOrder.map(
    (id) => accountMap.get(id)!
  );

  return updateChainAccounts(chainId, reorderedAccounts);
}

/**
 * Updates the account limit in a chain
 */
export function updateAccountLimitInChain(
  chainId: string,
  accountId: string,
  newLimit: number
): Chain | null {
  const chain = getChainById(chainId);
  if (!chain) return null;

  const updatedAccounts = chain.accounts.map((acc) =>
    acc.accountId === accountId ? { ...acc, limit: newLimit } : acc
  );

  return updateChainAccounts(chainId, updatedAccounts);
}

/**
 * Helper function to update chain accounts
 */
function updateChainAccounts(
  chainId: string,
  accounts: ChainAccountConfig[]
): Chain | null {
  const chains = getAllChains();
  const index = chains.findIndex((chain) => chain.id === chainId);

  if (index === -1) return null;

  chains[index] = {
    ...chains[index],
    accounts,
    updatedAt: getCurrentTimestamp(),
  };

  setToStorage(STORAGE_KEYS.CHAINS, chains);
  return chains[index];
}

/**
 * Toggles the buffer account for a chain
 */
export function toggleBufferAccount(chainId: string): Chain | null {
  const chains = getAllChains();
  const index = chains.findIndex((chain) => chain.id === chainId);

  if (index === -1) return null;

  const chain = chains[index];
  
  // Can only disable buffer if it has no funds
  if (chain.hasBufferAccount && chain.bufferAmount > 0) {
    return null; // Cannot disable buffer with funds in it
  }

  chains[index] = {
    ...chain,
    hasBufferAccount: !chain.hasBufferAccount,
    updatedAt: getCurrentTimestamp(),
  };

  setToStorage(STORAGE_KEYS.CHAINS, chains);
  return chains[index];
}

/**
 * Updates the buffer amount for a chain (used after deposits)
 */
export function updateBufferAmount(
  chainId: string,
  newAmount: number
): Chain | null {
  const chains = getAllChains();
  const index = chains.findIndex((chain) => chain.id === chainId);

  if (index === -1) return null;

  // Auto-enable buffer if receiving funds
  const shouldEnableBuffer = newAmount > 0;

  chains[index] = {
    ...chains[index],
    bufferAmount: newAmount,
    hasBufferAccount: shouldEnableBuffer || chains[index].hasBufferAccount,
    updatedAt: getCurrentTimestamp(),
  };

  setToStorage(STORAGE_KEYS.CHAINS, chains);
  return chains[index];
}

/**
 * Withdraws from buffer account
 */
export function withdrawFromBuffer(
  chainId: string,
  amount: number
): { success: boolean; chain: Chain | null; withdrawnAmount: number } {
  const chains = getAllChains();
  const index = chains.findIndex((chain) => chain.id === chainId);

  if (index === -1) return { success: false, chain: null, withdrawnAmount: 0 };

  const chain = chains[index];
  const withdrawnAmount = Math.min(amount, chain.bufferAmount);
  const newBufferAmount = chain.bufferAmount - withdrawnAmount;

  chains[index] = {
    ...chain,
    bufferAmount: newBufferAmount,
    updatedAt: getCurrentTimestamp(),
  };

  setToStorage(STORAGE_KEYS.CHAINS, chains);
  return { success: true, chain: chains[index], withdrawnAmount };
}

/**
 * Saves all chains (used by context)
 */
export function saveAllChains(chains: Chain[]): void {
  setToStorage(STORAGE_KEYS.CHAINS, chains);
}
