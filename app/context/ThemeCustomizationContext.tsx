'use client';

/**
 * Theme Customization Context
 * Manages custom theme profiles with light/dark mode support
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  ThemeProfile,
  ThemeColors,
  CreateThemeProfileDTO,
  PRESET_THEMES,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_DARK_COLORS,
} from '@/app/types/theme';
import { generateId, getCurrentTimestamp } from '@/app/utils/helpers';

const PROFILES_STORAGE_KEY = 'budgetwise-theme-profiles';
const ACTIVE_PROFILE_KEY = 'budgetwise-active-profile';

interface ThemeCustomizationContextValue {
  profiles: ThemeProfile[];
  activeProfile: ThemeProfile | null;
  createProfile: (data: CreateThemeProfileDTO) => ThemeProfile;
  updateProfile: (id: string, data: Partial<CreateThemeProfileDTO>) => ThemeProfile | null;
  deleteProfile: (id: string) => boolean;
  setActiveProfile: (id: string) => void;
  applyThemeColors: (colors: ThemeColors) => void;
  resetToDefault: () => void;
}

const ThemeCustomizationContext = createContext<ThemeCustomizationContextValue | undefined>(undefined);

// Create default profile
function createDefaultProfile(): ThemeProfile {
  const timestamp = getCurrentTimestamp();
  return {
    id: 'default',
    name: 'Default',
    lightColors: DEFAULT_LIGHT_COLORS,
    darkColors: DEFAULT_DARK_COLORS,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

// Load profiles from storage
function loadProfiles(): ThemeProfile[] {
  if (typeof window === 'undefined') return [createDefaultProfile()];
  
  try {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (stored) {
      const profiles = JSON.parse(stored) as ThemeProfile[];
      // Ensure default profile exists
      if (!profiles.find(p => p.id === 'default')) {
        profiles.unshift(createDefaultProfile());
      }
      return profiles;
    }
  } catch (e) {
    console.error('Failed to load theme profiles:', e);
  }
  
  return [createDefaultProfile()];
}

// Load active profile ID
function loadActiveProfileId(): string {
  if (typeof window === 'undefined') return 'default';
  
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'default';
  } catch {
    return 'default';
  }
}

interface ThemeCustomizationProviderProps {
  children: ReactNode;
}

export function ThemeCustomizationProvider({ children }: ThemeCustomizationProviderProps) {
  const [profiles, setProfiles] = useState<ThemeProfile[]>([createDefaultProfile()]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default');
  const [mounted, setMounted] = useState(false);

  // Initialize from storage
  useEffect(() => {
    const loadedProfiles = loadProfiles();
    const loadedActiveId = loadActiveProfileId();
    
    setProfiles(loadedProfiles);
    setActiveProfileId(loadedActiveId);
    setMounted(true);
  }, []);

  // Save profiles to storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles, mounted]);

  // Save active profile ID
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
  }, [activeProfileId, mounted]);

  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Apply CSS variables
  const applyThemeColors = useCallback((colors: ThemeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--french-blue', colors.primary);
    root.style.setProperty('--yale-blue', colors.secondary);
    root.style.setProperty('--fresh-sky', colors.accent);
    root.style.setProperty('--jet-black', colors.foreground);
    root.style.setProperty('--strong-cyan', colors.accent);
  }, []);

  // Apply theme when active profile or mode changes
  useEffect(() => {
    if (!mounted || !activeProfile) return;

    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? activeProfile.darkColors : activeProfile.lightColors;
    applyThemeColors(colors);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          const newColors = isDarkNow ? activeProfile.darkColors : activeProfile.lightColors;
          applyThemeColors(newColors);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [mounted, activeProfile, applyThemeColors]);

  const createProfile = useCallback((data: CreateThemeProfileDTO): ThemeProfile => {
    const timestamp = getCurrentTimestamp();
    const newProfile: ThemeProfile = {
      id: generateId(),
      name: data.name,
      lightColors: data.lightColors,
      darkColors: data.darkColors,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, []);

  const updateProfile = useCallback((id: string, data: Partial<CreateThemeProfileDTO>): ThemeProfile | null => {
    let updated: ThemeProfile | null = null;
    setProfiles(prev => prev.map(profile => {
      if (profile.id === id) {
        updated = {
          ...profile,
          ...data,
          updatedAt: getCurrentTimestamp(),
        };
        return updated;
      }
      return profile;
    }));
    return updated;
  }, []);

  const deleteProfile = useCallback((id: string): boolean => {
    if (id === 'default') return false; // Can't delete default
    
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId('default');
    }
    return true;
  }, [activeProfileId]);

  const setActiveProfileFn = useCallback((id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      setActiveProfileId(id);
    }
  }, [profiles]);

  const resetToDefault = useCallback(() => {
    setActiveProfileId('default');
    const defaultProfile = profiles.find(p => p.id === 'default');
    if (defaultProfile) {
      const isDark = document.documentElement.classList.contains('dark');
      applyThemeColors(isDark ? defaultProfile.darkColors : defaultProfile.lightColors);
    }
  }, [profiles, applyThemeColors]);

  const value = useMemo(() => ({
    profiles,
    activeProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile: setActiveProfileFn,
    applyThemeColors,
    resetToDefault,
  }), [profiles, activeProfile, createProfile, updateProfile, deleteProfile, setActiveProfileFn, applyThemeColors, resetToDefault]);

  return (
    <ThemeCustomizationContext.Provider value={value}>
      {children}
    </ThemeCustomizationContext.Provider>
  );
}

export function useThemeCustomization(): ThemeCustomizationContextValue {
  const context = useContext(ThemeCustomizationContext);
  if (context === undefined) {
    throw new Error('useThemeCustomization must be used within a ThemeCustomizationProvider');
  }
  return context;
}
