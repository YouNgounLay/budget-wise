'use client';

/**
 * Reusable Icons Component
 * Custom SVG icons for consistent UI across the application
 * Following DRY principle - icons are defined once and reused everywhere
 */

import React from 'react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

/**
 * Search/All Icon - Magnifying glass for general search
 */
export function SearchAllIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" 
      />
    </svg>
  );
}

/**
 * Wallet/Money Icon - For accounts and financial items
 */
export function WalletIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" 
      />
    </svg>
  );
}

/**
 * Chain Link Icon - For chains and linked items
 */
export function ChainLinkIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" 
      />
    </svg>
  );
}

/**
 * Tag Icon - For tags and labels
 */
export function TagIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={1.5} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M6 6h.008v.008H6V6z" 
      />
    </svg>
  );
}

/**
 * Check Icon - For success/confirmation states
 */
export function CheckIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4.5 12.75l6 6 9-13.5" 
      />
    </svg>
  );
}

/**
 * Chevron Down Icon - For dropdowns and expandable sections
 */
export function ChevronDownIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M19 9l-7 7-7-7" 
      />
    </svg>
  );
}

/**
 * Deposit Icon - Down arrow for deposits
 */
export function DepositIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" 
      />
    </svg>
  );
}

/**
 * Withdraw Icon - Up arrow for withdrawals
 */
export function WithdrawIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg 
      className={className || sizeClasses[size]} 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" 
      />
    </svg>
  );
}
