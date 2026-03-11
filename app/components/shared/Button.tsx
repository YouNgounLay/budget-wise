'use client';

/**
 * Button Component
 * Reusable button with multiple variants
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-french-blue text-white hover:bg-yale-blue focus:ring-french-blue hover:shadow-lg hover:shadow-french-blue/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
  secondary:
    'bg-slate-200 text-jet-black hover:bg-slate-300 focus:ring-slate-400 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 hover:shadow-lg hover:shadow-slate-400/30 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 hover:shadow-lg hover:shadow-rose-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md',
  ghost:
    'bg-transparent text-jet-black hover:bg-slate-100 focus:ring-slate-400 dark:text-white dark:hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
