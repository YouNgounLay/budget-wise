'use client';

/**
 * Delete Confirmation Modal Component
 * Custom styled popup for delete confirmations
 */

import React, { useEffect, useRef } from 'react';
import { Button } from './Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  showUndoWarning?: boolean;
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  showUndoWarning = true,
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the cancel button when modal opens
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header with warning icon */}
        <div className="flex items-center justify-center pt-6 pb-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            confirmVariant === 'primary' 
              ? 'bg-french-blue/10 dark:bg-french-blue/20' 
              : 'bg-rose-100 dark:bg-rose-900/30'
          }`}>
            <WarningIcon className={`w-8 h-8 ${
              confirmVariant === 'primary' ? 'text-french-blue' : 'text-rose-500'
            }`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4 text-center">
          <h2
            id="delete-modal-title"
            className="text-xl font-bold text-foreground mb-2"
          >
            {title}
          </h2>
          
          <p className="text-muted mb-2">
            {message}
          </p>

          {itemName && (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mt-2 ${
              confirmVariant === 'primary'
                ? 'bg-french-blue/5 dark:bg-french-blue/10 border-french-blue/30 dark:border-french-blue/30'
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              <TrashIcon className={`w-4 h-4 ${
                confirmVariant === 'primary' ? 'text-french-blue' : 'text-rose-500'
              }`} />
              <span className={`font-semibold truncate max-w-[250px] ${
                confirmVariant === 'primary' 
                  ? 'text-french-blue dark:text-fresh-sky' 
                  : 'text-rose-700 dark:text-rose-300'
              }`}>
                {itemName}
              </span>
            </div>
          )}

          {showUndoWarning && (
            <p className={`text-sm mt-3 font-medium ${
              confirmVariant === 'primary' 
                ? 'text-french-blue dark:text-fresh-sky' 
                : 'text-rose-500 dark:text-rose-400'
            }`}>
              {confirmVariant === 'primary' ? '💡' : '⚠️'} {confirmVariant === 'primary' ? 'You can change this again anytime.' : 'This action cannot be undone.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all duration-200 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 ${
              confirmVariant === 'primary'
                ? 'bg-french-blue hover:bg-yale-blue active:bg-yale-blue focus:ring-french-blue'
                : 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 focus:ring-rose-400'
            }`}
          >
            {confirmVariant !== 'primary' && <TrashIcon className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
