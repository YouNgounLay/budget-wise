'use client';

/**
 * Tutorial Overlay Component
 * Interactive step-by-step tutorial similar to Codecademy
 * Uses a non-blocking sidebar approach instead of modal
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTutorial, TUTORIAL_STEPS } from '@/app/context/TutorialContext';
import { useAccounts } from '@/app/context/AccountContext';
import { useChains } from '@/app/context/ChainContext';
import { useTags } from '@/app/context/TagContext';
import { useRules } from '@/app/context/RuleContext';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function TutorialOverlay() {
  const router = useRouter();
  const {
    state,
    currentStep,
    stopTutorial,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    progress,
    markSampleAccountsCreated,
    clearSampleIds,
    backupExistingData,
    restoreBackedUpData,
  } = useTutorial();
  const { createAccount, deleteAccount, state: accountState } = useAccounts();
  const { deleteChain, state: chainState } = useChains();
  const { deleteTag, state: tagState } = useTags();
  const { deleteRule, state: ruleState } = useRules();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  // Backup existing data when tutorial starts (on welcome step)
  useEffect(() => {
    if (
      state.isActive &&
      currentStep?.id === 'welcome' &&
      !state.hasBackedUpData
    ) {
      backupExistingData();
    }
  }, [state.isActive, currentStep?.id, state.hasBackedUpData, backupExistingData]);

  // Create sample accounts when on step 1
  useEffect(() => {
    if (
      state.isActive &&
      currentStep?.id === 'create-accounts' &&
      !state.sampleAccountsCreated
    ) {
      // Create sample accounts and track their IDs
      const sampleAccounts = [
        { name: 'Grocery', description: 'Weekly grocery shopping', amount: 100, icon: 'grocery' as const, color: 'emerald' as const },
        { name: 'Rent', description: 'Monthly rent payment', amount: 500, icon: 'home' as const, color: 'yale-blue' as const },
        { name: 'Mortgage', description: 'Home mortgage payments', amount: 10000, icon: 'building' as const, color: 'french-blue' as const },
        { name: 'Excess Saving', description: 'Extra savings', amount: 500, icon: 'piggy-bank' as const, color: 'fresh-sky' as const },
        { name: 'Emergency Fund', description: 'For unexpected expenses', amount: 3000, icon: 'emergency' as const, color: 'rose' as const },
      ];

      const createdIds: string[] = [];
      sampleAccounts.forEach((account) => {
        const newAccount = createAccount(account);
        if (newAccount) {
          createdIds.push(newAccount.id);
        }
      });

      markSampleAccountsCreated(createdIds);
    }
  }, [state.isActive, currentStep?.id, state.sampleAccountsCreated, createAccount, markSampleAccountsCreated]);

  // Navigate to the target page when step changes
  useEffect(() => {
    if (state.isActive && currentStep?.targetPage) {
      router.push(currentStep.targetPage);
    }
  }, [state.isActive, currentStep?.targetPage, router]);

  // Handle exiting tutorial early - restore backed up data
  const handleExitTutorial = () => {
    // Restore original data when exiting early
    if (state.hasBackedUpData) {
      restoreBackedUpData();
      // Reload the page to refresh all contexts with restored data
      window.location.reload();
    } else {
      stopTutorial();
    }
  };

  // Handle tutorial finish - show cleanup confirmation
  const handleFinish = () => {
    if (isLastStep) {
      setShowCleanupConfirm(true);
    } else {
      nextStep();
    }
  };

  // Clear only tutorial-created data OR restore original data
  const handleCleanup = (restoreOriginal: boolean) => {
    if (restoreOriginal && state.hasBackedUpData) {
      // Restore original backed up data
      restoreBackedUpData();
      clearSampleIds();
      // Reload the page to refresh all contexts with restored data
      window.location.reload();
    } else {
      // User wants to keep the tutorial data - just complete without restoring
      clearSampleIds();
      setShowCleanupConfirm(false);
      nextStep(); // This will trigger completeTutorial since we're on last step
    }
  };

  if (!state.isActive || !currentStep) return null;

  // Cleanup confirmation dialog
  if (showCleanupConfirm) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-french-blue/10 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Tutorial Complete!
            </h2>
            <p className="text-muted mb-4">
              What would you like to do with your data?
            </p>
            <p className="text-sm text-muted mb-6">
              You can keep the tutorial data to explore more, or restore your original data that was saved before starting the tutorial.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCleanup(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Keep Tutorial Data
              </button>
              <button
                onClick={() => handleCleanup(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-french-blue text-white font-medium hover:bg-french-blue/90 transition-all"
              >
                Restore My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimized state - show floating button
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 bg-french-blue text-white rounded-full shadow-lg hover:bg-french-blue/90 hover:scale-105 transition-all duration-200"
      >
        <span className="text-lg">📖</span>
        <span className="font-medium">Resume Tutorial</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
          {state.currentStepIndex + 1}/{TUTORIAL_STEPS.length}
        </span>
      </button>
    );
  }

  return (
    <>
      {/* Semi-transparent backdrop - clickable to minimize */}
      <div 
        className="fixed inset-0 bg-black/20 z-[99] lg:hidden"
        onClick={() => setIsMinimized(true)}
      />

      {/* Tutorial Panel - Sidebar style on desktop, bottom sheet on mobile */}
      <div className="fixed z-[100] 
        bottom-0 left-0 right-0 max-h-[70vh]
        lg:top-20 lg:bottom-auto lg:right-6 lg:left-auto lg:max-h-[calc(100vh-6rem)] lg:w-[380px]
        bg-surface rounded-t-2xl lg:rounded-2xl shadow-2xl border border-border overflow-hidden
        animate-in slide-in-from-bottom lg:slide-in-from-right duration-300
      ">
        {/* Header */}
        <div className="bg-gradient-to-r from-french-blue to-fresh-sky text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📖</span>
              <span className="font-bold">Tutorial</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-sm"
                title="Minimize"
              >
                Minimize
              </button>
              <button
                onClick={handleExitTutorial}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Exit tutorial"
                title="Exit tutorial"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{currentStep.title}</span>
              <span className="opacity-80">{state.currentStepIndex + 1}/{TUTORIAL_STEPS.length}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-border">
          {TUTORIAL_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
                ${index === state.currentStepIndex 
                  ? 'bg-french-blue text-white scale-110 shadow-md' 
                  : index < state.currentStepIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-muted'
                }
              `}
              title={step.title}
            >
              {index < state.currentStepIndex ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[40vh] lg:max-h-[50vh]">
          <p className="text-sm text-muted mb-3">{currentStep.description}</p>
          
          <div className="space-y-2.5">
            {currentStep.content.map((line, index) => {
              if (line === '') return <div key={index} className="h-2" />;
              
              const isListItem = line.startsWith('•') || line.startsWith('✅') || /^\d\./.test(line);
              const isHighlight = line.startsWith('✅');
              
              return (
                <p
                  key={index}
                  className={`
                    text-sm text-foreground
                    ${isListItem ? 'pl-4' : ''}
                    ${isHighlight ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
                  `}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={stopTutorial}
              className="text-sm text-muted hover:text-rose-500 transition-colors font-medium"
            >
              Exit Tutorial
            </button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={previousStep}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-foreground hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button
                onClick={handleFinish}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-french-blue text-white font-medium hover:bg-french-blue/90 transition-all shadow-md hover:shadow-lg"
              >
                <span>{isLastStep ? '🎉 Finish' : 'Next'}</span>
                {!isLastStep && <ChevronRightIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
