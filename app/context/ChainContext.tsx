'use client';

/**
 * Chain Context
 * Global state management for deposit/withdrawal chains
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  Chain,
  CreateChainDTO,
  UpdateChainDTO,
  ChainAccountConfig,
} from '@/app/types/chain';
import { getAllChains, saveAllChains } from '@/app/services/chainService';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

const DEFAULT_LIMIT = 2000;

// State type
interface ChainState {
  chains: Chain[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type ChainAction =
  | { type: 'SET_CHAINS'; payload: Chain[] }
  | { type: 'ADD_CHAIN'; payload: Chain }
  | { type: 'UPDATE_CHAIN'; payload: Chain }
  | { type: 'DELETE_CHAIN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context type
interface ChainContextType {
  state: ChainState;
  createChain: (data: CreateChainDTO) => Chain;
  updateChain: (id: string, data: UpdateChainDTO) => Chain | null;
  deleteChain: (id: string) => boolean;
  getChainById: (id: string) => Chain | undefined;
  addAccountToChain: (
    chainId: string,
    accountId: string,
    limit?: number
  ) => Chain | null;
  removeAccountFromChain: (chainId: string, accountId: string) => Chain | null;
  reorderChainAccounts: (chainId: string, newOrder: string[]) => Chain | null;
  updateAccountLimitInChain: (
    chainId: string,
    accountId: string,
    newLimit: number
  ) => Chain | null;
}

// Initial state
const initialState: ChainState = {
  chains: [],
  isLoading: true,
  error: null,
};

// Reducer
function chainReducer(state: ChainState, action: ChainAction): ChainState {
  switch (action.type) {
    case 'SET_CHAINS':
      return { ...state, chains: action.payload, isLoading: false };
    case 'ADD_CHAIN':
      return { ...state, chains: [...state.chains, action.payload] };
    case 'UPDATE_CHAIN':
      return {
        ...state,
        chains: state.chains.map((chain) =>
          chain.id === action.payload.id ? action.payload : chain
        ),
      };
    case 'DELETE_CHAIN':
      return {
        ...state,
        chains: state.chains.filter((chain) => chain.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create context
const ChainContext = createContext<ChainContextType | undefined>(undefined);

// Provider component
export function ChainProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chainReducer, initialState);

  // Load chains from storage on mount
  useEffect(() => {
    const chains = getAllChains();
    dispatch({ type: 'SET_CHAINS', payload: chains });
  }, []);

  // Save chains to storage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      saveAllChains(state.chains);
    }
  }, [state.chains, state.isLoading]);

  const createChain = (data: CreateChainDTO): Chain => {
    const timestamp = getCurrentTimestamp();
    const newChain: Chain = {
      id: generateId(),
      name: data.name,
      description: data.description,
      accounts: [],
      defaultLimit: data.defaultLimit ?? DEFAULT_LIMIT,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    dispatch({ type: 'ADD_CHAIN', payload: newChain });
    return newChain;
  };

  const updateChain = (id: string, data: UpdateChainDTO): Chain | null => {
    const chain = state.chains.find((c) => c.id === id);
    if (!chain) return null;

    const updatedChain: Chain = {
      ...chain,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };
    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  };

  const deleteChain = (id: string): boolean => {
    const exists = state.chains.some((c) => c.id === id);
    if (!exists) return false;

    dispatch({ type: 'DELETE_CHAIN', payload: id });
    return true;
  };

  const getChainById = (id: string): Chain | undefined => {
    return state.chains.find((c) => c.id === id);
  };

  const addAccountToChain = (
    chainId: string,
    accountId: string,
    limit?: number
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    // Check if account already exists
    if (chain.accounts.some((acc) => acc.accountId === accountId)) {
      return null;
    }

    const newAccountConfig: ChainAccountConfig = {
      accountId,
      limit: limit ?? chain.defaultLimit,
    };

    const updatedChain: Chain = {
      ...chain,
      accounts: [...chain.accounts, newAccountConfig],
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  };

  const removeAccountFromChain = (
    chainId: string,
    accountId: string
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    const updatedAccounts = chain.accounts.filter(
      (acc) => acc.accountId !== accountId
    );

    if (updatedAccounts.length === chain.accounts.length) return null;

    const updatedChain: Chain = {
      ...chain,
      accounts: updatedAccounts,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  };

  const reorderChainAccounts = (
    chainId: string,
    newOrder: string[]
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    // Validate all IDs exist
    const currentIds = new Set(chain.accounts.map((acc) => acc.accountId));
    if (
      newOrder.length !== currentIds.size ||
      !newOrder.every((id) => currentIds.has(id))
    ) {
      return null;
    }

    const accountMap = new Map(
      chain.accounts.map((acc) => [acc.accountId, acc])
    );
    const reorderedAccounts = newOrder.map((id) => accountMap.get(id)!);

    const updatedChain: Chain = {
      ...chain,
      accounts: reorderedAccounts,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  };

  const updateAccountLimitInChain = (
    chainId: string,
    accountId: string,
    newLimit: number
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    const updatedAccounts = chain.accounts.map((acc) =>
      acc.accountId === accountId ? { ...acc, limit: newLimit } : acc
    );

    const updatedChain: Chain = {
      ...chain,
      accounts: updatedAccounts,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  };

  return (
    <ChainContext.Provider
      value={{
        state,
        createChain,
        updateChain,
        deleteChain,
        getChainById,
        addAccountToChain,
        removeAccountFromChain,
        reorderChainAccounts,
        updateAccountLimitInChain,
      }}
    >
      {children}
    </ChainContext.Provider>
  );
}

// Custom hook
export function useChains(): ChainContextType {
  const context = useContext(ChainContext);
  if (context === undefined) {
    throw new Error('useChains must be used within a ChainProvider');
  }
  return context;
}
