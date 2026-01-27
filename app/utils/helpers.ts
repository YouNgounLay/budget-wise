/**
 * Helper Utilities
 * Common utility functions used throughout the application
 */

/**
 * Generates a unique UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Formats a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Formats a date string to include time
 */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/**
 * Gets current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Clamps a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validates if a string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Safely parses a number, returning 0 for invalid inputs
 */
export function safeParseNumber(value: string | number): number {
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
