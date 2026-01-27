'use client';

/**
 * Main Layout Component
 * Wrapper component that provides consistent layout structure
 */

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
