/**
 * Transaction Types
 * Defines the structure for transaction tracking
 * Transactions are stored by Year > Month for efficient retrieval
 */

/**
 * Transaction type - deposit or withdrawal
 */
export type TransactionType = 'deposit' | 'withdraw';

/**
 * Entity type - what type of entity the transaction is for
 */
export type TransactionEntityType = 'account' | 'chain';

/**
 * Individual transaction record
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  entityType: TransactionEntityType;
  entityId: string; // Account or Chain ID
  entityName: string; // Name at time of transaction (for historical record)
  amount: number;
  balanceAfter: number; // Balance after this transaction
  description?: string;
  tagIds: string[]; // Tags applied to this transaction
  createdAt: string; // ISO date string
}

/**
 * Monthly transaction container
 */
export interface MonthlyTransactions {
  year: number;
  month: number; // 1-12
  transactions: Transaction[];
}

/**
 * Yearly transaction container
 */
export interface YearlyTransactions {
  year: number;
  months: Record<number, Transaction[]>; // Key is month (1-12)
}

/**
 * All transactions storage structure
 */
export interface TransactionStorage {
  years: Record<number, YearlyTransactions>;
}

/**
 * DTO for creating a new transaction
 */
export interface CreateTransactionDTO {
  type: TransactionType;
  entityType: TransactionEntityType;
  entityId: string;
  entityName: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  tagIds?: string[];
}

/**
 * Filter options for querying transactions
 */
export interface TransactionFilter {
  year?: number;
  month?: number;
  type?: TransactionType;
  entityType?: TransactionEntityType;
  entityId?: string;
  tagIds?: string[];
  startDate?: string;
  endDate?: string;
}

/**
 * Transaction summary for a period
 */
export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netChange: number;
  transactionCount: number;
}
