'use client';

/**
 * Transaction Context
 * Manages transaction state and provides CRUD operations
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Transaction,
  TransactionFilter,
  TransactionSummary,
  CreateTransactionDTO,
  TransactionStorage,
  YearlyTransactions,
} from '@/app/types/transaction';
import * as transactionService from '@/app/services/transactionService';

interface TransactionContextValue {
  state: TransactionStorage;
  selectedYear: number;
  selectedMonth: number | null;
  summary: TransactionSummary;
  createTransaction: (data: CreateTransactionDTO) => Transaction;
  deleteTransaction: (id: string, year: number, month: number) => boolean;
  deleteTransactionsForPeriod: (year: number, month?: number) => number;
  getFilteredTransactions: (filter: TransactionFilter) => Transaction[];
  getTransactionSummary: (filter: TransactionFilter) => TransactionSummary;
  getTransactionsForEntity: (entityId: string, entityType: 'account' | 'chain') => Transaction[];
  setSelectedYear: (year: number) => void;
  setSelectedMonth: (month: number | null) => void;
  refreshTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextValue | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [state, setState] = useState<TransactionStorage>({ years: {} });
  const [selectedYear, setSelectedYearState] = useState(currentYear);
  const [selectedMonth, setSelectedMonthState] = useState<number | null>(currentMonth);

  // Load transactions from storage
  const loadTransactions = useCallback(() => {
    try {
      const storage = transactionService.getAllTransactions();
      setState(storage);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Calculate summary for current selection
  const summary = useMemo((): TransactionSummary => {
    const yearData = state.years[selectedYear];
    if (!yearData) {
      return { totalDeposits: 0, totalWithdrawals: 0, netChange: 0, transactionCount: 0 };
    }

    let transactions: Transaction[] = [];
    if (selectedMonth) {
      transactions = yearData.months[selectedMonth] || [];
    } else {
      Object.values(yearData.months).forEach((monthTxns) => {
        transactions = [...transactions, ...(monthTxns || [])];
      });
    }

    return transactions.reduce(
      (acc, t) => ({
        totalDeposits: acc.totalDeposits + (t.type === 'deposit' ? t.amount : 0),
        totalWithdrawals: acc.totalWithdrawals + (t.type === 'withdraw' ? t.amount : 0),
        netChange: acc.netChange + (t.type === 'deposit' ? t.amount : -t.amount),
        transactionCount: acc.transactionCount + 1,
      }),
      { totalDeposits: 0, totalWithdrawals: 0, netChange: 0, transactionCount: 0 }
    );
  }, [state.years, selectedYear, selectedMonth]);

  const createTransaction = useCallback((data: CreateTransactionDTO): Transaction => {
    const transaction = transactionService.createTransaction(data);
    loadTransactions();
    return transaction;
  }, [loadTransactions]);

  const deleteTransaction = useCallback((id: string, year: number, month: number): boolean => {
    const storage = { ...state };
    if (!storage.years[year]?.months[month]) return false;

    const monthTxns = storage.years[year].months[month];
    const index = monthTxns.findIndex((t) => t.id === id);
    if (index === -1) return false;

    monthTxns.splice(index, 1);
    transactionService.saveAllTransactions(storage);
    loadTransactions();
    return true;
  }, [state, loadTransactions]);

  const deleteTransactionsForPeriod = useCallback((year: number, month?: number): number => {
    if (month) {
      const count = transactionService.deleteTransactionsForMonth(year, month);
      loadTransactions();
      return count;
    } else {
      const count = transactionService.deleteTransactionsForYear(year);
      loadTransactions();
      return count;
    }
  }, [loadTransactions]);

  const getFilteredTransactions = useCallback((filter: TransactionFilter): Transaction[] => {
    return transactionService.getFilteredTransactions(filter);
  }, []);

  const getTransactionSummary = useCallback((filter: TransactionFilter): TransactionSummary => {
    return transactionService.getTransactionSummary(filter);
  }, []);

  const getTransactionsForEntity = useCallback((
    entityId: string, 
    entityType: 'account' | 'chain'
  ): Transaction[] => {
    return transactionService.getTransactionsForEntity(entityId, entityType);
  }, []);

  const setSelectedYear = useCallback((year: number) => {
    setSelectedYearState(year);
  }, []);

  const setSelectedMonth = useCallback((month: number | null) => {
    setSelectedMonthState(month);
  }, []);

  const refreshTransactions = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  const value = useMemo(() => ({
    state,
    selectedYear,
    selectedMonth,
    summary,
    createTransaction,
    deleteTransaction,
    deleteTransactionsForPeriod,
    getFilteredTransactions,
    getTransactionSummary,
    getTransactionsForEntity,
    setSelectedYear,
    setSelectedMonth,
    refreshTransactions,
  }), [
    state,
    selectedYear,
    selectedMonth,
    summary,
    createTransaction,
    deleteTransaction,
    deleteTransactionsForPeriod,
    getFilteredTransactions,
    getTransactionSummary,
    getTransactionsForEntity,
    setSelectedYear,
    setSelectedMonth,
    refreshTransactions,
  ]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
