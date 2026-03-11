# UI Patches - February 2026 (Phase 2)

This document covers the bug fixes implemented on February 14, 2026.

## Bug Fix 1: Tag Assignment for Accounts and Transactions

### Issue
The application had a tag management system that allowed users to create account tags and transaction tags, but there was no way to assign those tags to accounts or transactions.

### Solution
1. **Account Tag Assignment**: Updated the Accounts page to pass `availableTags` (filtered to account tags) and `onCreateTag` to the `AccountForm` component, which already had `TagPicker` support built-in.

2. **Transaction Tag Assignment**: 
   - Updated `TransactionModal` to accept `availableTags` and `onCreateTag` props
   - Added `TagPicker` component to the transaction modal UI
   - Updated the `onSubmit` callback signature to include optional `tagIds`
   - Updated `AccountContext.depositToAccount` and `withdrawFromAccount` to accept optional `tagIds` parameter
   - Updated transaction creation to pass `tagIds` to the transaction service

### Files Modified
- [app/accounts/page.tsx](../app/accounts/page.tsx) - Added tag context and passed tags to forms
- [app/components/account/TransactionModal.tsx](../app/components/account/TransactionModal.tsx) - Added TagPicker and tag state
- [app/context/AccountContext.tsx](../app/context/AccountContext.tsx) - Updated deposit/withdraw methods to accept tagIds

---

## Bug Fix 1.1: Tag Dropdown Blocking Action Buttons

### Issue
When clicking the TagPicker dropdown in AccountForm or TransactionModal, the dropdown would open and overlay the "Cancel" and "Save Changes" buttons at the bottom, making them inaccessible.

### Solution
Added a scroll padding element (`<div className="h-32 shrink-0" aria-hidden="true" />`) before the sticky footer buttons in both forms. This creates extra scrollable space at the bottom of the form content, allowing users to scroll past the tags section and ensure the dropdown doesn't obstruct the action buttons.

### Technical Details
- Added a 128px (h-32) spacer div with `shrink-0` to prevent flexbox shrinking
- The `aria-hidden="true"` attribute ensures screen readers ignore this presentational element
- The sticky footer remains fixed at the bottom while the content above can scroll

### Files Modified
- [app/components/account/AccountForm.tsx](../app/components/account/AccountForm.tsx) - Added scroll padding before sticky footer
- [app/components/account/TransactionModal.tsx](../app/components/account/TransactionModal.tsx) - Added scroll padding before sticky footer

---

## Bug Fix 2: Search Bar Focus Border

### Issue
When the user clicked on the search bar input field, an additional rectangular border appeared outside the existing rounded-edge border due to the global `*:focus-visible` CSS rule.

### Solution
Added a CSS class `.search-input` with `focus-visible: outline: none` to override the global focus-visible style specifically for the search bar input. The parent container already handles the visual focus state via the `group-focus-within` classes.

### Files Modified
- [app/style/globals.css](../app/style/globals.css) - Added `.search-input:focus-visible` rule
- [app/components/shared/SearchBar.tsx](../app/components/shared/SearchBar.tsx) - Added `search-input` class to input

---

## Bug Fix 3: Search Bar Filter Responsiveness

### Issue
On mobile devices, the filter dropdown button appeared significantly smaller than the search input field, creating a disproportionate appearance.

### Solution
Redesigned the SearchBar component with a responsive layout:
- **Mobile (< sm breakpoint)**: Filter dropdown appears below the search input as a full-width button
- **Desktop (>= sm breakpoint)**: Filter dropdown appears to the left of the search input (original design)

Using CSS flexbox with `flex-col sm:flex-row` and `order-*` classes to swap visual order while maintaining proper DOM order for tab navigation.

### Files Modified
- [app/components/shared/SearchBar.tsx](../app/components/shared/SearchBar.tsx) - Restructured layout with responsive classes

---

## Additional Updates

### Tutorial System
Updated the tutorial step "Step 6: Organize with Tags" to reflect the new tag assignment capabilities, clarifying that:
- Tags can be created for both accounts and transactions
- Tags are assigned when creating/editing accounts
- Tags are assigned when depositing/withdrawing

### Files Modified
- [app/context/TutorialContext.tsx](../app/context/TutorialContext.tsx) - Updated tutorial step content

### Class Diagram
Updated the class diagram to reflect:
- `AccountContext.depositToAccount` and `withdrawFromAccount` now accept optional `tagIds` parameter
- Added `TransactionModal` component with tag support
- Updated `AccountForm` to show tag-related props

### Files Modified
- [docs/diagrams/class-diagram.md](./diagrams/class-diagram.md) - Updated component and context signatures

---

## Implementation Date
February 14, 2026
