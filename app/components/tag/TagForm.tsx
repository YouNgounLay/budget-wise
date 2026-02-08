'use client';

/**
 * Tag Form Component
 * Modal form for creating/editing tags
 */

import React, { useState, useEffect } from 'react';
import { Tag, CreateTagDTO } from '@/app/types/tag';
import { AccountColor, ACCOUNT_COLORS } from '@/app/types/account';
import { Button, Input, Modal } from '@/app/components/shared';
import { ColorPicker } from '@/app/components/account/ColorPicker';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTagDTO) => void;
  tag?: Tag;
}

const defaultFormData: CreateTagDTO = {
  name: '',
  color: 'french-blue',
  customColor: '#4a86e8',
};

export function TagForm({ isOpen, onClose, onSubmit, tag }: TagFormProps) {
  const [formData, setFormData] = useState<CreateTagDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTagDTO, string>>>({});

  // Reset form when modal opens/closes or tag changes
  useEffect(() => {
    if (isOpen && tag) {
      setFormData({
        name: tag.name,
        color: tag.color,
        customColor: tag.customColor || '#4a86e8',
      });
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [isOpen, tag]);

  const handleChange = (field: keyof CreateTagDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTagDTO, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
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
    });

    onClose();
  };

  const modalTitle = tag ? 'Edit Tag' : 'Create Tag';

  // Get current color for preview
  const currentColor = formData.color === 'custom' && formData.customColor
    ? formData.customColor
    : ACCOUNT_COLORS[formData.color];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <span
            className="px-4 py-2 rounded-full text-white font-medium"
            style={{ backgroundColor: currentColor }}
          >
            {formData.name || 'Tag Preview'}
          </span>
        </div>

        <Input
          label="Tag Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Essentials, Monthly Bills"
          error={errors.name}
          required
        />

        <ColorPicker
          label="Tag Color"
          value={formData.color}
          onChange={(color: AccountColor) => handleChange('color', color)}
          customColorValue={formData.customColor}
          onCustomColorChange={(hex) => handleChange('customColor', hex)}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {tag ? 'Save Changes' : 'Create Tag'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
