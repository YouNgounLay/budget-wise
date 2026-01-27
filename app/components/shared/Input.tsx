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
          style={{
            width: '100%',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: error ? '1px solid #f43f5e' : '1px solid #cbd5e1',
            backgroundColor: 'white',
            color: '#122C34',
            outline: 'none',
          }}
          className={className}
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
