# Chain & Tag Customization Implementation Plan

## Date: 2026-02-08

## Overview
This plan covers three main features:
1. **Patching** - UI improvements to chain cards (Edit/Delete text, merged modals)
2. **Chain Customization** - Color customization for chain cards
3. **Tag System** - Account tagging with color customization

---

## 1. Patching: Chain Card UI Improvements

### Tasks:
1.1. Update `ChainDisplay.tsx`:
   - Add "Edit" text next to edit icon
   - Add "Delete" text next to delete icon

1.2. Create new `ChainEditModal.tsx`:
   - Merge chain form fields with ManageChainAccountsModal
   - Make content scrollable if too long
   - Include all editing capabilities in one modal

1.3. Update `ChainForm.tsx`:
   - Convert to combined edit modal with account management
   - Support scrollable content

1.4. Update `ChainsPage`:
   - Use new combined modal flow

---

## 2. Chain Customization: Color Support

### Tasks:
2.1. Update `types/chain.ts`:
   - Add `color: AccountColor` field to Chain interface
   - Add `customColor?: string` field for custom colors
   - Update CreateChainDTO and UpdateChainDTO

2.2. Update `ChainForm.tsx` / Combined Edit Modal:
   - Add ColorPicker component for chain color selection

2.3. Update `ChainDisplay.tsx`:
   - Apply chain color to card styling (similar to AccountCard)

2.4. Update chain services and context:
   - Handle new color fields

---

## 3. Tag System

### Tasks:
3.1. Create `types/tag.ts`:
   - Define Tag interface with id, name, color, customColor
   - Define CreateTagDTO and UpdateTagDTO

3.2. Update `types/account.ts`:
   - Add `tagIds: string[]` field to Account interface
   - Update CreateAccountDTO and UpdateAccountDTO

3.3. Create `services/tagService.ts`:
   - CRUD operations for tags
   - Get accounts by tag

3.4. Create `context/TagContext.tsx`:
   - Global state management for tags

3.5. Create `components/tag/` directory:
   - `TagBadge.tsx` - Display a single tag
   - `TagPicker.tsx` - Select/create tags for accounts
   - `TagList.tsx` - Display all tags with associated accounts
   - `TagForm.tsx` - Create/edit tag modal

3.6. Update `AccountForm.tsx`:
   - Add tag selection capability

3.7. Update `AccountCard.tsx`:
   - Display tags on account cards

3.8. Create Tags page or section:
   - View all tags with associated accounts

3.9. Update import/export services:
   - Include tags in export data
   - Handle tag import with validation

3.10. Update storage.ts:
   - Add TAGS storage key

---

## Implementation Order:
1. Patching (UI improvements)
2. Chain customization (color support)
3. Tag system (new feature)

---

## Files to Create:
- `app/types/tag.ts`
- `app/services/tagService.ts`
- `app/context/TagContext.tsx`
- `app/components/tag/TagBadge.tsx`
- `app/components/tag/TagPicker.tsx`
- `app/components/tag/TagList.tsx`
- `app/components/tag/TagForm.tsx`
- `app/components/tag/index.ts`
- `app/tags/page.tsx`

## Files to Modify:
- `app/types/chain.ts`
- `app/types/account.ts`
- `app/types/index.ts`
- `app/components/chain/ChainDisplay.tsx`
- `app/components/chain/ChainForm.tsx`
- `app/components/chain/index.ts`
- `app/components/account/AccountForm.tsx`
- `app/components/account/AccountCard.tsx`
- `app/chains/page.tsx`
- `app/services/exportService.ts`
- `app/services/importService.ts`
- `app/utils/storage.ts`
- `app/providers.tsx`
