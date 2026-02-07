# UI Patches Documentation

## Implementation Date
February 8, 2026

## Overview
This document covers three UI patches applied to improve the user experience:
1. Replace emoji icons with custom SVG icons
2. Fix theme color customization for all options
3. Fix white pixel visible in theme toggle

---

## Patch #1: Replace Emojis with Custom SVG Icons

### Issue
The dollar bag emoji (💰) and chain emoji (🔗) were used in empty states. These emojis can render inconsistently across different operating systems and browsers.

### Solution
Replaced both emojis with custom SVG icons that:
- Match the application's design language
- Use the `text-french-blue` color for consistency
- Are scalable without quality loss
- Render consistently across all platforms

### Files Modified

#### `app/components/account/AccountList.tsx`
- Replaced 💰 emoji with a banknote/money SVG icon
- Icon uses `w-16 h-16` sizing with `text-french-blue` color

#### `app/components/chain/ChainList.tsx`
- Replaced 🔗 emoji with a chain link SVG icon
- Icon uses `w-16 h-16` sizing with `text-french-blue` color

### Before/After

**Before:**
```tsx
<div className="text-5xl mb-4">💰</div>
```

**After:**
```tsx
<div className="mb-4 flex justify-center">
  <svg className="w-16 h-16 text-french-blue" ...>
    ...
  </svg>
</div>
```

---

## Patch #2: Fix Theme Color Customization

### Issue
The color changing function in the Theme Customizer only worked for "primary" and "text" colors. Additionally, the background color only changed the page background, not the UI elements (cards, modals, header, sidebar).

### Root Cause
1. UI components were using hardcoded Tailwind classes like `bg-white dark:bg-slate-800` instead of CSS variables
2. The `applyThemeColors` function was missing the `--muted` CSS variable
3. There was no `--surface` variable for UI elements distinct from page background
4. There was no `--border` variable for consistent border colors

### Solution
1. Added new CSS variables `--surface` and `--border` to distinguish UI elements from page background
2. Updated `applyThemeColors` to derive surface/border colors from background color
3. Updated all UI components to use the new CSS variables instead of hardcoded colors

### Files Modified

#### `app/style/globals.css`
- Added `--surface: #ffffff` to `:root` (light mode) - for cards, modals, header
- Added `--surface: #1e293b` to `.dark` (dark mode)
- Added `--border: #e2e8f0` to `:root` (light mode)
- Added `--border: #334155` to `.dark` (dark mode)
- Added `--color-surface` and `--color-border` to `@theme inline` block

#### `app/context/ThemeCustomizationContext.tsx`
- Added `deriveSurfaceColor()` function to generate surface color from background
- Added `deriveBorderColor()` function to generate border color
- Updated `applyThemeColors()` to set `--surface` and `--border` variables

#### UI Components Updated
- `Card.tsx`, `Modal.tsx`, `Select.tsx`, `ThemeSelector.tsx` - Use `bg-surface` and `border-border`
- `Header.tsx`, `Sidebar.tsx`, `MainLayout.tsx` - Use theme variables
- `AccountCard.tsx`, `ChainDisplay.tsx`, `ManageChainAccountsModal.tsx` - Use theme variables
- `accounts/page.tsx` - Uses `bg-surface` and `border-border`

### Color Mapping

| Theme Color | CSS Variable(s) | Used For |
|-------------|-----------------|----------|
| background | `--background` | Page background |
| surface | `--surface` (derived) | Cards, modals, header |
| foreground | `--foreground`, `--jet-black` | Main text |
| primary | `--french-blue` | Buttons, links |
| secondary | `--yale-blue` | Secondary elements |
| accent | `--fresh-sky`, `--strong-cyan` | Accents |
| muted | `--muted` | Subtle text |
| border | `--border` (derived) | All borders |

---

## Patch #3: Fix White Pixel in Theme Toggle

### Issue
When toggling the theme from light to dark mode, users could see a small white pixel behind the circular toggle indicator.

### Root Cause
The toggle button in `ThemeSelector.tsx` had:
1. A fixed white background on the toggle circle that wasn't theme-aware
2. Misaligned positioning (top-1.5, left-1.5 vs proper top-1, left-1)
3. The `overflow-hidden` class was masking the issue poorly
4. Transition timing was inconsistent

### Solution
Updated the toggle button styling:
1. Made the toggle circle background theme-aware (`bg-white` in light, `bg-slate-800` in dark)
2. Fixed positioning to `top-1 left-1` for proper alignment
3. Increased circle size from `w-5 h-5` to `w-6 h-6` for better coverage
4. Added consistent `duration-300` transitions throughout
5. Removed `overflow-hidden` and added proper shadow
6. Made the Moon icon always visible (with opacity change) for smoother transitions

### Files Modified

#### `app/components/shared/ThemeSelector.tsx`
- Updated toggle button background from `bg-slate-100 dark:bg-slate-700` to `bg-slate-200 dark:bg-slate-600`
- Changed toggle circle to be theme-aware: `bg-white` in light mode, `bg-slate-800` in dark mode
- Fixed circle positioning and sizing
- Added consistent transition timing (`duration-300`)
- Made Moon icon always rendered with opacity transition

### Before/After

**Before:**
```tsx
<span className={`absolute top-1.5 left-1.5 transition-transform w-5 h-5 
  rounded-full bg-white shadow border border-slate-300 dark:border-slate-600 z-20` + 
  (theme === 'dark' ? ' translate-x-6' : ' translate-x-0')} />
```

**After:**
```tsx
<span className={`absolute top-1 left-1 transition-all duration-300 ease-in-out 
  w-6 h-6 rounded-full shadow-md z-20 
  ${theme === 'dark' ? 'translate-x-6 bg-slate-800' : 'translate-x-0 bg-white'}`} />
```

---

## Patch #4: Reset to Default Theme Button

### Issue
Users had no way to reset their theme customizations back to the default settings.

### Solution
Added a "Reset to Default" button to the theme selector dropdown.

### Files Modified

#### `app/components/shared/ThemeSelector.tsx`
- Added `resetToDefault` from `useThemeCustomization` hook
- Added "Reset to Default" button with refresh icon
- Button closes dropdown after clicking

### Implementation
The reset button appears below the "Create New Theme" button and uses the existing `resetToDefault` function from the ThemeCustomizationContext.

---

## Patch #5: Improved Icon Picker with Custom Emoji Support

### Issue
1. The icon picker showed a scrollable list of 90+ icons, many of which were duplicates (e.g., 🔥 for both "gas" and "fire")
2. Users had no way to input their own custom emoji

### Solution
1. Created a curated list of 24 popular, non-duplicate icons
2. Removed scrollable container and show all icons in a grid
3. Added "Custom Emoji" button that opens an input field for user's own emoji
4. Added `customEmoji` field to Account type for storing custom icons

### Files Modified

#### `app/components/account/IconPicker.tsx`
- Redesigned with curated `POPULAR_ICONS` list (24 items)
- 8-column grid layout with no scrolling
- Added custom emoji input section with Add/Cancel buttons
- Keyboard support (Enter to submit)

#### `app/types/account.ts`
- Added `'custom'` to `AccountIcon` type
- Added `customEmoji?: string` to Account, CreateAccountDTO, UpdateAccountDTO
- Added `custom: '✨'` to ACCOUNT_ICONS fallback

#### `app/components/account/AccountForm.tsx`
- Updated defaultFormData to include `customEmoji: undefined`
- Updated useEffect to populate customEmoji from account
- Updated currentIcon display to show customEmoji when icon is 'custom'
- Updated IconPicker onChange to handle customEmoji parameter

#### `app/components/account/AccountCard.tsx`
- Updated icon display to show customEmoji when icon is 'custom'

#### Chain Components
- `ChainDisplay.tsx` - Updated to show customEmoji
- `ChainDepositModal.tsx` - Updated to show customEmoji
- `ManageChainAccountsModal.tsx` - Updated account displays and dropdowns

### Popular Icons List (24 curated icons)
```
money, bank, wallet, credit-card, piggy-bank, savings,
investment, car, home, grocery, food, coffee,
shopping, entertainment, travel, health, fitness, education,
business, technology, gifts, heart, star, target
```

---

## Testing Checklist

### Patch #1
- [x] Money bag SVG icon displays in empty accounts state
- [x] Chain link SVG icon displays in empty chains state
- [x] Icons are properly colored with french-blue
- [x] Icons are properly sized and centered

### Patch #2
- [x] Primary color changes apply to UI elements
- [x] Secondary color changes apply to UI elements
- [x] Accent color changes apply to UI elements
- [x] Muted color is available in CSS
- [x] Colors work correctly in both light and dark modes

### Patch #3
- [x] No white pixel visible when toggling to dark mode
- [x] Toggle circle smoothly transitions between positions
- [x] Toggle circle color changes with theme
- [x] Sun and Moon icons transition smoothly

### Patch #4
- [ ] Reset to Default button appears in theme dropdown
- [ ] Clicking Reset to Default resets all theme customizations
- [ ] Dropdown closes after clicking Reset

### Patch #5
- [ ] Icon picker shows 24 curated icons in 8-column grid
- [ ] No scrolling needed in icon picker
- [ ] Custom Emoji button shows input field
- [ ] Can type/paste custom emoji
- [ ] Custom emoji saved to account correctly
- [ ] Custom emoji displays in all account views
- [ ] Custom emoji displays in chain components
