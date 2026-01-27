'use client';

/**
 * Providers Component
 * Wraps the application with all necessary context providers
 */

import React from 'react';
import { AccountProvider } from './context/AccountContext';
import { ChainProvider } from './context/ChainContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AccountProvider>
      <ChainProvider>{children}</ChainProvider>
    </AccountProvider>
  );
}
