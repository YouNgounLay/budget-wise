'use client';

/**
 * Account Form Component
 * Form for creating/editing accounts
 */

import React, { useState, useEffect } from 'react';
import {
  Account,
  CreateAccountDTO,
  AccountIcon,
  AccountColor,
  ACCOUNT_ICONS,
  ACCOUNT_COLORS,
} from '@/app/types/account';
import { Button, Input, Modal } from '@/app/components/shared';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountDTO) => void;
  account?: Account;
  title?: string;
}

const defaultFormData: CreateAccountDTO = {
  name: '',
  description: '',
  amount: 0,
  icon: 'money',
  color: 'french-blue',
  customColor: '#4a86e8',
};

export function AccountForm({
  isOpen,
  onClose,
  onSubmit,
  account,
  title,
}: AccountFormProps) {
  const [formData, setFormData] = useState<CreateAccountDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAccountDTO, string>>>({});
  const [showAppearance, setShowAppearance] = useState(false);

  // Reset form when modal opens/closes or account changes
  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        name: account.name,
        description: account.description,
        amount: account.amount,
        icon: account.icon,
        color: account.color,
        customColor: account.customColor || '#4a86e8',
      });
      setShowAppearance(false);
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setShowAppearance(false);
    }
  }, [isOpen, account]);

  const handleChange = (field: keyof CreateAccountDTO, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateAccountDTO, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });

    onClose();
  };

  const modalTitle = title || (account ? 'Edit Account' : 'Create Account');
  
  // Get current icon and color for preview
  const currentIcon = ACCOUNT_ICONS[formData.icon];
  const currentColor = formData.color === 'custom' && formData.customColor 
    ? formData.customColor 
    : ACCOUNT_COLORS[formData.color];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Grocery Budget"
          error={errors.name}
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What is this account for?"
          helperText="A short description to help you remember the purpose"
        />

        <Input
          label="Initial Amount"
          type="number"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
          min={0}
          step={0.01}
          error={errors.amount}
        />

        {/* Appearance Section */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAppearance(!showAppearance)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Preview of current icon and color */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: currentColor }}
              >
                <span className="drop-shadow-sm">{currentIcon}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-jet-black dark:text-white">
                  Appearance
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Icon & Color
                </p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-slate-500 transition-transform ${showAppearance ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAppearance && (
            <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
              <IconPicker
                label="Select Icon"
                value={formData.icon}
                onChange={(icon: AccountIcon) => handleChange('icon', icon)}
              />

              <ColorPicker
                label="Select Color"
                value={formData.color}
                onChange={(color: AccountColor) => handleChange('color', color)}
                customColorValue={formData.customColor}
                onCustomColorChange={(hex) => handleChange('customColor', hex)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {account ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
