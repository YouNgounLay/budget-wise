# Search Filter Icons and Duplicate Name Validation Plan

## Overview
This plan addresses two main requirements from the agents.md file:
1. Replace emojis in search filter options with custom reusable SVG icons
2. Add duplicate name validation when creating new accounts or chains

## Date
February 8, 2026

## Requirements

### 1. Replace Emojis with Custom Icons
**Files affected:**
- `app/components/shared/SearchBar.tsx` - Filter options use emojis (🔍, 💰, 🔗, 🏷️)
- `app/context/TutorialContext.tsx` - Uses emojis in tutorial content

**Solution:**
- Create a new reusable Icons component file at `app/components/shared/Icons.tsx`
- Define SVG icon components: SearchAllIcon, WalletIcon, ChainLinkIcon, TagIcon
- Update SearchBar.tsx to use these icon components instead of emojis
- Update TutorialContext.tsx to use text descriptions instead of emojis (since tutorial content is text-based)

### 2. Duplicate Name Validation
**Files affected:**
- `app/components/account/AccountForm.tsx` - Account creation form
- `app/components/chain/ChainForm.tsx` - Chain creation form

**Solution:**
- Pass existing accounts/chains list to forms
- Add validation in the validate() function to check for duplicate names
- Show appropriate error message when duplicate name is detected
- Allow same name when editing (only block if name matches a *different* entity)

## Implementation Steps

### Step 1: Create Reusable Icons Component
Create `app/components/shared/Icons.tsx` with:
- SearchAllIcon - magnifying glass with "all" indicator
- WalletIcon - money/wallet icon for accounts
- ChainLinkIcon - chain link icon
- TagIcon - tag/label icon

### Step 2: Update SearchBar.tsx
- Import icon components from Icons.tsx
- Replace emoji strings in filterOptions with React components
- Update the rendering to handle both string and component icons

### Step 3: Update AccountForm.tsx
- Add existingAccounts prop
- Update validate() to check for duplicate names
- Pass accountId for edit mode to allow keeping same name

### Step 4: Update ChainForm.tsx
- Add existingChains prop
- Update validate() to check for duplicate names
- Pass chainId for edit mode to allow keeping same name

### Step 5: Update parent components
- Update accounts page to pass accounts list to AccountForm
- Update chains page to pass chains list to ChainForm

### Step 6: Update Tutorial Context
- Replace emoji strings with text-based alternatives or icon descriptions

### Step 7: Update shared/index.ts
- Export new Icons components

### Step 8: Update import/export documentation if needed

## Testing
- Verify icons render correctly in search filter dropdown
- Test creating account with duplicate name shows error
- Test creating chain with duplicate name shows error
- Test editing account/chain allows keeping same name
- Test editing account/chain prevents using another entity's name
- Run build to ensure no errors
