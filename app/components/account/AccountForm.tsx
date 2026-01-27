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

  // Reset form when modal opens/closes or account changes
  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        name: account.name,
        description: account.description,
        amount: account.amount,
        icon: account.icon,
        color: account.color,
      });
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
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

        <IconPicker
          label="Select Icon"
          value={formData.icon}
          onChange={(icon: AccountIcon) => handleChange('icon', icon)}
        />

        <ColorPicker
          label="Select Color"
          value={formData.color}
          onChange={(color: AccountColor) => handleChange('color', color)}
        />

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
