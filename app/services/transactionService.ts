/**
 * Transaction Service
 * Handles all operations for transaction tracking
 * Transactions are stored hierarchically by Year > Month
 */

import {
  Transaction,
  TransactionStorage,
  YearlyTransactions,
  CreateTransactionDTO,
  TransactionFilter,
  TransactionSummary,
} from '@/app/types/transaction';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

/**
 * Retrieves all transactions from storage
 */
export function getAllTransactions(): TransactionStorage {
  return getFromStorage<TransactionStorage>(STORAGE_KEYS.TRANSACTIONS) || { years: {} };
}

/**
 * Saves all transactions to storage
 */
export function saveAllTransactions(storage: TransactionStorage): boolean {
  return setToStorage(STORAGE_KEYS.TRANSACTIONS, storage);
}

/**
 * Creates a new transaction record
 */
export function createTransaction(data: CreateTransactionDTO): Transaction {
  const storage = getAllTransactions();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  const transaction: Transaction = {
    id: generateId(),
    type: data.type,
    entityType: data.entityType,
    entityId: data.entityId,
    entityName: data.entityName,
    amount: data.amount,
    balanceAfter: data.balanceAfter,
    description: data.description,
    tagIds: data.tagIds || [],
    createdAt: getCurrentTimestamp(),
  };

  // Initialize year if needed
  if (!storage.years[year]) {
    storage.years[year] = { year, months: {} };
  }

  // Initialize month if needed
  if (!storage.years[year].months[month]) {
    storage.years[year].months[month] = [];
  }

  // Add transaction to the appropriate month
  storage.years[year].months[month].push(transaction);

  saveAllTransactions(storage);
  return transaction;
}

/**
 * Gets transactions for a specific year
 */
export function getTransactionsForYear(year: number): Transaction[] {
  const storage = getAllTransactions();
  const yearData = storage.years[year];
  
  if (!yearData) return [];

  const transactions: Transaction[] = [];
  Object.values(yearData.months).forEach(monthTransactions => {
    transactions.push(...monthTransactions);
  });

  return transactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Gets transactions for a specific month
 */
export function getTransactionsForMonth(year: number, month: number): Transaction[] {
  const storage = getAllTransactions();
  const yearData = storage.years[year];
  
  if (!yearData || !yearData.months[month]) return [];

  return [...yearData.months[month]].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Gets transactions with filters applied
 */
export function getFilteredTransactions(filter: TransactionFilter): Transaction[] {
  const storage = getAllTransactions();
  let transactions: Transaction[] = [];

  // Get transactions from relevant years/months
  if (filter.year) {
    if (filter.month) {
      transactions = getTransactionsForMonth(filter.year, filter.month);
    } else {
      transactions = getTransactionsForYear(filter.year);
    }
  } else {
    // Get all transactions
    Object.values(storage.years).forEach(yearData => {
      Object.values(yearData.months).forEach(monthTransactions => {
        transactions.push(...monthTransactions);
      });
    });
  }

  // Apply additional filters
  if (filter.type) {
    transactions = transactions.filter(t => t.type === filter.type);
  }

  if (filter.entityType) {
    transactions = transactions.filter(t => t.entityType === filter.entityType);
  }

  if (filter.entityId) {
    transactions = transactions.filter(t => t.entityId === filter.entityId);
  }

  if (filter.tagIds && filter.tagIds.length > 0) {
    transactions = transactions.filter(t => 
      filter.tagIds!.some(tagId => t.tagIds.includes(tagId))
    );
  }

  if (filter.startDate) {
    const start = new Date(filter.startDate).getTime();
    transactions = transactions.filter(t => new Date(t.createdAt).getTime() >= start);
  }

  if (filter.endDate) {
    const end = new Date(filter.endDate).getTime();
    transactions = transactions.filter(t => new Date(t.createdAt).getTime() <= end);
  }

  return transactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Gets transaction summary for a period
 */
export function getTransactionSummary(filter: TransactionFilter): TransactionSummary {
  const transactions = getFilteredTransactions(filter);

  let totalDeposits = 0;
  let totalWithdrawals = 0;

  transactions.forEach(t => {
    if (t.type === 'deposit') {
      totalDeposits += t.amount;
    } else {
      totalWithdrawals += t.amount;
    }
  });

  return {
    totalDeposits,
    totalWithdrawals,
    netChange: totalDeposits - totalWithdrawals,
    transactionCount: transactions.length,
  };
}

/**
 * Deletes a single transaction
 */
export function deleteTransaction(transactionId: string): boolean {
  const storage = getAllTransactions();

  for (const yearKey of Object.keys(storage.years)) {
    const year = parseInt(yearKey);
    const yearData = storage.years[year];

    for (const monthKey of Object.keys(yearData.months)) {
      const month = parseInt(monthKey);
      const transactions = yearData.months[month];
      const index = transactions.findIndex(t => t.id === transactionId);

      if (index !== -1) {
        transactions.splice(index, 1);
        
        // Clean up empty months
        if (transactions.length === 0) {
          delete yearData.months[month];
        }

        // Clean up empty years
        if (Object.keys(yearData.months).length === 0) {
          delete storage.years[year];
        }

        saveAllTransactions(storage);
        return true;
      }
    }
  }

  return false;
}

/**
 * Deletes all transactions for a specific month
 */
export function deleteTransactionsForMonth(year: number, month: number): number {
  const storage = getAllTransactions();
  const yearData = storage.years[year];

  if (!yearData || !yearData.months[month]) return 0;

  const count = yearData.months[month].length;
  delete yearData.months[month];

  // Clean up empty years
  if (Object.keys(yearData.months).length === 0) {
    delete storage.years[year];
  }

  saveAllTransactions(storage);
  return count;
}

/**
 * Deletes all transactions for a specific year
 */
export function deleteTransactionsForYear(year: number): number {
  const storage = getAllTransactions();
  const yearData = storage.years[year];

  if (!yearData) return 0;

  let count = 0;
  Object.values(yearData.months).forEach(monthTransactions => {
    count += monthTransactions.length;
  });

  delete storage.years[year];
  saveAllTransactions(storage);

  return count;
}

/**
 * Gets all available years with transactions
 */
export function getAvailableYears(): number[] {
  const storage = getAllTransactions();
  return Object.keys(storage.years).map(y => parseInt(y)).sort((a, b) => b - a);
}

/**
 * Gets available months for a given year
 */
export function getAvailableMonths(year: number): number[] {
  const storage = getAllTransactions();
  const yearData = storage.years[year];

  if (!yearData) return [];

  return Object.keys(yearData.months).map(m => parseInt(m)).sort((a, b) => b - a);
}

/**
 * Gets transactions for a specific entity (account or chain)
 */
export function getTransactionsForEntity(
  entityId: string, 
  entityType: 'account' | 'chain'
): Transaction[] {
  return getFilteredTransactions({ entityId, entityType });
}
