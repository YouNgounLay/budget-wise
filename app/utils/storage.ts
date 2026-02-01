import { ACCOUNT_COLORS, ACCOUNT_ICONS } from "../types";
/**
 * Storage Utility
 * Handles localStorage operations with type safety
 */

const STORAGE_KEYS = {
  ACCOUNTS: 'budget-wise-accounts',
  CHAINS: 'budget-wise-chains',
} as const;

export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    // const power = JSON.parse(item || "[]");
    // return item ? power : null;
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
}

export function setToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

export { STORAGE_KEYS };
