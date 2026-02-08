'use client';

/**
 * Tutorial Overlay Component
 * Displays the tutorial step content with navigation
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTutorial, TUTORIAL_STEPS } from '@/app/context/TutorialContext';
import { useAccounts } from '@/app/context/AccountContext';
import { Button } from '@/app/components/shared';

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
  } = useTutorial();
  const { createAccount } = useAccounts();

  // Create sample accounts when on step 1
  useEffect(() => {
    if (
      state.isActive &&
      currentStep?.id === 'create-accounts' &&
      !state.sampleAccountsCreated
    ) {
      // Create sample accounts
      const sampleAccounts = [
        { name: 'Grocery', description: 'Weekly grocery shopping', amount: 100, icon: 'grocery' as const, color: 'emerald' as const },
        { name: 'Rent', description: 'Monthly rent payment', amount: 500, icon: 'home' as const, color: 'yale-blue' as const },
        { name: 'Mortgage', description: 'Home mortgage payments', amount: 10000, icon: 'building' as const, color: 'french-blue' as const },
        { name: 'Excess Saving', description: 'Extra savings', amount: 500, icon: 'piggy-bank' as const, color: 'fresh-sky' as const },
        { name: 'Emergency Fund', description: 'For unexpected expenses', amount: 3000, icon: 'emergency' as const, color: 'rose' as const },
      ];

      sampleAccounts.forEach((account) => {
        createAccount(account);
      });

      markSampleAccountsCreated();
    }
  }, [state.isActive, currentStep?.id, state.sampleAccountsCreated, createAccount, markSampleAccountsCreated]);

  // Navigate to the target page when step changes
  useEffect(() => {
    if (state.isActive && currentStep?.targetPage) {
      router.push(currentStep.targetPage);
    }
  }, [state.isActive, currentStep?.targetPage, router]);

  if (!state.isActive || !currentStep) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[100]" />

      {/* Tutorial Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-border">
          {/* Header */}
          <div className="bg-french-blue text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <h2 className="font-bold text-lg">{currentStep.title}</h2>
                  <p className="text-sm opacity-90">{currentStep.description}</p>
                </div>
              </div>
              <button
                onClick={stopTutorial}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Exit tutorial"
                title="Exit tutorial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Step {state.currentStepIndex + 1} of {TUTORIAL_STEPS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="space-y-2">
              {currentStep.content.map((line, index) => (
                <p
                  key={index}
                  className={`text-foreground ${line === '' ? 'h-2' : ''} ${
                    line.startsWith('•') || line.startsWith('✅') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')
                      ? 'pl-4'
                      : ''
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={stopTutorial}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Exit Tutorial
              </button>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="secondary" onClick={previousStep}>
                    ← Back
                  </Button>
                )}
                <Button onClick={nextStep}>
                  {isLastStep ? 'Finish' : 'Next →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
