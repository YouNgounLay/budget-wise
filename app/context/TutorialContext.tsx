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
      '💰 Deposit: Add money to an account',
      '💸 Withdraw: Remove money from an account',
      '',
      'Try it out:',
      '1. Click the deposit button (↓) on any account',
      '2. Enter $300 and confirm',
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
      '🔗 Chains are powerful! They let you:',
      '',
      '• Set a priority order for your accounts',
      '• Automatically distribute deposits across accounts',
      '• Define limits for each account in the chain',
      '',
      'Create a chain with this order:',
      '1. Grocery → 2. Rent → 3. Mortgage → 4. Emergency Fund → 5. Excess Saving',
      '',
      'When you deposit to this chain, funds flow from first to last,',
      'filling each account up to its limit before moving to the next.',
    ],
  },
  {
    id: 'setup-rules',
    title: 'Step 5: Set Up Automatic Rules',
    description: 'Rules automate your fund allocation.',
    targetPage: '/rules',
    content: [
      '📅 Rules run automatically on a schedule:',
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
    description: 'Use tags to categorize your accounts.',
    targetPage: '/tags',
    content: [
      '🏷️ Tags help you organize accounts:',
      '',
      '• Create custom tags with colors',
      '• Assign multiple tags to each account',
      '• Filter and group accounts by tags',
      '',
      'Example tags:',
      '• "Essential" - for must-pay bills',
      '• "Savings" - for saving goals',
      '• "Discretionary" - for optional spending',
      '',
      'Click on any account to assign tags!',
    ],
  },
  {
    id: 'complete',
    title: '🎉 Tutorial Complete!',
    description: 'You\'re ready to manage your budget!',
    targetPage: '/',
    content: [
      'Congratulations! You\'ve learned the basics of BudgetWise.',
      '',
      '📌 Quick recap:',
      '• Accounts hold your budget categories',
      '• Chains automatically distribute deposits',
      '• Rules automate periodic transfers',
      '• Tags help organize everything',
      '',
      'Need help? Click the gear icon (⚙️) and select "Start Tutorial" anytime.',
      '',
      'Happy budgeting! 💰',
    ],
  },
];

// State type
interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  hasCompleted: boolean;
  sampleAccountsCreated: boolean;
}

// Action types
type TutorialAction =
  | { type: 'START_TUTORIAL' }
  | { type: 'STOP_TUTORIAL' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'MARK_SAMPLE_ACCOUNTS_CREATED' }
  | { type: 'LOAD_STATE'; payload: Partial<TutorialState> };

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
  markSampleAccountsCreated: () => void;
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
};

// Reducer
function tutorialReducer(state: TutorialState, action: TutorialAction): TutorialState {
  switch (action.type) {
    case 'START_TUTORIAL':
      return { ...state, isActive: true, currentStepIndex: 0 };
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
      return { ...state, sampleAccountsCreated: true };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Storage key for tutorial state
const TUTORIAL_STORAGE_KEY = 'budgetwise_tutorial';

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

  const markSampleAccountsCreated = useCallback(() => {
    dispatch({ type: 'MARK_SAMPLE_ACCOUNTS_CREATED' });
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
