'use client';

/**
 * Providers Component
 * Wraps the application with all necessary context providers
 */

import React from 'react';
import { AccountProvider } from './context/AccountContext';
import { ChainProvider } from './context/ChainContext';
import { RuleProvider } from './context/RuleContext';
import { TagProvider } from './context/TagContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeCustomizationProvider } from './context/ThemeCustomizationContext';
import { TutorialProvider } from './context/TutorialContext';
import { TutorialOverlay } from './components/tutorial';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ThemeCustomizationProvider>
        <TagProvider>
          <AccountProvider>
            <ChainProvider>
              <RuleProvider>
                <TutorialProvider>
                  {children}
                  <TutorialOverlay />
                </TutorialProvider>
              </RuleProvider>
            </ChainProvider>
          </AccountProvider>
        </TagProvider>
      </ThemeCustomizationProvider>
    </ThemeProvider>
  );
}
