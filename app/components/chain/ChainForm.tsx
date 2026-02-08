'use client';

/**
 * Chain Form Component
 * Form for creating/editing chains
 */

import React, { useState, useEffect } from 'react';
import { Chain, CreateChainDTO } from '@/app/types/chain';
import { Button, Input, Modal } from '@/app/components/shared';

interface ChainFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChainDTO) => void;
  chain?: Chain;
  title?: string;
}

const defaultFormData: CreateChainDTO = {
  name: '',
  description: '',
  defaultLimit: 2000,
};

export function ChainForm({
  isOpen,
  onClose,
  onSubmit,
  chain,
  title,
}: ChainFormProps) {
  const [formData, setFormData] = useState<CreateChainDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChainDTO, string>>>({});

  // Reset form when modal opens/closes or chain changes
  useEffect(() => {
    if (isOpen && chain) {
      setFormData({
        name: chain.name,
        description: chain.description,
        defaultLimit: chain.defaultLimit,
      });
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [isOpen, chain]);

  const handleChange = (field: keyof CreateChainDTO, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateChainDTO, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Chain name is required';
    }

    if ((formData.defaultLimit ?? 0) < 0) {
      newErrors.defaultLimit = 'Default limit cannot be negative';
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

  const modalTitle = title || (chain ? 'Edit Chain' : 'Create Chain');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Chain Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Monthly Savings"
          error={errors.name}
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What is this chain for?"
          helperText="Describe the purpose of this deposit chain"
        />

        <Input
          label="Default Account Limit"
          type="number"
          value={formData.defaultLimit}
          onChange={(e) => handleChange('defaultLimit', parseFloat(e.target.value) || 0)}
          min={0}
          step={100}
          error={errors.defaultLimit}
          helperText="Default limit for each account in this chain"
        />

        <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {chain ? 'Save Changes' : 'Create Chain'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
