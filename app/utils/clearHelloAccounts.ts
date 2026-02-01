import { getAllAccounts, saveAllAccounts } from '@/app/services/accountService';

/**
 * Removes all accounts with the name 'hello' from localStorage
 */
export function clearHelloAccounts() {
  const accounts = getAllAccounts();
  const filtered = accounts.filter(acc => acc.name !== 'hello');
  if (filtered.length !== accounts.length) {
    saveAllAccounts(filtered);
  }
}
