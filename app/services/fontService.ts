/**
 * Font Service
 * Handles custom font management including Google Fonts imports
 */

import { FontConfig, FontSettings, DEFAULT_FONTS, DEFAULT_FONT_SETTINGS } from '@/app/types/theme';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '@/app/utils/storage';
import { generateId } from '@/app/utils/helpers';

/**
 * Load font settings from storage
 */
export function loadFontSettings(): FontSettings {
  const settings = getFromStorage<FontSettings>(STORAGE_KEYS.ACTIVE_FONT);
  if (!settings) {
    return DEFAULT_FONT_SETTINGS;
  }
  return {
    ...DEFAULT_FONT_SETTINGS,
    ...settings,
  };
}

/**
 * Save font settings to storage
 */
export function saveFontSettings(settings: FontSettings): void {
  setToStorage(STORAGE_KEYS.ACTIVE_FONT, settings);
}

/**
 * Load custom fonts from storage
 */
export function loadCustomFonts(): FontConfig[] {
  const fonts = getFromStorage<FontConfig[]>(STORAGE_KEYS.CUSTOM_FONTS);
  return fonts || [];
}

/**
 * Save custom fonts to storage
 */
export function saveCustomFonts(fonts: FontConfig[]): void {
  setToStorage(STORAGE_KEYS.CUSTOM_FONTS, fonts);
}

/**
 * Parse font name from Google Fonts URL (returns first font for backwards compatibility)
 */
export function parseFontNameFromUrl(url: string): string | null {
  const fonts = parseAllFontNamesFromUrl(url);
  return fonts.length > 0 ? fonts[0] : null;
}

/**
 * Parse ALL font names from Google Fonts URL
 * Handles URLs with multiple fonts like:
 * https://fonts.googleapis.com/css2?family=Roboto:wght@400&family=TASA+Explorer:wght@400
 */
export function parseAllFontNamesFromUrl(url: string): string[] {
  try {
    // Pattern: family=FontName:... (global to find all matches)
    const regex = /family=([^:&]+)/g;
    const fonts: string[] = [];
    let match;
    
    while ((match = regex.exec(url)) !== null) {
      // Replace + with space and decode
      const fontName = decodeURIComponent(match[1].replace(/\+/g, ' '));
      fonts.push(fontName);
    }
    
    return fonts;
  } catch {
    return [];
  }
}

/**
 * Create a single-font Google Fonts URL from an original URL
 * Extracts just the specific font and its parameters
 */
export function createSingleFontUrl(originalUrl: string, fontName: string): string {
  try {
    // Encode font name for URL matching
    const encodedName = fontName.replace(/ /g, '+');
    
    // Find the specific font family parameter in the original URL
    const regex = new RegExp(`family=${encodedName.replace(/\+/g, '\\+')}([^&]*)`, 'i');
    const match = originalUrl.match(regex);
    
    if (match) {
      // Extract the font parameters (weights, styles, etc.)
      const fontParams = match[0];
      
      // Construct a clean URL with just this font
      const baseUrl = originalUrl.includes('css2') 
        ? 'https://fonts.googleapis.com/css2?'
        : 'https://fonts.googleapis.com/css?';
      
      return `${baseUrl}${fontParams}&display=swap`;
    }
    
    // Fallback: create basic URL
    return `https://fonts.googleapis.com/css2?family=${encodedName}&display=swap`;
  } catch {
    return `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
  }
}

/**
 * Validate Google Fonts URL
 */
export function isValidGoogleFontsUrl(url: string): boolean {
  // Must start with Google Fonts CSS URL
  const validPrefixes = [
    'https://fonts.googleapis.com/css2',
    'https://fonts.googleapis.com/css',
  ];
  return validPrefixes.some(prefix => url.startsWith(prefix));
}

/**
 * Add a custom font from Google Fonts URL
 */
export function addCustomFont(googleFontsUrl: string): FontConfig | null {
  if (!isValidGoogleFontsUrl(googleFontsUrl)) {
    return null;
  }

  const fontName = parseFontNameFromUrl(googleFontsUrl);
  if (!fontName) {
    return null;
  }

  const newFont: FontConfig = {
    id: generateId(),
    name: fontName,
    family: `"${fontName}", sans-serif`,
    googleFontsUrl,
    isCustom: true,
  };

  // Load existing custom fonts and add new one
  const customFonts = loadCustomFonts();
  
  // Check if font already exists
  const exists = customFonts.some(
    f => f.name.toLowerCase() === fontName.toLowerCase()
  );
  if (exists) {
    return null;
  }

  customFonts.push(newFont);
  saveCustomFonts(customFonts);

  return newFont;
}

/**
 * Remove a custom font
 */
export function removeCustomFont(fontId: string): boolean {
  const customFonts = loadCustomFonts();
  const filtered = customFonts.filter(f => f.id !== fontId);
  
  if (filtered.length === customFonts.length) {
    return false;
  }

  saveCustomFonts(filtered);
  return true;
}

/**
 * Get all available fonts (default + custom)
 */
export function getAllFonts(): FontConfig[] {
  const customFonts = loadCustomFonts();
  return [...DEFAULT_FONTS, ...customFonts];
}

/**
 * Get font by ID
 */
export function getFontById(fontId: string): FontConfig | undefined {
  const allFonts = getAllFonts();
  return allFonts.find(f => f.id === fontId);
}

/**
 * Load font stylesheet into document
 */
export function loadFontStylesheet(font: FontConfig): void {
  if (!font.googleFontsUrl || typeof document === 'undefined') {
    return;
  }

  // Check if already loaded
  const existingLink = document.querySelector(
    `link[href="${font.googleFontsUrl}"]`
  );
  if (existingLink) {
    return;
  }

  // Create and append link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.googleFontsUrl;
  document.head.appendChild(link);
}

/**
 * Apply font to document
 */
export function applyFont(font: FontConfig): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Load the font stylesheet first
  loadFontStylesheet(font);

  // Apply to root
  document.documentElement.style.setProperty('--font-family', font.family);
  document.body.style.fontFamily = font.family;
}
