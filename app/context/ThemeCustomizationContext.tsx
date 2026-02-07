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

  /**
   * Derives surface color (for cards, modals, etc.) from background color
   * In light mode: slightly lighter/white
   * In dark mode: slightly lighter than background
   */
  const deriveSurfaceColor = useCallback((backgroundColor: string, isDark: boolean): string => {
    // For light mode, use white or very light version
    if (!isDark) {
      // Parse the background color and return a lighter version or white
      return '#ffffff';
    }
    // For dark mode, lighten the background slightly
    // Parse hex color and add some brightness
    const hex = backgroundColor.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + 15);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + 15);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + 15);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  /**
   * Derives border color from muted color with transparency
   */
  const deriveBorderColor = useCallback((mutedColor: string, isDark: boolean): string => {
    if (!isDark) {
      return '#e2e8f0'; // slate-200
    }
    return '#334155'; // slate-700
  }, []);

  // Apply CSS variables
  const applyThemeColors = useCallback((colors: ThemeColors, isDark: boolean = false) => {
    const root = document.documentElement;
    // Background and foreground
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--jet-black', colors.foreground);
    // Surface color for UI elements (cards, modals, header)
    root.style.setProperty('--surface', deriveSurfaceColor(colors.background, isDark));
    // Border color
    root.style.setProperty('--border', deriveBorderColor(colors.muted, isDark));
    // Primary color (used as french-blue)
    root.style.setProperty('--french-blue', colors.primary);
    // Secondary color (used as yale-blue)
    root.style.setProperty('--yale-blue', colors.secondary);
    // Accent color (used as fresh-sky and strong-cyan)
    root.style.setProperty('--fresh-sky', colors.accent);
    root.style.setProperty('--strong-cyan', colors.accent);
    // Muted color - store in a CSS variable for components that may use it
    root.style.setProperty('--muted', colors.muted);
  }, [deriveSurfaceColor, deriveBorderColor]);

  // Apply theme when active profile or mode changes
  useEffect(() => {
    if (!mounted || !activeProfile) return;

    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? activeProfile.darkColors : activeProfile.lightColors;
    applyThemeColors(colors, isDark);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          const newColors = isDarkNow ? activeProfile.darkColors : activeProfile.lightColors;
          applyThemeColors(newColors, isDarkNow);
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
      applyThemeColors(isDark ? defaultProfile.darkColors : defaultProfile.lightColors, isDark);
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
