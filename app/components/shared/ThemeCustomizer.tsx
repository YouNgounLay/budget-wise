'use client';

/**
 * Theme Customizer Component
 * Modal for creating and editing theme profiles
 * Simplified with basic (2-3 colors) and advanced options
 */

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '@/app/components/shared';
import { useThemeCustomization } from '@/app/context/ThemeCustomizationContext';
import { useTheme } from '@/app/context/ThemeContext';
import {
  ThemeProfile,
  ThemeColors,
  PRESET_THEMES,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
} from '@/app/types/theme';

// Icon Components
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile?: ThemeProfile;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600"
      />
      <div className="flex-1">
        <label className="block text-sm font-medium text-jet-black dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleTextChange}
        className="w-24 px-2 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-french-blue"
        maxLength={7}
      />
    </div>
  );
}

export function ThemeCustomizer({ isOpen, onClose, editingProfile }: ThemeCustomizerProps) {
  const { createProfile, updateProfile, setActiveProfile } = useThemeCustomization();
  const { theme } = useTheme();
  
  const [name, setName] = useState('');
  const [lightColors, setLightColors] = useState<ThemeColors>(DEFAULT_LIGHT_COLORS);
  const [darkColors, setDarkColors] = useState<ThemeColors>(DEFAULT_DARK_COLORS);
  const [activeTab, setActiveTab] = useState<'light' | 'dark'>('light');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        setName(editingProfile.name);
        setLightColors(editingProfile.lightColors);
        setDarkColors(editingProfile.darkColors);
      } else {
        setName('');
        setLightColors(DEFAULT_LIGHT_COLORS);
        setDarkColors(DEFAULT_DARK_COLORS);
      }
      setActiveTab(theme);
      setShowAdvanced(false);
      setError('');
    }
  }, [isOpen, editingProfile, theme]);

  const updateLightColor = (key: keyof ThemeColors, value: string) => {
    setLightColors(prev => ({ ...prev, [key]: value }));
  };

  const updateDarkColor = (key: keyof ThemeColors, value: string) => {
    setDarkColors(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetSelect = (preset: typeof PRESET_THEMES[0]) => {
    setLightColors(preset.lightColors);
    setDarkColors(preset.darkColors);
    if (!name) {
      setName(preset.name + ' (Custom)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a profile name');
      return;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, { name: name.trim(), lightColors, darkColors });
    } else {
      const newProfile = createProfile({ name: name.trim(), lightColors, darkColors });
      setActiveProfile(newProfile.id);
    }
    
    onClose();
  };

  const currentColors = activeTab === 'light' ? lightColors : darkColors;
  const updateColor = activeTab === 'light' ? updateLightColor : updateDarkColor;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProfile ? 'Edit Theme Profile' : 'Create Theme Profile'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Profile Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Custom Theme"
          error={error}
          required
        />

        {/* Preset selector */}
        <div>
          <label className="block text-sm font-medium text-jet-black dark:text-white mb-2">
            Start from Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_THEMES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: preset.lightColors.primary }}
                  />
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('light')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'light'
                ? 'border-french-blue text-french-blue'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <SunIcon className="w-4 h-4" />
            Light Mode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dark')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dark'
                ? 'border-french-blue text-french-blue'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <MoonIcon className="w-4 h-4" />
            Dark Mode
          </button>
        </div>

        {/* Basic Colors (2-3 main colors) */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-jet-black dark:text-white">Basic Colors</p>
          <ColorInput
            label="Background"
            description="Page background color"
            value={currentColors.background}
            onChange={(v) => updateColor('background', v)}
          />
          <ColorInput
            label="Text"
            description="Main text color"
            value={currentColors.foreground}
            onChange={(v) => updateColor('foreground', v)}
          />
          <ColorInput
            label="Primary"
            description="Buttons, links, and highlights"
            value={currentColors.primary}
            onChange={(v) => updateColor('primary', v)}
          />
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-french-blue dark:hover:text-fresh-sky transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          Advanced Options
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Advanced Colors */}
        {showAdvanced && (
          <div className="space-y-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            <ColorInput
              label="Secondary"
              description="Secondary buttons and elements"
              value={currentColors.secondary}
              onChange={(v) => updateColor('secondary', v)}
            />
            <ColorInput
              label="Accent"
              description="Decorative highlights"
              value={currentColors.accent}
              onChange={(v) => updateColor('accent', v)}
            />
            <ColorInput
              label="Muted"
              description="Subtle text and borders"
              value={currentColors.muted}
              onChange={(v) => updateColor('muted', v)}
            />
          </div>
        )}

        {/* Preview */}
        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className="p-4"
            style={{ backgroundColor: currentColors.background }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: currentColors.foreground }}>
              Preview
            </p>
            <div className="flex gap-2 mb-2">
              <span
                className="px-3 py-1 rounded text-white text-sm"
                style={{ backgroundColor: currentColors.primary }}
              >
                Primary
              </span>
              {showAdvanced && (
                <>
                  <span
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: currentColors.secondary }}
                  >
                    Secondary
                  </span>
                  <span
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: currentColors.accent }}
                  >
                    Accent
                  </span>
                </>
              )}
            </div>
            <p className="text-sm" style={{ color: currentColors.muted }}>
              This is muted text for less emphasis.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            {editingProfile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}