'use client';

/**
 * Account Context
 * Global state management for accounts
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
  Account,
  ACCOUNT_COLORS,
  ACCOUNT_ICONS,
  CreateAccountDTO,
  UpdateAccountDTO,
} from '@/app/types/account';
import {
  getAllAccounts,
  saveAllAccounts,
} from '@/app/services/accountService';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

// State type
interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type AccountAction =
  | { type: 'SET_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context type
interface AccountContextType {
  state: AccountState;
  createAccount: (data: CreateAccountDTO) => Account;
  updateAccount: (id: string, data: UpdateAccountDTO) => Account | null;
  deleteAccount: (id: string) => boolean;
  getAccountById: (id: string) => Account | undefined;
  depositToAccount: (id: string, amount: number) => Account | null;
  withdrawFromAccount: (id: string, amount: number) => Account | null;
  updateAccountsFromDeposit: (updatedAccounts: Account[]) => void;
}

// Initial state
const initialState: AccountState = {
  accounts: [],
  isLoading: true,
  error: null,
};

// Reducer
function accountReducer(
  state: AccountState,
  action: AccountAction
): AccountState {
  switch (action.type) {
    case 'SET_ACCOUNTS':
      return { ...state, accounts: action.payload, isLoading: false };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((acc) =>
          acc.id === action.payload.id ? action.payload : acc
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((acc) => acc.id !== action.payload),
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
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Provider component
export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load accounts from storage on mount
  useEffect(() => {
    const accounts = getAllAccounts();
    dispatch({ type: 'SET_ACCOUNTS', payload: accounts });
  }, []);

  // Debounced save to storage whenever accounts change
  useEffect(() => {
    if (state.isLoading) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      saveAllAccounts(state.accounts);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.accounts, state.isLoading]);

  const createAccount = useCallback((data: CreateAccountDTO): Account => {
    const timestamp = getCurrentTimestamp();
    const newAccount: Account = {
      id: generateId(),
      name: data.name,
      description: data.description,
      amount: data.amount,
      icon: data.icon,
      color: data.color,
      customColor: data.customColor,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
    return newAccount;
  }, []);

  const updateAccount = useCallback((
    id: string,
    data: UpdateAccountDTO
  ): Account | null => {
    const account = state.accounts.find((acc) => acc.id === id);
    if (!account) return null;

    const updatedAccount: Account = {
      ...account,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };
    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    return updatedAccount;
  }, [state.accounts]);

  const deleteAccount = useCallback((id: string): boolean => {
    const exists = state.accounts.some((acc) => acc.id === id);
    if (!exists) return false;

    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
    return true;
  }, [state.accounts]);

  const getAccountById = useCallback((id: string): Account | undefined => {
    return state.accounts.find((acc) => acc.id === id);
  }, [state.accounts]);

  const depositToAccount = useCallback((id: string, amount: number): Account | null => {
    if (amount <= 0) return null;
    const account = state.accounts.find((acc) => acc.id === id);
    if (!account) return null;

    const updatedAccount: Account = {
      ...account,
      amount: account.amount + amount,
      updatedAt: getCurrentTimestamp(),
    };
    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    return updatedAccount;
  }, [state.accounts]);

  const withdrawFromAccount = useCallback((id: string, amount: number): Account | null => {
    if (amount <= 0) return null;
    const account = state.accounts.find((acc) => acc.id === id);
    if (!account || account.amount < amount) return null;

    const updatedAccount: Account = {
      ...account,
      amount: account.amount - amount,
      updatedAt: getCurrentTimestamp(),
    };
    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
    return updatedAccount;
  }, [state.accounts]);

  const updateAccountsFromDeposit = useCallback((updatedAccounts: Account[]): void => {
    dispatch({ type: 'SET_ACCOUNTS', payload: updatedAccounts });
  }, []);

  const contextValue = useMemo(() => ({
    state,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    depositToAccount,
    withdrawFromAccount,
    updateAccountsFromDeposit,
  }), [
    state,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    depositToAccount,
    withdrawFromAccount,
    updateAccountsFromDeposit,
  ]);

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
}

// Custom hook
export function useAccounts(): AccountContextType {
  const context = useContext(AccountContext);

  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
