# Implementation Plan: Data Import/Export & UI Patches

## Date
February 8, 2026

## Overview
This plan covers:
1. **Feature**: Data Import/Export functionality
2. **Patch #1**: Replace dollar bag and chain emojis with custom SVG icons
3. **Patch #2**: Fix color changing function for all theme options (not just primary and text)
4. **Patch #3**: Fix white pixel visible behind circle when toggling theme

---

## Feature 1: Data Import/Export

### Requirements
- Export button allows users to export data as Excel spreadsheet (primary format for non-technical users)
- Option to export as JSON format
- Import function allows users to import data based on the export structure

### Data Structure
The export will include:
- **Accounts**: id, name, description, amount, icon, color, customColor, createdAt, updatedAt
- **Chains**: id, name, description, accounts, overflowAccountId, defaultLimit, createdAt, updatedAt
- **Metadata**: exportDate, version, appName

### Implementation Steps

1. **Create Export Service** (`app/services/exportService.ts`)
   - `exportToJSON()` - exports all data as JSON file
   - `exportToExcel()` - exports all data as Excel spreadsheet with multiple sheets
   - Uses the `xlsx` library for Excel generation

2. **Create Import Service** (`app/services/importService.ts`)
   - `importFromJSON(file)` - parses JSON and validates structure
   - `importFromExcel(file)` - parses Excel and validates structure
   - Validation functions to ensure data integrity

3. **Create Import/Export Modal** (`app/components/shared/DataImportExportModal.tsx`)
   - Export section with format selection (Excel/JSON)
   - Import section with file upload and validation feedback

4. **Add Import/Export buttons to Header**
   - Add dropdown menu with Import/Export options

5. **Install required dependency**
   - `xlsx` for Excel file handling

---

## Patch #1: Replace Emojis with Custom SVG Icons

### Issue
The dollar bag emoji (💰) and chain emoji (🔗) are used in empty states. These should be replaced with custom SVG icons.

### Files to Modify
- `app/components/account/AccountList.tsx` - Replace 💰 with money bag SVG
- `app/components/chain/ChainList.tsx` - Replace 🔗 with chain SVG

---

## Patch #2: Fix Color Changing for All Theme Options

### Issue
The color changing function in ThemeCustomizer only updates "primary" and "text" CSS variables, but not secondary, accent, and muted colors.

### Root Cause
In `ThemeCustomizationContext.tsx`, the `applyThemeColors` function maps:
- `primary` → `--french-blue`
- `foreground` → `--foreground` and `--jet-black`
- `secondary` → `--yale-blue`
- `accent` → `--fresh-sky` and `--strong-cyan`
- `background` → `--background`

But the CSS variables are only partially applied to components. Many components use hardcoded Tailwind classes like `text-french-blue` which rely on the CSS variables.

### Solution
The CSS is already set up to use CSS variables. The issue is that the theme colors need to be properly applied. I need to verify the `applyThemeColors` function is applying all colors correctly and that the CSS is picking them up.

---

## Patch #3: Fix White Pixel Behind Theme Toggle Circle

### Issue
When toggling from light to dark mode, there's a visible white pixel behind the toggle circle.

### Root Cause
In `ThemeSelector.tsx`, the toggle button has a white background circle that may have a slight gap or the transition timing doesn't match.

### Solution
Add proper background color to the toggle container that matches the current theme, and ensure the circle's background is theme-aware.

---

## Files to Create
1. `app/services/exportService.ts`
2. `app/services/importService.ts`
3. `app/components/shared/DataImportExportModal.tsx`

## Files to Modify
1. `app/components/account/AccountList.tsx` - Patch #1
2. `app/components/chain/ChainList.tsx` - Patch #1
3. `app/components/shared/ThemeSelector.tsx` - Patch #3
4. `app/components/layout/Header.tsx` - Add Import/Export button
5. `app/components/shared/index.ts` - Export new component

## Dependencies to Install
- `xlsx` - For Excel file generation and parsing

---

## Testing Checklist
- [x] Export data as Excel works
- [x] Export data as JSON works
- [x] Import from Excel works
- [x] Import from JSON works
- [x] Validation errors are shown for invalid files
- [x] Dollar bag emoji replaced with SVG icon
- [x] Chain emoji replaced with SVG icon
- [x] All theme colors (primary, secondary, accent, muted, background, foreground) update correctly
- [x] No white pixel visible when toggling theme

## Implementation Status: ✅ COMPLETED
- Date Completed: February 8, 2026
- Branch: feature/data-import-export-and-patches
