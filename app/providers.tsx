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
              <RuleProvider>{children}</RuleProvider>
            </ChainProvider>
          </AccountProvider>
        </TagProvider>
      </ThemeCustomizationProvider>
    </ThemeProvider>
  );
}
