/**
 * Account Service
 * Handles all CRUD operations for accounts
 */

import {
  Account,
  CreateAccountDTO,
  UpdateAccountDTO,
} from '@/app/types/account';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

/**
 * Retrieves all accounts from storage
 */
export function getAllAccounts(): Account[] {
  return getFromStorage<Account[]>(STORAGE_KEYS.ACCOUNTS) || [];
}

/**
 * Retrieves a single account by ID
 */
export function getAccountById(id: string): Account | null {
  const accounts = getAllAccounts();
  return accounts.find((account) => account.id === id) || null;
}

/**
 * Creates a new account
 */
export function createAccount(data: CreateAccountDTO): Account {
  const accounts = getAllAccounts();
  const timestamp = getCurrentTimestamp();

  const newAccount: Account = {
    id: generateId(),
    name: data.name,
    description: data.description,
    amount: data.amount,
    icon: data.icon,
    color: data.color,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  accounts.push(newAccount);
  setToStorage(STORAGE_KEYS.ACCOUNTS, accounts);

  return newAccount;
}

/**
 * Updates an existing account
 */
export function updateAccount(
  id: string,
  data: UpdateAccountDTO
): Account | null {
  const accounts = getAllAccounts();
  const index = accounts.findIndex((account) => account.id === id);

  if (index === -1) return null;

  const updatedAccount: Account = {
    ...accounts[index],
    ...data,
    updatedAt: getCurrentTimestamp(),
  };

  accounts[index] = updatedAccount;
  setToStorage(STORAGE_KEYS.ACCOUNTS, accounts);

  return updatedAccount;
}

/**
 * Deletes an account by ID
 */
export function deleteAccount(id: string): boolean {
  const accounts = getAllAccounts();
  const filteredAccounts = accounts.filter((account) => account.id !== id);

  if (filteredAccounts.length === accounts.length) return false;

  setToStorage(STORAGE_KEYS.ACCOUNTS, filteredAccounts);
  return true;
}

/**
 * Deposits money to a specific account
 */
export function depositToAccount(id: string, amount: number): Account | null {
  if (amount <= 0) return null;

  const account = getAccountById(id);
  if (!account) return null;

  return updateAccount(id, { amount: account.amount + amount });
}

/**
 * Withdraws money from a specific account
 */
export function withdrawFromAccount(
  id: string,
  amount: number
): Account | null {
  if (amount <= 0) return null;

  const account = getAccountById(id);
  if (!account) return null;

  const newAmount = account.amount - amount;
  if (newAmount < 0) return null;

  return updateAccount(id, { amount: newAmount });
}

/**
 * Saves all accounts (used by context)
 */
export function saveAllAccounts(accounts: Account[]): void {
  setToStorage(STORAGE_KEYS.ACCOUNTS, accounts);
}
