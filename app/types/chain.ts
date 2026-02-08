/**
 * Chain Types
 * Defines the structure for deposit/withdrawal chains
 */

import { AccountColor } from './account';

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
  hasBufferAccount: boolean; // Toggle for buffer account at end of chain
  bufferAmount: number; // Amount stored in buffer (infinite capacity)
  defaultLimit: number;
  distributionMode: ChainDistributionMode; // Distribution mode toggle
  color: AccountColor; // Chain card color
  customColor?: string; // Custom color if color is 'custom'
  createdAt: string;
  updatedAt: string;
}

export interface CreateChainDTO {
  name: string;
  description: string;
  defaultLimit?: number;
  color?: AccountColor;
  customColor?: string;
}

export interface UpdateChainDTO {
  name?: string;
  description?: string;
  defaultLimit?: number;
  color?: AccountColor;
  customColor?: string;
}

export interface DepositResult {
  success: boolean;
  chainId: string;
  deposits: {
    accountId: string;
    accountName: string;
    amount: number;
    newBalance: number;
  }[];
  bufferDeposit?: {
    amount: number;
    newBufferBalance: number;
  };
  remainingAmount: number;
  message: string;
}
