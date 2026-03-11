# Implementation Plan: Agents Redesign and Features (February 2026)

## Overview
This document outlines the implementation plan for the redesigns, features, and bug fixes specified in the agents.md file.

## Date: 15 February 2026

---

## Redesign 1: Account Card Viewing UIs
**Requirement:** View one account card per row instead of multiple cards in a row.

**Changes:**
- Modify `AccountList.tsx` - Change grid layout from `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to single column layout `grid-cols-1`
- Adjust `AccountCard.tsx` - Update styling for horizontal/full-width layout

**Files to Modify:**
- `app/components/account/AccountList.tsx`

---

## Redesign 2: Custom Color Picker
**Requirement:** Provide preset color selection with option to add custom colors via hex. System should remember custom colors for reuse.

**Changes:**
1. Refactor `ColorPicker.tsx` to show:
   - Preset colors (from theme)
   - Recently used custom colors (stored in localStorage)
   - Option to add custom hex color with live preview
2. Create a shared color storage service
3. Update all components using ColorPicker to use the same system

**Files to Modify:**
- `app/components/account/ColorPicker.tsx`
- `app/types/theme.ts` (add custom colors storage type)
- `app/utils/storage.ts` (add storage key for custom colors)

---

## Redesign 3: Emoji Picker to Icon Picker
**Requirement:** Replace emoji system with searchable icon picker from the full range of available icons.

**Changes:**
1. Complete overhaul of `IconPicker.tsx`:
   - Add search functionality
   - Display all icons from ACCOUNT_ICONS
   - Categorize icons for easier browsing
   - Remove custom emoji functionality
2. Update account types to remove customEmoji support

**Files to Modify:**
- `app/components/account/IconPicker.tsx`
- `app/types/account.ts` (remove customEmoji from types or keep for backward compatibility)
- `app/components/account/AccountForm.tsx`
- `app/components/account/AccountCard.tsx`

---

## Redesign 4: Chain Order Edit
**Requirement:** Combine tick, cross, and delete buttons into a single edit button. When pressed, show confirm/cancel and remove account options.

**Changes:**
1. Modify `ChainEditModal.tsx`:
   - Add edit state for each chain account
   - Combine edit controls into single button
   - Show confirm/cancel + remove account when editing
2. Apply same changes to `ManageChainAccountsModal.tsx` (deprecated but may still be used)

**Files to Modify:**
- `app/components/chain/ChainEditModal.tsx`
- `app/components/chain/ManageChainAccountsModal.tsx`

---

## Redesign 5: Chain Percentage Mode QoL
**Requirement:** Auto-allocate percentages equally when enabling percentage mode. If not divisible, give remainder to first account.

**Changes:**
1. Modify `chainService.ts` or `ChainContext.tsx`:
   - Update `toggleDistributionMode` to auto-calculate percentages
   - Equal distribution logic with remainder to first account

**Files to Modify:**
- `app/context/ChainContext.tsx`
- `app/services/chainService.ts`

---

## Feature 1: Negative Balance Account
**Requirement:** Support negative balances in accounts (debt modeling).

**Changes:**
1. Update validation in `AccountForm.tsx` to allow negative amounts
2. Update `AccountCard.tsx` styling for negative balance display (red/warning color)
3. Update transaction validation to allow negative results
4. Update helper functions if they prevent negative balances

**Files to Modify:**
- `app/components/account/AccountForm.tsx`
- `app/components/account/AccountCard.tsx`
- `app/services/accountService.ts`
- `app/types/account.ts` (update validation notes)

---

## Feature 2: Custom Font Options
**Requirement:** Support custom fonts via Google Fonts API with 5 default options and ability to import more.

**Default Fonts:**
- Space Grotesk
- JetBrains Mono
- Inter
- Nunito
- Roboto

**Changes:**
1. Create font configuration type in `app/types/theme.ts`
2. Create font service for managing custom fonts
3. Create FontPicker component
4. Update ThemeCustomizationContext to include font settings
5. Update `app/layout.tsx` to dynamically load fonts
6. Add settings UI for font selection
7. Store custom font imports in localStorage

**Files to Create:**
- `app/services/fontService.ts`
- `app/components/shared/FontPicker.tsx`

**Files to Modify:**
- `app/types/theme.ts`
- `app/context/ThemeCustomizationContext.tsx`
- `app/layout.tsx`
- `app/style/globals.css`
- `app/utils/storage.ts`

---

## Bug Fix 1: Chain Account UI Border
**Requirement:** Fix left border appearing blocked in input fields inside create/edit chain modal.

**Changes:**
1. Investigate Input component styling in chain modals
2. Fix overflow or z-index issues causing border to be hidden

**Files to Modify:**
- `app/components/chain/ChainEditModal.tsx`
- `app/components/shared/Input.tsx` (if needed)

---

## Additional Updates

### Import/Export System Updates
- Update export service to include:
  - Custom colors history
  - Custom font settings
- Update import service to handle new data

### Tutorial System Updates
- Add steps for new features (font settings, icon picker)
- Update existing steps as needed

### Diagrams
- Update class diagram under `/docs/diagrams/class-diagram.md`
- Update ERD under `/docs/diagrams/erd.md`

---

## Implementation Order
1. Bug Fix 1 (quick fix)
2. Redesign 1 (account card layout - simple)
3. Feature 1 (negative balance - foundational change)
4. Redesign 2 (color picker redesign)
5. Redesign 3 (icon picker system)
6. Redesign 4 (chain edit UI)
7. Redesign 5 (chain percentage QoL)
8. Feature 2 (custom fonts - most complex)
9. Update import/export system
10. Update tutorial
11. Update diagrams
12. Build and test

---

## Testing Checklist
- [ ] All redesigns function as specified
- [ ] All features work correctly
- [ ] Bug fix resolves the issue
- [ ] Import/export handles new data correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build completes successfully
