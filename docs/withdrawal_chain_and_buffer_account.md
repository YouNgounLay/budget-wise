# Withdrawal Chain and Buffer Account Features

This document outlines the implementation of new features and bug fixes added to the BudgetWise application.

**Implementation Date:** 16 February 2026

## Changes Overview

### Bug Fix 1: Export/Import Does Not Include Account Items

**Problem:** When exporting data using the export function, account items (e.g., subscription costs, membership fees) associated with an account were not being exported.

**Solution:**
1. Added a new "Account Items" sheet to the Excel export in [exportService.ts](../app/services/exportService.ts)
2. Updated the import service to parse the "Account Items" sheet and reconstruct the items array for each account in [importService.ts](../app/services/importService.ts)

**Export Format:**
| Account ID | Account Name | Item ID | Item Name | Item Cost |
|------------|--------------|---------|-----------|-----------|
| acc_123    | Gym          | item_1  | Membership| 50.00     |
| acc_123    | Gym          | item_2  | Chalk     | 10.00     |

### Feature 1: Withdrawal Chain

**Description:** Added the ability to withdraw funds from a chain. Withdrawals work in reverse order (right to left), meaning funds are taken from the last account first, then the second-to-last, and so on.

**Implementation:**
1. Created `ChainWithdrawModal` component in [ChainWithdrawModal.tsx](../app/components/chain/ChainWithdrawModal.tsx)
2. Added `onWithdraw` prop to `ChainList` and `ChainDisplay` components
3. Integrated withdrawal functionality in the chains page with transaction recording
4. The `withdrawFromChain` function in [depositService.ts](../app/services/depositService.ts) already existed but was not exposed via UI

**User Flow:**
1. Navigate to Chains page
2. Click "Withdraw from Chain" button on any chain
3. Enter withdrawal amount and optional description
4. Preview shows which accounts will be debited (in reverse order)
5. Confirm withdrawal to execute

### Feature 2: Buffer Account Selection (Existing Account)

**Description:** Previously, the buffer account was a virtual "infinite capacity" buffer. Now users can optionally select an existing account (not already in the chain) to serve as the buffer account.

**Implementation:**
1. Added `bufferAccountId?: string` field to the `Chain` type in [chain.ts](../app/types/chain.ts)
2. Updated `ChainContext` with `setBufferAccount` function in [ChainContext.tsx](../app/context/ChainContext.tsx)
3. Modified `depositToChainSequential` in [depositService.ts](../app/services/depositService.ts) to handle existing account buffer
4. Updated `ChainEditModal` to show buffer type selection UI (Virtual Buffer vs Use Account)
5. Updated `ChainDisplay` to show the selected account as buffer instead of virtual buffer
6. Updated export/import services to handle the new `bufferAccountId` field

**Buffer Options:**
- **Virtual Buffer (default):** Unlimited capacity, stores overflow funds
- **Use Existing Account:** Select any account not currently in the chain; overflow funds deposit directly to this account

**UI Changes:**
- Toggle buttons in the Buffer Account section to switch between virtual and existing account
- Dropdown selector to choose which account to use as buffer
- Visual differentiation: Virtual buffer shows dashed border with infinity icon; Account buffer shows solid border with account icon and "Buffer" badge

## Updated Files

### Services
- `app/services/exportService.ts` - Added Account Items export, Buffer Account ID export
- `app/services/importService.ts` - Added Account Items import, Buffer Account ID import
- `app/services/depositService.ts` - Updated to support existing account as buffer

### Types
- `app/types/chain.ts` - Added `bufferAccountId` optional field

### Context
- `app/context/ChainContext.tsx` - Added `setBufferAccount` function

### Components
- `app/components/chain/ChainList.tsx` - Added `onWithdraw` prop
- `app/components/chain/ChainDisplay.tsx` - Added `onWithdraw` prop and existing account buffer display
- `app/components/chain/ChainEditModal.tsx` - Added buffer type selection UI and `onSetBufferAccount` prop
- `app/components/chain/ChainWithdrawModal.tsx` - **NEW** - Withdrawal modal component
- `app/components/chain/index.ts` - Exported ChainWithdrawModal

### Pages
- `app/chains/page.tsx` - Integrated withdrawal functionality
- `app/page.tsx` - Added `setBufferAccount` to ChainEditModal

### Tutorial
- `app/context/TutorialContext.tsx` - Updated chain tutorial step to mention withdrawal and buffer options

### Diagrams
- `docs/diagrams/class-diagram.md` - Updated Chain class and ChainContext
- `docs/diagrams/erd.md` - Updated CHAIN entity with `bufferAccountId` field and relationship

## Testing Recommendations

1. **Export/Import Items Test:**
   - Create an account with items
   - Export data to Excel/JSON
   - Clear data and import
   - Verify items are restored

2. **Withdrawal Chain Test:**
   - Create a chain with multiple accounts
   - Deposit funds to fill accounts
   - Withdraw various amounts and verify reverse order

3. **Buffer Account Selection Test:**
   - Create a chain with buffer enabled
   - Switch between virtual and account buffer
   - Make deposits that overflow and verify correct buffer behavior

## Backward Compatibility

All changes maintain backward compatibility:
- Existing chains without `bufferAccountId` continue to use virtual buffer
- Import service handles missing Account Items sheet gracefully
- Export version updated to ensure proper parsing
