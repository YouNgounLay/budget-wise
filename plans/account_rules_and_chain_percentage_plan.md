# Implementation Plan: Custom Account Rules & Chain Percentage Mode

**Date:** February 8, 2026  
**Features:**  
1. Custom Rules For Each Account  
2. Modify Chained Account (Percentage-based distribution)

---

## Feature 1: Custom Rules For Each Account

### Overview
Allow users to add special limited rulesets to accounts. Each ruleset includes:
- Setting a Day of Week (DOW) as baseline
- Setting a threshold amount (X) for an account
- Every week after the DOW passes, if the account balance exceeds X, automatically allocate exceeding funds to a list of target accounts based on configured percentages
- Prevent duplicate rulesets between the same two accounts (A to B)

### Types Required

```typescript
// New types in app/types/rule.ts
interface AllocationTarget {
  accountId: string;
  percentage: number; // 0-100, sum must equal 100
}

interface AccountRule {
  id: string;
  sourceAccountId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  thresholdAmount: number;
  targets: AllocationTarget[];
  isActive: boolean;
  lastExecuted: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAccountRuleDTO {
  sourceAccountId: string;
  dayOfWeek: number;
  thresholdAmount: number;
  targets: AllocationTarget[];
}

interface UpdateAccountRuleDTO {
  dayOfWeek?: number;
  thresholdAmount?: number;
  targets?: AllocationTarget[];
  isActive?: boolean;
}
```

### Implementation Steps

1. **Create Types** (`app/types/rule.ts`)
   - Define AccountRule interface
   - Define AllocationTarget interface
   - Define DTOs for create/update operations

2. **Create Rule Service** (`app/services/ruleService.ts`)
   - CRUD operations for rules
   - Validation for duplicate rules (same source → target pair)
   - Rule execution logic

3. **Create Rule Context** (`app/context/RuleContext.tsx`)
   - Global state management for rules
   - CRUD actions and helpers

4. **Create UI Components**
   - `AccountRuleForm.tsx` - Form for creating/editing rules
   - `AccountRuleList.tsx` - Display list of rules for an account
   - `AccountRulesModal.tsx` - Modal wrapper for managing rules

5. **Update Account Page**
   - Add "Rules" action button to account cards
   - Integrate AccountRulesModal

6. **Add Rule Execution Service**
   - Check and execute rules based on DOW
   - Allocate excess funds to target accounts

---

## Feature 2: Modify Chained Account (Percentage Mode)

### Overview
Add a toggle option to chains that allows percentage-based distribution instead of the current sequential (limit-based) distribution.

### Type Updates Required

```typescript
// Update Chain interface in app/types/chain.ts
interface ChainAccountConfig {
  accountId: string;
  limit: number;
  percentage?: number; // 0-100, used when chain is in percentage mode
}

interface Chain {
  // ... existing fields
  distributionMode: 'sequential' | 'percentage'; // NEW FIELD
}

// New result type
interface PercentageDepositResult {
  success: boolean;
  deposits: {
    accountId: string;
    accountName: string;
    amount: number;
    percentage: number;
    newBalance: number;
  }[];
  message: string;
}
```

### Implementation Steps

1. **Update Chain Types** (`app/types/chain.ts`)
   - Add `distributionMode` field to Chain interface
   - Add `percentage` field to ChainAccountConfig

2. **Update Chain Context** (`app/context/ChainContext.tsx`)
   - Add `toggleDistributionMode` action
   - Add `updateAccountPercentage` action
   - Update createChain to include default distributionMode

3. **Update Deposit Service** (`app/services/depositService.ts`)
   - Add `depositToChainByPercentage` function
   - Modify `depositToChain` to check mode and delegate

4. **Update ManageChainAccountsModal**
   - Add distribution mode toggle
   - Show percentage inputs when in percentage mode
   - Validate percentages sum to 100%

5. **Update ChainDepositModal**
   - Support percentage-based preview
   - Display percentage allocations

6. **Update ChainDisplay & ChainList**
   - Show current distribution mode
   - Display percentage information when applicable

---

## File Changes Summary

### New Files
- `app/types/rule.ts`
- `app/services/ruleService.ts`
- `app/context/RuleContext.tsx`
- `app/components/account/AccountRuleForm.tsx`
- `app/components/account/AccountRuleList.tsx`
- `app/components/account/AccountRulesModal.tsx`

### Modified Files
- `app/types/chain.ts` - Add distributionMode and percentage fields
- `app/types/index.ts` - Export new rule types
- `app/context/ChainContext.tsx` - Add new actions for percentage mode
- `app/services/depositService.ts` - Add percentage deposit logic
- `app/components/chain/ManageChainAccountsModal.tsx` - Add mode toggle and percentage inputs
- `app/components/chain/ChainDepositModal.tsx` - Support percentage mode
- `app/components/chain/ChainDisplay.tsx` - Show distribution mode
- `app/components/account/index.ts` - Export new components
- `app/accounts/page.tsx` - Add rules button
- `app/providers.tsx` - Add RuleProvider
- `app/utils/storage.ts` - Add RULES storage key

---

## Validation Rules

### Feature 1 - Account Rules
- No duplicate rules for same source → target account pair
- Target percentages must sum to 100%
- Threshold amount must be positive
- Day of week must be 0-6
- Source account cannot be in its own targets

### Feature 2 - Chain Percentage Mode
- All account percentages must sum to 100%
- Percentage must be between 0-100
- At least one account required in percentage mode

---

## Testing Considerations

1. Test rule creation and validation
2. Test duplicate rule prevention
3. Test percentage calculations for both features
4. Test mode switching in chains
5. Test edge cases (0%, 100%, negative amounts)

---

## Implementation Order

1. Feature 2 (Chain Percentage Mode) - Less complex, modifies existing structure
2. Feature 1 (Account Rules) - New feature requiring new context and components
