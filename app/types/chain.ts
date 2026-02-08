/**
 * Chain Types
 * Defines the structure for deposit/withdrawal chains
 */

/**
 * Distribution mode for chain deposits
 * - sequential: Fills accounts left to right until limit is reached
 * - percentage: Distributes deposit amount by configured percentages
 */
export type ChainDistributionMode = 'sequential' | 'percentage';

export interface ChainAccountConfig {
  accountId: string;
  limit: number;
  percentage: number; // 0-100, used when chain is in percentage mode
}

export interface Chain {
  id: string;
  name: string;
  description: string;
  accounts: ChainAccountConfig[];
  overflowAccountId: string | null; // Account with no limit at the end of chain
  defaultLimit: number;
  distributionMode: ChainDistributionMode; // NEW: Distribution mode toggle
  createdAt: string;
  updatedAt: string;
}

export interface CreateChainDTO {
  name: string;
  description: string;
  defaultLimit?: number;
}

export interface UpdateChainDTO {
  name?: string;
  description?: string;
  defaultLimit?: number;
}

export interface DepositResult {
  success: boolean;
  deposits: {
    accountId: string;
    accountName: string;
    amount: number;
    newBalance: number;
  }[];
  remainingAmount: number;
  message: string;
}
