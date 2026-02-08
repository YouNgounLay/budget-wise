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
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  Chain,
  CreateChainDTO,
  UpdateChainDTO,
  ChainAccountConfig,
  ChainDistributionMode,
} from '@/app/types/chain';
import { getAllChains, saveAllChains } from '@/app/services/chainService';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

const DEFAULT_LIMIT = 2000;
const DEFAULT_PERCENTAGE = 0;

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
    limit?: number,
    percentage?: number
  ) => Chain | null;
  removeAccountFromChain: (chainId: string, accountId: string) => Chain | null;
  reorderChainAccounts: (chainId: string, newOrder: string[]) => Chain | null;
  updateAccountLimitInChain: (
    chainId: string,
    accountId: string,
    newLimit: number
  ) => Chain | null;
  updateAccountPercentageInChain: (
    chainId: string,
    accountId: string,
    newPercentage: number
  ) => Chain | null;
  setOverflowAccount: (chainId: string, accountId: string | null) => Chain | null;
  toggleDistributionMode: (chainId: string) => Chain | null;
  setDistributionMode: (chainId: string, mode: ChainDistributionMode) => Chain | null;
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load chains from storage on mount
  useEffect(() => {
    const chains = getAllChains();
    dispatch({ type: 'SET_CHAINS', payload: chains });
  }, []);

  // Debounced save to storage whenever chains change
  useEffect(() => {
    if (state.isLoading) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      saveAllChains(state.chains);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.chains, state.isLoading]);

  const createChain = useCallback((data: CreateChainDTO): Chain => {
    const timestamp = getCurrentTimestamp();
    const newChain: Chain = {
      id: generateId(),
      name: data.name,
      description: data.description,
      accounts: [],
      overflowAccountId: null,
      defaultLimit: data.defaultLimit ?? DEFAULT_LIMIT,
      distributionMode: 'sequential',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    dispatch({ type: 'ADD_CHAIN', payload: newChain });
    return newChain;
  }, []);

  const updateChain = useCallback((id: string, data: UpdateChainDTO): Chain | null => {
    const chain = state.chains.find((c) => c.id === id);
    if (!chain) return null;

    const updatedChain: Chain = {
      ...chain,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };
    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const deleteChain = useCallback((id: string): boolean => {
    const exists = state.chains.some((c) => c.id === id);
    if (!exists) return false;

    dispatch({ type: 'DELETE_CHAIN', payload: id });
    return true;
  }, [state.chains]);

  const getChainById = useCallback((id: string): Chain | undefined => {
    return state.chains.find((c) => c.id === id);
  }, [state.chains]);

  const addAccountToChain = useCallback((
    chainId: string,
    accountId: string,
    limit?: number,
    percentage?: number
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    // Check if account already exists or is the overflow account
    if (
      chain.accounts.some((acc) => acc.accountId === accountId) ||
      chain.overflowAccountId === accountId
    ) {
      return null;
    }

    const newAccountConfig: ChainAccountConfig = {
      accountId,
      limit: limit ?? chain.defaultLimit,
      percentage: percentage ?? DEFAULT_PERCENTAGE,
    };

    const updatedChain: Chain = {
      ...chain,
      accounts: [...chain.accounts, newAccountConfig],
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const removeAccountFromChain = useCallback((
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
  }, [state.chains]);

  const reorderChainAccounts = useCallback((
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
  }, [state.chains]);

  const updateAccountLimitInChain = useCallback((
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
  }, [state.chains]);

  const setOverflowAccount = useCallback((
    chainId: string,
    accountId: string | null
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    // If setting an account, ensure it's not already in the chain's regular accounts
    if (accountId && chain.accounts.some((acc) => acc.accountId === accountId)) {
      return null;
    }

    const updatedChain: Chain = {
      ...chain,
      overflowAccountId: accountId,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const updateAccountPercentageInChain = useCallback((
    chainId: string,
    accountId: string,
    newPercentage: number
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    const updatedAccounts = chain.accounts.map((acc) =>
      acc.accountId === accountId ? { ...acc, percentage: newPercentage } : acc
    );

    const updatedChain: Chain = {
      ...chain,
      accounts: updatedAccounts,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const toggleDistributionMode = useCallback((chainId: string): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    const newMode: ChainDistributionMode = 
      chain.distributionMode === 'sequential' ? 'percentage' : 'sequential';

    const updatedChain: Chain = {
      ...chain,
      distributionMode: newMode,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const setDistributionMode = useCallback((
    chainId: string,
    mode: ChainDistributionMode
  ): Chain | null => {
    const chain = state.chains.find((c) => c.id === chainId);
    if (!chain) return null;

    const updatedChain: Chain = {
      ...chain,
      distributionMode: mode,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_CHAIN', payload: updatedChain });
    return updatedChain;
  }, [state.chains]);

  const contextValue = useMemo(() => ({
    state,
    createChain,
    updateChain,
    deleteChain,
    getChainById,
    addAccountToChain,
    removeAccountFromChain,
    reorderChainAccounts,
    updateAccountLimitInChain,
    updateAccountPercentageInChain,
    setOverflowAccount,
    toggleDistributionMode,
    setDistributionMode,
  }), [
    state,
    createChain,
    updateChain,
    deleteChain,
    getChainById,
    addAccountToChain,
    removeAccountFromChain,
    reorderChainAccounts,
    updateAccountLimitInChain,
    updateAccountPercentageInChain,
    setOverflowAccount,
    toggleDistributionMode,
    setDistributionMode,
  ]);

  return (
    <ChainContext.Provider value={contextValue}>
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
