'use client';

/**
 * Main Layout Component
 * Wrapper component that provides consistent layout structure
 */

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useTutorial } from '@/app/context/TutorialContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { startTutorial } = useTutorial();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="main-layout min-h-screen bg-background">
      <Header 
        isMobileMenuOpen={isMobileMenuOpen} 
        onToggleMobileMenu={toggleMobileMenu}
        onStartTutorial={startTutorial}
      />
      <div className="flex">
        <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
