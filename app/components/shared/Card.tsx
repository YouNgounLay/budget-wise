'use client';

/**
 * Card Component
 * Reusable card container with optional header
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-slate-800 
        rounded-xl shadow-md 
        border border-slate-200 dark:border-slate-700
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={`
        pb-3 mb-3 
        border-b border-slate-200 dark:border-slate-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={`
        pt-3 mt-3 
        border-t border-slate-200 dark:border-slate-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}
