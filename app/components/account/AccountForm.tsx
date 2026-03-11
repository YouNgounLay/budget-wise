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
  AccountItem,
  ACCOUNT_COLORS,
} from '@/app/types/account';
import { Tag, CreateTagDTO } from '@/app/types/tag';
import { Button, Input, Modal } from '@/app/components/shared';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { TagPicker } from '@/app/components/tag/TagPicker';
import { generateId } from '@/app/utils/helpers';
import { getLucideIcon } from '@/app/utils/lucideIconMap';
import { ClipboardList, ChevronDown, X, Trash2, Palette } from 'lucide-react';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountDTO) => void;
  onDelete?: () => void;
  account?: Account;
  title?: string;
  availableTags?: Tag[];
  onCreateTag?: (data: CreateTagDTO) => void;
  existingAccounts?: Account[];
}

const defaultFormData: CreateAccountDTO = {
  name: '',
  description: '',
  amount: 0,
  icon: 'money',
  customEmoji: undefined,
  color: 'french-blue',
  customColor: '#4a86e8',
  tagIds: [],
  items: [],
};

export function AccountForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  account,
  title,
  availableTags = [],
  onCreateTag,
  existingAccounts = [],
}: AccountFormProps) {
  const [formData, setFormData] = useState<CreateAccountDTO>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateAccountDTO, string>>>({});
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  // Reset form when modal opens/closes or account changes
  useEffect(() => {
    if (isOpen && account) {
      setFormData({
        name: account.name,
        description: account.description,
        amount: account.amount,
        icon: account.icon,
        customEmoji: account.customEmoji,
        color: account.color,
        customColor: account.customColor || '#4a86e8',
        tagIds: account.tagIds || [],
        items: account.items || [],
      });
      setShowIconPicker(false);
      setShowColorPicker(false);
      setShowItems((account.items?.length || 0) > 0);
    } else if (!isOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setShowIconPicker(false);
      setShowColorPicker(false);
      setShowItems(false);
      setNewItemName('');
      setNewItemCost('');
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
    } else {
      // Check for duplicate name (case-insensitive)
      const normalizedName = formData.name.trim().toLowerCase();
      const duplicate = existingAccounts.find(
        (acc) => acc.name.toLowerCase() === normalizedName && acc.id !== account?.id
      );
      if (duplicate) {
        newErrors.name = 'An account with this name already exists';
      }
    }

    // Note: Negative amounts are allowed for debt/liability accounts

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
  const IconComponent = getLucideIcon(formData.icon);
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
          onChange={(e) => {
            const value = e.target.value;
            // Allow empty string temporarily, parse to number
            // Using parseFloat with fallback to 0 for empty/invalid input
            const numValue = value === '' ? 0 : parseFloat(value);
            handleChange('amount', isNaN(numValue) ? 0 : numValue);
          }}
          step={1}
          error={errors.amount}
          helperText="Use negative amounts for debt/liability accounts"
        />

        {/* Icon Picker Section */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Preview of current icon */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-french-blue/20"
              >
                <IconComponent className="w-5 h-5 text-french-blue" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-jet-black dark:text-white">
                  Icon
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {formData.icon.replace('-', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-500 transition-transform ${showIconPicker ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
          
          {showIconPicker && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
              <IconPicker
                value={formData.icon}
                onChange={(icon: AccountIcon) => {
                  setFormData((prev) => ({ 
                    ...prev, 
                    icon
                  }));
                }}
              />
            </div>
          )}
        </div>

        {/* Color Picker Section */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Preview of current color */}
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: currentColor }}
              >
                <Palette className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-jet-black dark:text-white">
                  Color
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {formData.color === 'custom' ? 'Custom' : formData.color.replace('-', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-500 transition-transform ${showColorPicker ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
          
          {showColorPicker && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto">
              <ColorPicker
                value={formData.color}
                onChange={(color: AccountColor) => handleChange('color', color)}
                customColorValue={formData.customColor}
                onCustomColorChange={(hex) => handleChange('customColor', hex)}
              />
            </div>
          )}
        </div>

        {/* Items Section - Toggleable list of cost items */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-jet-black dark:text-white">
                  Cost Items
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(formData.items?.length || 0)} item{(formData.items?.length || 0) !== 1 ? 's' : ''} added
                </p>
              </div>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-slate-500 transition-transform ${showItems ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
          
          {showItems && (
            <div className="p-4 space-y-3 border-t border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add items associated with this account (e.g., Gym Membership, Entry Pass, Equipment).
              </p>
              
              {/* Item list */}
              {(formData.items?.length || 0) > 0 && (
                <div className="space-y-2">
                  {formData.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <span className="text-sm font-medium text-foreground">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">${item.cost.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              items: prev.items?.filter((i) => i.id !== item.id),
                            }));
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
                        >
                          <X className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Total cost */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600">
                    <span className="text-sm font-medium text-muted">Total Items Cost:</span>
                    <span className="text-sm font-bold text-foreground">
                      ${formData.items?.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Add new item form */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    placeholder="$"
                    min={0}
                    step={10}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (newItemName.trim() && newItemCost) {
                      const newItem: AccountItem = {
                        id: generateId(),
                        name: newItemName.trim(),
                        cost: parseFloat(newItemCost) || 0,
                      };
                      setFormData((prev) => ({
                        ...prev,
                        items: [...(prev.items || []), newItem],
                      }));
                      setNewItemName('');
                      setNewItemCost('');
                    }
                  }}
                  disabled={!newItemName.trim() || !newItemCost}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tags Section */}
        {availableTags && onCreateTag && (
          <TagPicker
            label="Tags"
            availableTags={availableTags}
            selectedTagIds={formData.tagIds || []}
            onAddTag={(tagId) => {
              setFormData((prev) => ({
                ...prev,
                tagIds: [...(prev.tagIds || []), tagId],
              }));
            }}
            onRemoveTag={(tagId) => {
              setFormData((prev) => ({
                ...prev,
                tagIds: (prev.tagIds || []).filter((id) => id !== tagId),
              }));
            }}
            onCreateTag={onCreateTag}
          />
        )}

        {/* Delete Account Button - Only show when editing */}
        {account && onDelete && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              Delete Account
            </button>
          </div>
        )}

        {/* Scroll padding to ensure content can scroll past dropdown overlays */}
        <div className="h-32 shrink-0" aria-hidden="true" />

        {/* Sticky footer for action buttons */}
        <div className="flex gap-3 pt-4 sticky bottom-0 bg-surface pb-1">
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
