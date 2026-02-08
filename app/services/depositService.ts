/**
 * Deposit Service
 * Handles chain deposit/withdrawal operations with cascading logic
 */

import { Account } from '@/app/types/account';
import { Chain, DepositResult } from '@/app/types/chain';
import { getAccountById, updateAccount } from './accountService';
import { getChainById } from './chainService';
import { getCurrentTimestamp } from '@/app/utils/helpers';

/**
 * Main deposit function that routes to appropriate strategy based on chain mode
 */
export function depositToChain(
  chainId: string,
  amount: number,
  accounts: Account[]
): DepositResult {
  const chain = getChainById(chainId);
  if (!chain) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Chain not found',
    };
  }

  // Route to appropriate deposit strategy
  if (chain.distributionMode === 'percentage') {
    return depositToChainByPercentage(chain, amount, accounts);
  }
  
  return depositToChainSequential(chain, amount, accounts);
}

/**
 * Deposits money to a chain using percentage-based distribution
 * Each account receives a percentage of the total deposit amount
 */
export function depositToChainByPercentage(
  chain: Chain,
  amount: number,
  accounts: Account[]
): DepositResult {
  if (amount <= 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Deposit amount must be greater than 0',
    };
  }

  if (chain.accounts.length === 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Chain has no accounts',
    };
  }

  // Calculate total percentage to validate
  const totalPercentage = chain.accounts.reduce(
    (sum, acc) => sum + (acc.percentage || 0),
    0
  );

  if (totalPercentage !== 100) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: `Account percentages must sum to 100% (current: ${totalPercentage}%)`,
    };
  }

  const deposits: DepositResult['deposits'] = [];
  let totalDeposited = 0;

  // Process each account with its percentage
  for (const chainAccount of chain.accounts) {
    const account = accounts.find((a) => a.id === chainAccount.accountId);
    if (!account) continue;

    const percentage = chainAccount.percentage || 0;
    const depositAmount = Math.round((amount * percentage) / 100 * 100) / 100; // Round to 2 decimal places

    if (depositAmount > 0) {
      const newBalance = account.amount + depositAmount;

      deposits.push({
        accountId: account.id,
        accountName: account.name,
        amount: depositAmount,
        newBalance,
      });

      totalDeposited += depositAmount;
    }
  }

  // Handle rounding differences by adjusting the first deposit
  const roundingDiff = amount - totalDeposited;
  if (roundingDiff !== 0 && deposits.length > 0) {
    deposits[0].amount += roundingDiff;
    deposits[0].newBalance += roundingDiff;
    totalDeposited += roundingDiff;
  }

  return {
    success: true,
    deposits,
    remainingAmount: 0,
    message: `Successfully distributed ${formatMoney(totalDeposited)} by percentage across ${deposits.length} account(s).`,
  };
}

/**
 * Deposits money to a chain using sequential (limit-based) distribution
 * Money fills each account until its limit is reached, then moves to the next
 */
export function depositToChainSequential(
  chain: Chain,
  amount: number,
  accounts: Account[]
): DepositResult {
  if (amount <= 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Deposit amount must be greater than 0',
    };
  }

  if (chain.accounts.length === 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Chain has no accounts',
    };
  }

  const deposits: DepositResult['deposits'] = [];
  let remainingAmount = amount;

  // Process each account in the chain order
  for (const chainAccount of chain.accounts) {
    if (remainingAmount <= 0) break;

    const account = accounts.find((a) => a.id === chainAccount.accountId);
    if (!account) continue;

    const currentAmount = account.amount;
    const limit = chainAccount.limit;
    const spaceAvailable = Math.max(0, limit - currentAmount);

    if (spaceAvailable > 0) {
      const depositAmount = Math.min(remainingAmount, spaceAvailable);
      const newBalance = currentAmount + depositAmount;

      deposits.push({
        accountId: account.id,
        accountName: account.name,
        amount: depositAmount,
        newBalance,
      });

      remainingAmount -= depositAmount;
    }
  }

  // If there's remaining amount and an overflow account exists, deposit the rest there
  if (remainingAmount > 0 && chain.overflowAccountId) {
    const overflowAccount = accounts.find((a) => a.id === chain.overflowAccountId);
    if (overflowAccount) {
      const newBalance = overflowAccount.amount + remainingAmount;
      deposits.push({
        accountId: overflowAccount.id,
        accountName: overflowAccount.name,
        amount: remainingAmount,
        newBalance,
      });
      remainingAmount = 0;
    }
  }

  const totalDeposited = amount - remainingAmount;

  if (totalDeposited === 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'All accounts in the chain have reached their limits',
    };
  }

  return {
    success: true,
    deposits,
    remainingAmount,
    message:
      remainingAmount > 0
        ? `Deposited ${formatMoney(totalDeposited)}. ${formatMoney(remainingAmount)} remaining (all limits reached).`
        : `Successfully deposited ${formatMoney(totalDeposited)} across ${deposits.length} account(s).`,
  };
}

/**
 * Applies the deposit result to actually update account balances
 */
export function applyDeposits(
  deposits: DepositResult['deposits'],
  accounts: Account[]
): Account[] {
  const updatedAccounts = [...accounts];

  for (const deposit of deposits) {
    const index = updatedAccounts.findIndex((a) => a.id === deposit.accountId);
    if (index !== -1) {
      updatedAccounts[index] = {
        ...updatedAccounts[index],
        amount: deposit.newBalance,
        updatedAt: getCurrentTimestamp(),
      };
    }
  }

  return updatedAccounts;
}

/**
 * Withdraws money from a chain, starting from the last account
 */
export function withdrawFromChain(
  chainId: string,
  amount: number,
  accounts: Account[]
): DepositResult {
  if (amount <= 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Withdrawal amount must be greater than 0',
    };
  }

  const chain = getChainById(chainId);
  if (!chain) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Chain not found',
    };
  }

  if (chain.accounts.length === 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'Chain has no accounts',
    };
  }

  const withdrawals: DepositResult['deposits'] = [];
  let remainingAmount = amount;

  // Process accounts in reverse order (right to left)
  const reversedAccounts = [...chain.accounts].reverse();

  for (const chainAccount of reversedAccounts) {
    if (remainingAmount <= 0) break;

    const account = accounts.find((a) => a.id === chainAccount.accountId);
    if (!account || account.amount <= 0) continue;

    const withdrawAmount = Math.min(remainingAmount, account.amount);
    const newBalance = account.amount - withdrawAmount;

    withdrawals.push({
      accountId: account.id,
      accountName: account.name,
      amount: -withdrawAmount,
      newBalance,
    });

    remainingAmount -= withdrawAmount;
  }

  const totalWithdrawn = amount - remainingAmount;

  if (totalWithdrawn === 0) {
    return {
      success: false,
      deposits: [],
      remainingAmount: amount,
      message: 'No funds available in chain accounts',
    };
  }

  return {
    success: true,
    deposits: withdrawals,
    remainingAmount,
    message:
      remainingAmount > 0
        ? `Withdrew ${formatMoney(totalWithdrawn)}. ${formatMoney(remainingAmount)} could not be withdrawn (insufficient funds).`
        : `Successfully withdrew ${formatMoney(totalWithdrawn)} from ${withdrawals.length} account(s).`,
  };
}

/**
 * Helper function to format money
 */
function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(amount));
}
