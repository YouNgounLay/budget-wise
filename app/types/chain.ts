/**
 * Chain Types
 * Defines the structure for deposit/withdrawal chains
 */

export interface ChainAccountConfig {
  accountId: string;
  limit: number;
}

export interface Chain {
  id: string;
  name: string;
  description: string;
  accounts: ChainAccountConfig[];
  defaultLimit: number;
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
