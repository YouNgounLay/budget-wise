'use client';

/**
 * Tutorial Context
 * Manages the interactive tutorial state and flow
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';

// Tutorial step definitions
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetPage: string;
  targetElement?: string;
  action?: string;
  content: string[];
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BudgetWise!',
    description: 'Let\'s get you started with a quick tour.',
    targetPage: '/',
    content: [
      'BudgetWise helps you manage your budget with account-based planning.',
      'We\'ll create some sample accounts to get you started.',
      'You can exit this tutorial at any time by clicking the X button.',
    ],
  },
  {
    id: 'create-accounts',
    title: 'Step 1: Sample Accounts Created',
    description: 'We\'ve created 5 sample accounts for you.',
    targetPage: '/accounts',
    action: 'create-sample-accounts',
    content: [
      '✅ Grocery - $100',
      '✅ Rent - $500',
      '✅ Mortgage - $10,000',
      '✅ Excess Saving - $500',
      '✅ Emergency Fund - $3,000',
      '',
      'These accounts help you organize your budget into categories.',
    ],
  },
  {
    id: 'create-new-account',
    title: 'Step 2: Create a New Account',
    description: 'Let\'s create a "Medical Insurance" account.',
    targetPage: '/accounts',
    targetElement: 'account-form',
    content: [
      'Click the "+ New Account" button to create a new account.',
      '',
      'For this tutorial, create an account with:',
      '• Name: "Medical Insurance"',
      '• Description: "Monthly health insurance"',
      '• Icon: Health (heart or medical icon)',
      '• Color: Blue',
      '',
      'After creating, click "Next" to continue.',
    ],
  },
  {
    id: 'deposit-withdraw',
    title: 'Step 3: Deposit & Withdraw',
    description: 'Learn how to manage account balances.',
    targetPage: '/accounts',
    content: [
      'Each account card has deposit and withdraw buttons:',
      '',
      '[+] Deposit: Add money to an account',
      '[-] Withdraw: Remove money from an account',
      '',
      'You can also add an optional description to track',
      'what each deposit or withdrawal was for.',
      '',
      'Try it out:',
      '1. Click the deposit button (↓) on any account',
      '2. Enter $300, add a description, and confirm',
      '3. Click the withdraw button (↑)',
      '4. Enter $100 and confirm',
      '',
      'Watch the balance update in real-time!',
    ],
  },
  {
    id: 'create-chain',
    title: 'Step 4: Create a Chain',
    description: 'Chains automatically allocate funds across accounts.',
    targetPage: '/chains',
    content: [
      'Chains are powerful! They let you:',
      '',
      '• Set a priority order for your accounts',
      '• Automatically distribute deposits across accounts',
      '• Withdraw in reverse order (from last to first)',
      '• Define limits for each account in the chain',
      '• Add descriptions to chain deposits (save for future use!)',
      '• Set up a buffer account for overflow funds',
      '',
      'Buffer Account Options:',
      '• Virtual Buffer: Unlimited capacity, stores overflow',
      '• Use Existing Account: Select any account not in chain',
      '',
      'Create a chain with this order:',
      '1. Grocery → 2. Rent → 3. Mortgage → 4. Emergency Fund → 5. Excess Saving',
      '',
      'When you deposit to this chain, funds flow from first to last,',
      'filling each account up to its limit before moving to the next.',
      'When you withdraw, funds are taken from last to first.',
    ],
  },
  {
    id: 'setup-rules',
    title: 'Step 5: Set Up Automatic Rules',
    description: 'Rules automate your fund allocation.',
    targetPage: '/rules',
    content: [
      'Rules run automatically on a schedule:',
      '',
      '• Weekly - Every week on a specific day',
      '• Fortnightly - Every two weeks',
      '• Monthly - Once per month',
      '• Annually - Once per year',
      '',
      'Create a rule to:',
      '1. Select a source account',
      '2. Set a threshold (e.g., $1000)',
      '3. Choose frequency and day',
      '4. Add target accounts with percentages',
      '',
      'Excess funds above the threshold are distributed automatically!',
    ],
  },
  {
    id: 'tags-system',
    title: 'Step 6: Organize with Tags',
    description: 'Use tags to categorize your accounts and transactions.',
    targetPage: '/tags',
    content: [
      'Tags help you organize accounts and transactions:',
      '',
      '• Create account tags and transaction tags',
      '• Assign tags when creating or editing accounts',
      '• Assign tags when depositing or withdrawing',
      '',
      'Example tags:',
      '• "Essential" - for must-pay bills (account tag)',
      '• "Savings" - for saving goals (account tag)',
      '• "Groceries" - for grocery expenses (transaction tag)',
      '',
      'Create tags here, then assign them in account/transaction forms!',
    ],
  },
  {
    id: 'transactions',
    title: 'Step 7: Track Transactions',
    description: 'View your transaction history.',
    targetPage: '/transactions',
    content: [
      'Every deposit and withdrawal is tracked automatically!',
      '',
      'The Transactions page shows:',
      '• All deposits and withdrawals',
      '• Summary statistics (total in/out/net)',
      '• Filter by year, month, type, or account',
      '',
      'You can also:',
      '• Delete individual transactions',
      '• Clear an entire month or year\'s history',
      '• Apply transaction tags for categorization',
      '',
      'This helps you track spending patterns over time.',
    ],
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    description: 'You\'re ready to manage your budget!',
    targetPage: '/',
    content: [
      'Congratulations! You\'ve learned the basics of BudgetWise.',
      '',
      'Quick recap:',
      '• Accounts hold your budget categories',
      '• Chains automatically distribute deposits',
      '• Rules automate periodic transfers',
      '• Tags help organize everything',
      '• Transactions track your activity history',
      '',
      'Customization tips:',
      '• Change fonts and themes in Settings',
      '• Use the searchable icon picker for accounts',
      '• Create custom colors for your accounts',
      '• Import/export your data anytime',
      '',
      'Need help? Click the Settings icon and select "Start Tutorial" anytime.',
      '',
      'Happy budgeting!',
    ],
  },
];

// State type
interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  hasCompleted: boolean;
  sampleAccountsCreated: boolean;
  sampleAccountIds: string[];
  sampleChainIds: string[];
  sampleTagIds: string[];
  sampleRuleIds: string[];
  hasBackedUpData: boolean;
}

// Action types
type TutorialAction =
  | { type: 'START_TUTORIAL' }
  | { type: 'STOP_TUTORIAL' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'MARK_SAMPLE_ACCOUNTS_CREATED'; payload: string[] }
  | { type: 'LOAD_STATE'; payload: Partial<TutorialState> }
  | { type: 'CLEAR_SAMPLE_IDS' }
  | { type: 'ADD_SAMPLE_CHAIN_ID'; payload: string }
  | { type: 'ADD_SAMPLE_TAG_ID'; payload: string }
  | { type: 'ADD_SAMPLE_RULE_ID'; payload: string }
  | { type: 'SET_BACKED_UP'; payload: boolean };

// Context type
interface TutorialContextType {
  state: TutorialState;
  currentStep: TutorialStep | null;
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  completeTutorial: () => void;
  markSampleAccountsCreated: (ids: string[]) => void;
  clearSampleIds: () => void;
  addSampleChainId: (id: string) => void;
  addSampleTagId: (id: string) => void;
  addSampleRuleId: (id: string) => void;
  backupExistingData: () => void;
  restoreBackedUpData: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
}

// Initial state
const initialState: TutorialState = {
  isActive: false,
  currentStepIndex: 0,
  hasCompleted: false,
  sampleAccountsCreated: false,
  sampleAccountIds: [],
  sampleChainIds: [],
  sampleTagIds: [],
  sampleRuleIds: [],
  hasBackedUpData: false,
};

// Reducer
function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
  switch (action.type) {
    case 'START_TUTORIAL':
      return { ...state, isActive: true, currentStepIndex: 0, sampleAccountsCreated: false, sampleAccountIds: [], sampleChainIds: [], sampleTagIds: [], sampleRuleIds: [] };
    case 'STOP_TUTORIAL':
      return { ...state, isActive: false };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStepIndex: Math.min(state.currentStepIndex + 1, TUTORIAL_STEPS.length - 1),
      };
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
      };
    case 'GO_TO_STEP':
      return {
        ...state,
        currentStepIndex: Math.max(0, Math.min(action.payload, TUTORIAL_STEPS.length - 1)),
      };
    case 'COMPLETE_TUTORIAL':
      return { ...state, isActive: false, hasCompleted: true };
    case 'MARK_SAMPLE_ACCOUNTS_CREATED':
      return { ...state, sampleAccountsCreated: true, sampleAccountIds: action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'CLEAR_SAMPLE_IDS':
      return { ...state, sampleAccountIds: [], sampleChainIds: [], sampleTagIds: [], sampleRuleIds: [], sampleAccountsCreated: false, hasBackedUpData: false };
    case 'ADD_SAMPLE_CHAIN_ID':
      return { ...state, sampleChainIds: [...state.sampleChainIds, action.payload] };
    case 'ADD_SAMPLE_TAG_ID':
      return { ...state, sampleTagIds: [...state.sampleTagIds, action.payload] };
    case 'ADD_SAMPLE_RULE_ID':
      return { ...state, sampleRuleIds: [...state.sampleRuleIds, action.payload] };
    case 'SET_BACKED_UP':
      return { ...state, hasBackedUpData: action.payload };
    default:
      return state;
  }
}

// Storage key for tutorial state
const TUTORIAL_STORAGE_KEY = 'budgetwise_tutorial';
const TUTORIAL_BACKUP_KEY = 'budgetwise_tutorial_backup';

// Create context
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Provider component
export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tutorialReducer, initialState);

  // Load saved state on mount
  useEffect(() => {
    const saved = getFromStorage<Partial<TutorialState>>(TUTORIAL_STORAGE_KEY as keyof typeof STORAGE_KEYS);
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: { ...saved, isActive: false } });
    }
  }, []);

  // Save state changes
  useEffect(() => {
    setToStorage(TUTORIAL_STORAGE_KEY as keyof typeof STORAGE_KEYS, {
      hasCompleted: state.hasCompleted,
      sampleAccountsCreated: state.sampleAccountsCreated,
    });
  }, [state.hasCompleted, state.sampleAccountsCreated]);

  const currentStep = state.isActive ? TUTORIAL_STEPS[state.currentStepIndex] : null;
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === TUTORIAL_STEPS.length - 1;
  const progress = ((state.currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100;

  // Backup existing data before starting tutorial
  const backupExistingData = useCallback(() => {
    const accounts = getFromStorage(STORAGE_KEYS.ACCOUNTS);
    const chains = getFromStorage(STORAGE_KEYS.CHAINS);
    const tags = getFromStorage(STORAGE_KEYS.TAGS);
    const rules = getFromStorage(STORAGE_KEYS.RULES);
    
    const backup = {
      accounts: accounts || [],
      chains: chains || [],
      tags: tags || [],
      rules: rules || [],
      timestamp: Date.now(),
    };
    
    setToStorage(TUTORIAL_BACKUP_KEY as keyof typeof STORAGE_KEYS, backup);
    dispatch({ type: 'SET_BACKED_UP', payload: true });
  }, []);

  // Restore backed up data after tutorial
  const restoreBackedUpData = useCallback(() => {
    const backup = getFromStorage<{
      accounts: unknown[];
      chains: unknown[];
      tags: unknown[];
      rules: unknown[];
    }>(TUTORIAL_BACKUP_KEY as keyof typeof STORAGE_KEYS);
    
    if (backup) {
      setToStorage(STORAGE_KEYS.ACCOUNTS, backup.accounts);
      setToStorage(STORAGE_KEYS.CHAINS, backup.chains);
      setToStorage(STORAGE_KEYS.TAGS, backup.tags);
      setToStorage(STORAGE_KEYS.RULES, backup.rules);
      
      // Clear the backup
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TUTORIAL_BACKUP_KEY);
      }
    }
    
    dispatch({ type: 'SET_BACKED_UP', payload: false });
  }, []);

  const startTutorial = useCallback(() => {
    dispatch({ type: 'START_TUTORIAL' });
  }, []);

  const stopTutorial = useCallback(() => {
    dispatch({ type: 'STOP_TUTORIAL' });
  }, []);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  }, [isLastStep]);

  const previousStep = useCallback(() => {
    dispatch({ type: 'PREVIOUS_STEP' });
  }, []);

  const goToStep = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_STEP', payload: index });
  }, []);

  const completeTutorial = useCallback(() => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
  }, []);

  const markSampleAccountsCreated = useCallback((ids: string[]) => {
    dispatch({ type: 'MARK_SAMPLE_ACCOUNTS_CREATED', payload: ids });
  }, []);

  const clearSampleIds = useCallback(() => {
    dispatch({ type: 'CLEAR_SAMPLE_IDS' });
  }, []);

  const addSampleChainId = useCallback((id: string) => {
    dispatch({ type: 'ADD_SAMPLE_CHAIN_ID', payload: id });
  }, []);

  const addSampleTagId = useCallback((id: string) => {
    dispatch({ type: 'ADD_SAMPLE_TAG_ID', payload: id });
  }, []);

  const addSampleRuleId = useCallback((id: string) => {
    dispatch({ type: 'ADD_SAMPLE_RULE_ID', payload: id });
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        state,
        currentStep,
        startTutorial,
        stopTutorial,
        nextStep,
        previousStep,
        goToStep,
        completeTutorial,
        markSampleAccountsCreated,
        clearSampleIds,
        addSampleChainId,
        addSampleTagId,
        addSampleRuleId,
        backupExistingData,
        restoreBackedUpData,
        isFirstStep,
        isLastStep,
        progress,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

// Hook to use tutorial context
export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
