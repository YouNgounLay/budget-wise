# Account Rules and Chain Percentage Distribution

**Implementation Date:** February 8, 2026

## Overview

This document describes two new features added to Budget-Wise:

1. **Custom Rules For Each Account** - Automated weekly fund allocation based on account balance thresholds
2. **Chain Percentage Distribution Mode** - Alternative distribution method for deposit chains

---

## Feature 1: Custom Rules For Each Account

### Description

Users can create allocation rules for accounts that automatically redistribute funds when certain conditions are met. Rules are triggered weekly based on a specified day of the week.

### How It Works

1. User sets a **Day of Week (DOW)** as the baseline for the rule
2. User specifies a **threshold amount (X)**
3. User defines **allocation targets** - a list of accounts with percentage distributions
4. Every week after the DOW has passed:
   - If the account balance exceeds X, the excess funds are calculated
   - The excess is distributed to target accounts based on assigned percentages
   - Original account retains exactly X amount

### Constraints

- If a rule exists from Account A to Account B, no duplicate rule for the same pair can be created
- Allocation percentages must sum to exactly 100%
- At least one allocation target is required
- Rules can be toggled active/inactive

### User Interface

- **Rules Button** on each Account Card opens the AccountRulesModal
- Modal displays:
  - List of existing rules for the account
  - Form to create new rules
  - Controls to edit, delete, or toggle rules
  - Execute button to manually trigger rule with preview

### Technical Implementation

#### Types ([app/types/rule.ts](../app/types/rule.ts))

```typescript
interface AccountRule {
  id: string;
  sourceAccountId: string;
  dayOfWeek: DayOfWeek; // 0 (Sunday) to 6 (Saturday)
  thresholdAmount: number;
  allocationTargets: AllocationTarget[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AllocationTarget {
  accountId: string;
  percentage: number; // Must sum to 100 across all targets
}

interface RuleExecutionResult {
  ruleId: string;
  sourceAccountId: string;
  excessAmount: number;
  allocations: {
    accountId: string;
    amount: number;
    percentage: number;
  }[];
  executedAt: string;
}
```

#### Services ([app/services/ruleService.ts](../app/services/ruleService.ts))

- `getAllRules()` - Retrieve all rules from storage
- `getRulesForAccount(accountId)` - Get rules for specific account
- `createRule(dto)` - Create new rule with validation
- `updateRule(id, dto)` - Update existing rule
- `deleteRule(id)` - Remove rule
- `executeRule(rule, accounts)` - Calculate allocations for a rule
- `getRulesForToday(dayOfWeek)` - Get active rules for current day
- `validateNoDuplicateTargets(targets)` - Ensure no duplicate account targets
- `validatePercentages(targets)` - Ensure percentages sum to 100

#### Context ([app/context/RuleContext.tsx](../app/context/RuleContext.tsx))

- Global state management using useReducer pattern
- Actions: SET_RULES, ADD_RULE, UPDATE_RULE, DELETE_RULE, TOGGLE_RULE_ACTIVE
- Provides: rules list, CRUD operations, execute functionality

---

## Feature 2: Chain Percentage Distribution Mode

### Description

Chains now support two distribution modes:

1. **Sequential Mode** (default) - Deposits fill accounts left-to-right until each reaches its limit
2. **Percentage Mode** - Deposits are split across all accounts based on assigned percentages

### How It Works

#### Sequential Mode (Existing Behavior)
- Deposit goes to first account until limit reached
- Overflow moves to next account in chain
- Continues until all funds allocated or overflow account receives remainder

#### Percentage Mode (New)
- Each account in chain has an assigned percentage (must sum to 100%)
- Deposit is immediately split: `account_deposit = total_deposit × (percentage / 100)`
- All accounts receive their share simultaneously
- No overflow logic - distribution is proportional

### User Interface

- **Distribution Mode Toggle** in ManageChainAccountsModal
- When in Sequential mode: Shows limit input for each account
- When in Percentage mode: Shows percentage input with validation
- Visual indicator shows current mode
- Deposit modal displays mode information

### Technical Implementation

#### Types ([app/types/chain.ts](../app/types/chain.ts))

```typescript
type ChainDistributionMode = 'sequential' | 'percentage';

interface ChainAccountConfig {
  accountId: string;
  limit: number;        // Used in sequential mode
  percentage: number;   // Used in percentage mode
}

interface Chain {
  // ... existing fields
  distributionMode: ChainDistributionMode;
  accounts: ChainAccountConfig[];
}
```

#### Services ([app/services/depositService.ts](../app/services/depositService.ts))

- `depositToChain()` - Routes to appropriate method based on mode
- `depositToChainSequential()` - Original linked-list style distribution
- `depositToChainByPercentage()` - New proportional distribution

```typescript
// Percentage distribution logic
accounts.forEach((acc) => {
  const depositAmount = amount * (acc.percentage / 100);
  // Apply to account balance
});
```

#### Context ([app/context/ChainContext.tsx](../app/context/ChainContext.tsx))

New actions and functions:
- `toggleDistributionMode(chainId)` - Switch between modes
- `setDistributionMode(chainId, mode)` - Set specific mode
- `updateAccountPercentageInChain(chainId, accountId, percentage)` - Update account's percentage

---

## Data Import/Export Support

Both features are fully supported in import/export:

### Export Changes
- Chains sheet includes new "Distribution Mode" column
- Chain Accounts sheet includes new "Percentage" column

### Import Changes
- Parses Distribution Mode with 'sequential' as default
- Parses Percentage with 0 as default

---

## Files Modified/Created

### New Files
- [app/types/rule.ts](../app/types/rule.ts) - Rule type definitions
- [app/services/ruleService.ts](../app/services/ruleService.ts) - Rule business logic
- [app/context/RuleContext.tsx](../app/context/RuleContext.tsx) - Rule state management
- [app/components/account/AccountRulesModal.tsx](../app/components/account/AccountRulesModal.tsx) - Rules UI

### Modified Files
- [app/types/chain.ts](../app/types/chain.ts) - Added distribution mode types
- [app/types/index.ts](../app/types/index.ts) - Export rule types
- [app/utils/storage.ts](../app/utils/storage.ts) - Added RULES storage key
- [app/services/chainService.ts](../app/services/chainService.ts) - Distribution mode support
- [app/services/depositService.ts](../app/services/depositService.ts) - Percentage distribution
- [app/services/importService.ts](../app/services/importService.ts) - Import new fields
- [app/services/exportService.ts](../app/services/exportService.ts) - Export new fields
- [app/services/index.ts](../app/services/index.ts) - Export ruleService
- [app/context/ChainContext.tsx](../app/context/ChainContext.tsx) - Distribution mode actions
- [app/context/index.ts](../app/context/index.ts) - Export RuleProvider
- [app/providers.tsx](../app/providers.tsx) - Added RuleProvider
- [app/components/account/AccountCard.tsx](../app/components/account/AccountCard.tsx) - Rules button
- [app/components/account/AccountList.tsx](../app/components/account/AccountList.tsx) - Pass rules handler
- [app/components/account/index.ts](../app/components/account/index.ts) - Export modal
- [app/components/chain/ManageChainAccountsModal.tsx](../app/components/chain/ManageChainAccountsModal.tsx) - Mode toggle UI
- [app/components/chain/ChainDepositModal.tsx](../app/components/chain/ChainDepositModal.tsx) - Mode display
- [app/accounts/page.tsx](../app/accounts/page.tsx) - Rules integration
- [app/chains/page.tsx](../app/chains/page.tsx) - Distribution mode props
- [app/page.tsx](../app/page.tsx) - Distribution mode props

---

## Validation Rules

### Account Rules
- Day of week: 0-6 (Sunday-Saturday)
- Threshold amount: Must be positive number
- Allocation targets: At least one required
- Percentages: Must sum to exactly 100%
- No duplicate source-target pairs across rules

### Chain Percentage Mode
- All account percentages must sum to exactly 100%
- Cannot switch to percentage mode if percentages don't sum to 100%
- Each account percentage must be 0-100

---

## Future Considerations

1. **Automated Rule Execution** - Currently manual; could add scheduler
2. **Rule History** - Track past executions for audit purposes
3. **Partial Percentage Mode** - Allow percentage mode with overflow for remainder
4. **Rule Templates** - Pre-defined common allocation patterns
