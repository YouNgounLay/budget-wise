'use client';

/**
 * Rule Context
 * Global state management for account allocation rules
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import {
  AccountRule,
  CreateAccountRuleDTO,
  UpdateAccountRuleDTO,
  RuleExecutionResult,
} from '@/app/types/rule';
import { Account } from '@/app/types/account';
import {
  getAllRules,
  saveAllRules,
  createRule as createRuleService,
  updateRule as updateRuleService,
  deleteRule as deleteRuleService,
  executeRule as executeRuleService,
  getRulesForAccount,
  validateNoDuplicateTargets,
  validatePercentages,
} from '@/app/services/ruleService';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

// State type
interface RuleState {
  rules: AccountRule[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type RuleAction =
  | { type: 'SET_RULES'; payload: AccountRule[] }
  | { type: 'ADD_RULE'; payload: AccountRule }
  | { type: 'UPDATE_RULE'; payload: AccountRule }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context type
interface RuleContextType {
  state: RuleState;
  createRule: (data: CreateAccountRuleDTO) => { success: boolean; rule?: AccountRule; error?: string };
  updateRule: (id: string, data: UpdateAccountRuleDTO) => { success: boolean; rule?: AccountRule; error?: string };
  deleteRule: (id: string) => boolean;
  getRuleById: (id: string) => AccountRule | undefined;
  getRulesForAccount: (accountId: string) => AccountRule[];
  toggleRuleActive: (id: string) => AccountRule | null;
  executeRule: (ruleId: string, accounts: Account[]) => RuleExecutionResult | null;
  applyRuleExecution: (result: RuleExecutionResult, accounts: Account[]) => Account[];
}

// Initial state
const initialState: RuleState = {
  rules: [],
  isLoading: true,
  error: null,
};

// Reducer
function ruleReducer(state: RuleState, action: RuleAction): RuleState {
  switch (action.type) {
    case 'SET_RULES':
      return { ...state, rules: action.payload, isLoading: false };
    case 'ADD_RULE':
      return { ...state, rules: [...state.rules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map((rule) =>
          rule.id === action.payload.id ? action.payload : rule
        ),
      };
    case 'DELETE_RULE':
      return {
        ...state,
        rules: state.rules.filter((rule) => rule.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create context
const RuleContext = createContext<RuleContextType | undefined>(undefined);

// Provider component
export function RuleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ruleReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load rules from storage on mount
  useEffect(() => {
    const rules = getAllRules();
    dispatch({ type: 'SET_RULES', payload: rules });
  }, []);

  // Debounced save to storage whenever rules change
  useEffect(() => {
    if (state.isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveAllRules(state.rules);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.rules, state.isLoading]);

  const createRule = useCallback((
    data: CreateAccountRuleDTO
  ): { success: boolean; rule?: AccountRule; error?: string } => {
    // Validate no self-targeting
    if (data.targets.some((t) => t.accountId === data.sourceAccountId)) {
      return { success: false, error: 'Cannot target the source account itself' };
    }

    // Validate percentages
    const percentageValidation = validatePercentages(data.targets);
    if (!percentageValidation.valid) {
      return { success: false, error: percentageValidation.message };
    }

    // Validate no duplicate targets using current state
    const existingTargets = new Set<string>();
    state.rules.forEach((rule) => {
      if (rule.sourceAccountId === data.sourceAccountId) {
        rule.targets.forEach((target) => {
          existingTargets.add(target.accountId);
        });
      }
    });

    for (const target of data.targets) {
      if (existingTargets.has(target.accountId)) {
        return {
          success: false,
          error: 'A rule already exists from this account to one of the target accounts',
        };
      }
    }

    const timestamp = getCurrentTimestamp();
    const newRule: AccountRule = {
      id: generateId(),
      sourceAccountId: data.sourceAccountId,
      dayOfWeek: data.dayOfWeek,
      thresholdAmount: data.thresholdAmount,
      targets: data.targets,
      isActive: true,
      lastExecuted: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    dispatch({ type: 'ADD_RULE', payload: newRule });
    return { success: true, rule: newRule };
  }, [state.rules]);

  const updateRule = useCallback((
    id: string,
    data: UpdateAccountRuleDTO
  ): { success: boolean; rule?: AccountRule; error?: string } => {
    const existingRule = state.rules.find((r) => r.id === id);
    if (!existingRule) {
      return { success: false, error: 'Rule not found' };
    }

    // If updating targets, validate them
    if (data.targets) {
      // Validate no self-targeting
      if (data.targets.some((t) => t.accountId === existingRule.sourceAccountId)) {
        return { success: false, error: 'Cannot target the source account itself' };
      }

      // Validate percentages
      const percentageValidation = validatePercentages(data.targets);
      if (!percentageValidation.valid) {
        return { success: false, error: percentageValidation.message };
      }

      // Validate no duplicate targets (excluding current rule)
      const existingTargets = new Set<string>();
      state.rules.forEach((rule) => {
        if (rule.sourceAccountId === existingRule.sourceAccountId && rule.id !== id) {
          rule.targets.forEach((target) => {
            existingTargets.add(target.accountId);
          });
        }
      });

      for (const target of data.targets) {
        if (existingTargets.has(target.accountId)) {
          return {
            success: false,
            error: 'A rule already exists from this account to one of the target accounts',
          };
        }
      }
    }

    const updatedRule: AccountRule = {
      ...existingRule,
      ...data,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_RULE', payload: updatedRule });
    return { success: true, rule: updatedRule };
  }, [state.rules]);

  const deleteRuleCallback = useCallback((id: string): boolean => {
    const exists = state.rules.some((r) => r.id === id);
    if (!exists) return false;

    dispatch({ type: 'DELETE_RULE', payload: id });
    return true;
  }, [state.rules]);

  const getRuleById = useCallback((id: string): AccountRule | undefined => {
    return state.rules.find((r) => r.id === id);
  }, [state.rules]);

  const getRulesForAccountCallback = useCallback((accountId: string): AccountRule[] => {
    return state.rules.filter((r) => r.sourceAccountId === accountId);
  }, [state.rules]);

  const toggleRuleActive = useCallback((id: string): AccountRule | null => {
    const rule = state.rules.find((r) => r.id === id);
    if (!rule) return null;

    const updatedRule: AccountRule = {
      ...rule,
      isActive: !rule.isActive,
      updatedAt: getCurrentTimestamp(),
    };

    dispatch({ type: 'UPDATE_RULE', payload: updatedRule });
    return updatedRule;
  }, [state.rules]);

  const executeRuleCallback = useCallback((
    ruleId: string,
    accounts: Account[]
  ): RuleExecutionResult | null => {
    const rule = state.rules.find((r) => r.id === ruleId);
    if (!rule) return null;

    return executeRuleService(rule, accounts);
  }, [state.rules]);

  const applyRuleExecution = useCallback((
    result: RuleExecutionResult,
    accounts: Account[]
  ): Account[] => {
    if (!result.success) return accounts;

    const updatedAccounts = [...accounts];
    const timestamp = getCurrentTimestamp();

    // Deduct from source account
    const sourceIndex = updatedAccounts.findIndex(
      (a) => a.id === result.sourceAccountId
    );
    if (sourceIndex !== -1) {
      updatedAccounts[sourceIndex] = {
        ...updatedAccounts[sourceIndex],
        amount: updatedAccounts[sourceIndex].amount - result.excessAmount,
        updatedAt: timestamp,
      };
    }

    // Add to target accounts
    for (const allocation of result.allocations) {
      const targetIndex = updatedAccounts.findIndex(
        (a) => a.id === allocation.accountId
      );
      if (targetIndex !== -1) {
        updatedAccounts[targetIndex] = {
          ...updatedAccounts[targetIndex],
          amount: allocation.newBalance,
          updatedAt: timestamp,
        };
      }
    }

    // Update rule's lastExecuted
    const rule = state.rules.find((r) => r.id === result.ruleId);
    if (rule) {
      const updatedRule: AccountRule = {
        ...rule,
        lastExecuted: timestamp,
        updatedAt: timestamp,
      };
      dispatch({ type: 'UPDATE_RULE', payload: updatedRule });
    }

    return updatedAccounts;
  }, [state.rules]);

  const contextValue = useMemo(
    () => ({
      state,
      createRule,
      updateRule,
      deleteRule: deleteRuleCallback,
      getRuleById,
      getRulesForAccount: getRulesForAccountCallback,
      toggleRuleActive,
      executeRule: executeRuleCallback,
      applyRuleExecution,
    }),
    [
      state,
      createRule,
      updateRule,
      deleteRuleCallback,
      getRuleById,
      getRulesForAccountCallback,
      toggleRuleActive,
      executeRuleCallback,
      applyRuleExecution,
    ]
  );

  return (
    <RuleContext.Provider value={contextValue}>{children}</RuleContext.Provider>
  );
}

// Custom hook
export function useRules(): RuleContextType {
  const context = useContext(RuleContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RuleProvider');
  }
  return context;
}
