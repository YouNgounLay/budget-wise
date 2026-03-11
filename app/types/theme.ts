/**
 * Theme Types
 * Defines the structure for custom theme profiles
 */

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
}

export interface ThemeProfile {
  id: string;
  name: string;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThemeProfileDTO {
  name: string;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
}

export interface UpdateThemeProfileDTO {
  name?: string;
  lightColors?: ThemeColors;
  darkColors?: ThemeColors;
}

// Default theme profiles
export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  background: '#f8fafc',
  foreground: '#171717',
  primary: '#2A4494',
  secondary: '#224870',
  accent: '#4EA5D9',
  muted: '#64748b',
};

export const DEFAULT_DARK_COLORS: ThemeColors = {
  background: '#0f172a',
  foreground: '#f1f5f9',
  primary: '#60a5fa',
  secondary: '#38bdf8',
  accent: '#22d3ee',
  muted: '#94a3b8',
};

// Preset theme profiles for users to choose from
export const PRESET_THEMES: Omit<ThemeProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Default',
    lightColors: DEFAULT_LIGHT_COLORS,
    darkColors: DEFAULT_DARK_COLORS,
  },
  {
    name: 'Ocean',
    lightColors: {
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      primary: '#0284c7',
      secondary: '#0369a1',
      accent: '#06b6d4',
      muted: '#64748b',
    },
    darkColors: {
      background: '#0C2C55',
      foreground: '#EDEDCE',
      primary: '#629FAD',
      secondary: '#296374',
      accent: '#7dd3fc',
      muted: '#94a3b8',
    },
  },
  {
    name: 'Forest',
    lightColors: {
      background: '#f0fdf4',
      foreground: '#14532d',
      primary: '#16a34a',
      secondary: '#15803d',
      accent: '#22c55e',
      muted: '#6b7280',
    },
    darkColors: {
      background: '#052e16',
      foreground: '#dcfce7',
      primary: '#4ade80',
      secondary: '#22c55e',
      accent: '#86efac',
      muted: '#9ca3af',
    },
  },
  {
    name: 'Sunset',
    lightColors: {
      background: '#fff7ed',
      foreground: '#7c2d12',
      primary: '#ea580c',
      secondary: '#c2410c',
      accent: '#f97316',
      muted: '#78716c',
    },
    darkColors: {
      background: '#1c1917',
      foreground: '#fef3c7',
      primary: '#fb923c',
      secondary: '#f97316',
      accent: '#fdba74',
      muted: '#a8a29e',
    },
  },
  {
    name: 'Lavender',
    lightColors: {
      background: '#faf5ff',
      foreground: '#581c87',
      primary: '#9333ea',
      secondary: '#7e22ce',
      accent: '#a855f7',
      muted: '#71717a',
    },
    darkColors: {
      background: '#1e1b4b',
      foreground: '#e9d5ff',
      primary: '#c084fc',
      secondary: '#a855f7',
      accent: '#d8b4fe',
      muted: '#a1a1aa',
    },
  },
  {
    name: 'Midnight',
    lightColors: {
      background: '#f8fafc',
      foreground: '#1e293b',
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748b',
      muted: '#94a3b8',
    },
    darkColors: {
      background: '#020617',
      foreground: '#e2e8f0',
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#cbd5e1',
      muted: '#64748b',
    },
  },
];

/**
 * Font Configuration Types
 */

export interface FontConfig {
  id: string;
  name: string;
  family: string;
  googleFontsUrl?: string;
  isCustom: boolean;
}

// Default fonts (built-in)
export const DEFAULT_FONTS: FontConfig[] = [
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: '"Space Grotesk", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap',
    isCustom: false,
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: '"JetBrains Mono", monospace',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    isCustom: false,
  },
  {
    id: 'inter',
    name: 'Inter',
    family: '"Inter", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    isCustom: false,
  },
  {
    id: 'nunito',
    name: 'Nunito',
    family: '"Nunito", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
    isCustom: false,
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: '"Roboto", sans-serif',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    isCustom: false,
  },
];

export interface FontSettings {
  activeFontId: string;
  customFonts: FontConfig[];
}

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  activeFontId: 'inter',
  customFonts: [],
};
