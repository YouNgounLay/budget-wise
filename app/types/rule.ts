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
 * Frequency options for rule execution
 */
export type RuleFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'annually';

export const RULE_FREQUENCY_LABELS: Record<RuleFrequency, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
  annually: 'Annually',
};

export const RULE_FREQUENCY_OPTIONS: { value: RuleFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly (Every 2 weeks)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

/**
 * Allocation mode - percentage or fixed amount
 */
export type AllocationMode = 'percentage' | 'amount';

/**
 * Target account for fund allocation with percentage or fixed amount
 */
export interface AllocationTarget {
  accountId: string;
  percentage: number; // 0-100, used when mode is 'percentage'
  amount?: number; // Fixed amount, used when mode is 'amount'
  mode: AllocationMode; // 'percentage' or 'amount'
}

/**
 * Account rule for automatic fund allocation
 * Executes on the specified day based on frequency if balance exceeds threshold
 */
export interface AccountRule {
  id: string;
  sourceAccountId: string;
  dayOfWeek: DayOfWeek;
  frequency: RuleFrequency;
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
  frequency: RuleFrequency;
  thresholdAmount: number;
  targets: AllocationTarget[];
}

/**
 * DTO for updating an existing account rule
 */
export interface UpdateAccountRuleDTO {
  dayOfWeek?: DayOfWeek;
  frequency?: RuleFrequency;
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

/**
 * Calculate the next trigger date for a rule based on its frequency and day of week
 */
export function calculateNextTriggerDate(rule: AccountRule): Date {
  const now = new Date();
  const currentDay = now.getDay() as DayOfWeek;
  const targetDay = rule.dayOfWeek;
  
  // Calculate days until next target day
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    // Target day has passed this week, calculate for next occurrence
    daysUntilTarget += 7;
  }
  
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilTarget);
  nextDate.setHours(0, 0, 0, 0);
  
  // If rule was executed recently, adjust based on frequency
  if (rule.lastExecuted) {
    const lastExecuted = new Date(rule.lastExecuted);
    let minNextDate: Date;
    
    switch (rule.frequency) {
      case 'weekly':
        // Next occurrence is at least 7 days after last execution
        minNextDate = new Date(lastExecuted);
        minNextDate.setDate(lastExecuted.getDate() + 7);
        break;
      case 'fortnightly':
        // Next occurrence is at least 14 days after last execution
        minNextDate = new Date(lastExecuted);
        minNextDate.setDate(lastExecuted.getDate() + 14);
        break;
      case 'monthly':
        // Next occurrence is at least 1 month after last execution
        minNextDate = new Date(lastExecuted);
        minNextDate.setMonth(lastExecuted.getMonth() + 1);
        break;
      case 'annually':
        // Next occurrence is at least 1 year after last execution
        minNextDate = new Date(lastExecuted);
        minNextDate.setFullYear(lastExecuted.getFullYear() + 1);
        break;
      default:
        minNextDate = nextDate;
    }
    
    // Find the next occurrence of target day on or after minNextDate
    while (nextDate < minNextDate) {
      switch (rule.frequency) {
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'fortnightly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'annually':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }
    }
  }
  
  return nextDate;
}

/**
 * Format the next trigger date for display
 */
export function formatNextTriggerDate(rule: AccountRule): string {
  const nextDate = calculateNextTriggerDate(rule);
  const now = new Date();
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const dateStr = nextDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: nextDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
  
  if (diffDays === 0) {
    return `Today (${dateStr})`;
  } else if (diffDays === 1) {
    return `Tomorrow (${dateStr})`;
  } else if (diffDays <= 7) {
    return `In ${diffDays} days (${dateStr})`;
  } else {
    return dateStr;
  }
}
