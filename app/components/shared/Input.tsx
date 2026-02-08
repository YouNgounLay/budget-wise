'use client';

/**
 * Input Component
 * Reusable form input with label and error handling
 */

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="input-group">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-jet-black dark:text-white mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          autoComplete="off"
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors duration-200
            bg-surface text-foreground
            focus:outline-none focus:ring-2 focus:ring-french-blue focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
