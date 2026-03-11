/**
 * Rule Service
 * Handles all operations for account allocation rules
 */

import {
  AccountRule,
  CreateAccountRuleDTO,
  UpdateAccountRuleDTO,
  RuleExecutionResult,
  DayOfWeek,
  AllocationTarget,
} from '@/app/types/rule';
import { Account } from '@/app/types/account';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

/**
 * Retrieves all rules from storage
 */
export function getAllRules(): AccountRule[] {
  return getFromStorage<AccountRule[]>(STORAGE_KEYS.RULES) || [];
}

/**
 * Saves all rules to storage
 */
export function saveAllRules(rules: AccountRule[]): boolean {
  return setToStorage(STORAGE_KEYS.RULES, rules);
}

/**
 * Retrieves a single rule by ID
 */
export function getRuleById(id: string): AccountRule | null {
  const rules = getAllRules();
  return rules.find((rule) => rule.id === id) || null;
}

/**
 * Gets all rules for a specific source account
 */
export function getRulesForAccount(accountId: string): AccountRule[] {
  const rules = getAllRules();
  return rules.filter((rule) => rule.sourceAccountId === accountId);
}

/**
 * Validates that a rule doesn't create duplicate source-target pairs
 * Returns true if the rule is valid (no duplicates)
 */
export function validateNoDuplicateTargets(
  sourceAccountId: string,
  targets: { accountId: string; percentage: number }[],
  excludeRuleId?: string
): { valid: boolean; message: string } {
  const rules = getAllRules();

  // Get all existing target account IDs for this source (excluding the current rule if editing)
  const existingTargets = new Set<string>();
  rules.forEach((rule) => {
    if (rule.sourceAccountId === sourceAccountId && rule.id !== excludeRuleId) {
      rule.targets.forEach((target) => {
        existingTargets.add(target.accountId);
      });
    }
  });

  // Check if any new targets already exist
  for (const target of targets) {
    if (existingTargets.has(target.accountId)) {
      return {
        valid: false,
        message: `A rule already exists from this account to the target account`,
      };
    }
  }

  return { valid: true, message: '' };
}

/**
 * Validates that target allocations are valid
 * For percentage mode: allows any percentage > 0 and <= 100, total cannot exceed 100%
 * For amount mode: allows any positive amount
 */
export function validateAllocations(
  targets: AllocationTarget[]
): { valid: boolean; message: string } {
  if (targets.length === 0) {
    return { valid: false, message: 'At least one target account is required' };
  }

  // Separate targets by mode
  const percentageTargets = targets.filter(t => t.mode === 'percentage' || !t.mode);
  const amountTargets = targets.filter(t => t.mode === 'amount');

  // Validate percentage targets
  const totalPercentage = percentageTargets.reduce((sum, t) => sum + t.percentage, 0);
  if (totalPercentage > 100) {
    return {
      valid: false,
      message: `Total percentage cannot exceed 100% (current: ${totalPercentage}%)`,
    };
  }

  // Check for invalid individual percentages
  for (const target of percentageTargets) {
    if (target.percentage <= 0 || target.percentage > 100) {
      return {
        valid: false,
        message: 'Each percentage must be between 0.01 and 100',
      };
    }
  }

  // Check for invalid individual amounts
  for (const target of amountTargets) {
    if (!target.amount || target.amount <= 0) {
      return {
        valid: false,
        message: 'Each amount must be a positive number',
      };
    }
  }

  return { valid: true, message: '' };
}

/**
 * @deprecated Use validateAllocations instead
 * Validates that target percentages sum to 100 (legacy function)
 */
export function validatePercentages(
  targets: { accountId: string; percentage: number; mode?: string; amount?: number }[]
): { valid: boolean; message: string } {
  // Convert to AllocationTarget format and use new validation
  const allocationTargets: AllocationTarget[] = targets.map(t => ({
    accountId: t.accountId,
    percentage: t.percentage,
    amount: t.amount,
    mode: (t.mode as 'percentage' | 'amount') || 'percentage',
  }));
  return validateAllocations(allocationTargets);
}

/**
 * Creates a new account rule
 */
export function createRule(data: CreateAccountRuleDTO): AccountRule | null {
  // Validate no self-targeting
  if (data.targets.some((t) => t.accountId === data.sourceAccountId)) {
    return null;
  }

  // Validate percentages
  const percentageValidation = validatePercentages(data.targets);
  if (!percentageValidation.valid) {
    return null;
  }

  // Validate no duplicate targets
  const duplicateValidation = validateNoDuplicateTargets(
    data.sourceAccountId,
    data.targets
  );
  if (!duplicateValidation.valid) {
    return null;
  }

  const rules = getAllRules();
  const timestamp = getCurrentTimestamp();

  const newRule: AccountRule = {
    id: generateId(),
    sourceAccountId: data.sourceAccountId,
    dayOfWeek: data.dayOfWeek,
    frequency: data.frequency,
    thresholdAmount: data.thresholdAmount,
    targets: data.targets,
    isActive: true,
    lastExecuted: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  rules.push(newRule);
  saveAllRules(rules);

  return newRule;
}

/**
 * Updates an existing rule
 */
export function updateRule(
  id: string,
  data: UpdateAccountRuleDTO
): AccountRule | null {
  const rules = getAllRules();
  const index = rules.findIndex((rule) => rule.id === id);

  if (index === -1) return null;

  const existingRule = rules[index];

  // If updating targets, validate them
  if (data.targets) {
    // Validate no self-targeting
    if (data.targets.some((t) => t.accountId === existingRule.sourceAccountId)) {
      return null;
    }

    // Validate percentages
    const percentageValidation = validatePercentages(data.targets);
    if (!percentageValidation.valid) {
      return null;
    }

    // Validate no duplicate targets
    const duplicateValidation = validateNoDuplicateTargets(
      existingRule.sourceAccountId,
      data.targets,
      id
    );
    if (!duplicateValidation.valid) {
      return null;
    }
  }

  const updatedRule: AccountRule = {
    ...existingRule,
    ...data,
    updatedAt: getCurrentTimestamp(),
  };

  rules[index] = updatedRule;
  saveAllRules(rules);

  return updatedRule;
}

/**
 * Deletes a rule by ID
 */
export function deleteRule(id: string): boolean {
  const rules = getAllRules();
  const filteredRules = rules.filter((rule) => rule.id !== id);

  if (filteredRules.length === rules.length) return false;

  saveAllRules(filteredRules);
  return true;
}

/**
 * Executes a rule: allocates excess funds from source to targets
 */
export function executeRule(
  rule: AccountRule,
  accounts: Account[]
): RuleExecutionResult {
  const sourceAccount = accounts.find((a) => a.id === rule.sourceAccountId);

  if (!sourceAccount) {
    return {
      success: false,
      ruleId: rule.id,
      sourceAccountId: rule.sourceAccountId,
      excessAmount: 0,
      allocations: [],
      message: 'Source account not found',
    };
  }

  const excessAmount = sourceAccount.amount - rule.thresholdAmount;

  if (excessAmount <= 0) {
    return {
      success: false,
      ruleId: rule.id,
      sourceAccountId: rule.sourceAccountId,
      excessAmount: 0,
      allocations: [],
      message: 'Account balance does not exceed threshold',
    };
  }

  const allocations: RuleExecutionResult['allocations'] = [];

  for (const target of rule.targets) {
    const targetAccount = accounts.find((a) => a.id === target.accountId);
    if (!targetAccount) continue;

    let allocationAmount: number;
    
    // Handle both percentage and amount modes
    if (target.mode === 'amount' && target.amount) {
      // Fixed amount mode - allocate the specified amount (up to excess)
      allocationAmount = Math.min(target.amount, excessAmount);
    } else {
      // Percentage mode (default)
      allocationAmount = Math.round((excessAmount * target.percentage) / 100 * 100) / 100;
    }

    if (allocationAmount > 0) {
      allocations.push({
        accountId: targetAccount.id,
        accountName: targetAccount.name,
        amount: allocationAmount,
        percentage: target.mode === 'amount' ? 0 : target.percentage,
        newBalance: targetAccount.amount + allocationAmount,
      });
    }
  }

  return {
    success: true,
    ruleId: rule.id,
    sourceAccountId: rule.sourceAccountId,
    excessAmount,
    allocations,
    message: `Allocated ${formatMoney(excessAmount)} from excess funds`,
  };
}

/**
 * Gets rules that should be executed today
 */
export function getRulesForToday(): AccountRule[] {
  const today = new Date().getDay() as DayOfWeek;
  const rules = getAllRules();
  
  return rules.filter(
    (rule) => rule.isActive && rule.dayOfWeek === today
  );
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
