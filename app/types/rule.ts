/**
 * Account Rule Types
 * Defines the structure for automated account allocation rules
 */

/**
 * Days of the week for rule execution
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/**
 * Target account for fund allocation with percentage
 */
export interface AllocationTarget {
  accountId: string;
  percentage: number; // 0-100, sum of all targets must equal 100
}

/**
 * Account rule for automatic fund allocation
 * Executes weekly on the specified day if balance exceeds threshold
 */
export interface AccountRule {
  id: string;
  sourceAccountId: string;
  dayOfWeek: DayOfWeek;
  thresholdAmount: number;
  targets: AllocationTarget[];
  isActive: boolean;
  lastExecuted: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new account rule
 */
export interface CreateAccountRuleDTO {
  sourceAccountId: string;
  dayOfWeek: DayOfWeek;
  thresholdAmount: number;
  targets: AllocationTarget[];
}

/**
 * DTO for updating an existing account rule
 */
export interface UpdateAccountRuleDTO {
  dayOfWeek?: DayOfWeek;
  thresholdAmount?: number;
  targets?: AllocationTarget[];
  isActive?: boolean;
}

/**
 * Result of rule execution
 */
export interface RuleExecutionResult {
  success: boolean;
  ruleId: string;
  sourceAccountId: string;
  excessAmount: number;
  allocations: {
    accountId: string;
    accountName: string;
    amount: number;
    percentage: number;
    newBalance: number;
  }[];
  message: string;
}
