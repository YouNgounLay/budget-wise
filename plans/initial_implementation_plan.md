# Budget-wise Initial Implementation Plan

## Overview
This plan outlines the implementation of the Budget-wise account-based budget planner application as described in the agents.md file.

## Features to Implement

### Phase 1: Core Models & Types
1. **Account Model** - Fix and enhance the existing Account model
   - `id`: Unique identifier (UUID)
   - `name`: Account name
   - `description`: Short description of account purpose
   - `amount`: Current balance
   - `icon`: Custom icon selection
   - `color`: Custom color scheme
   - `createdAt`: Creation timestamp
   - `updatedAt`: Last update timestamp

2. **Chain Model** - New model for deposit/withdrawal chains
   - `id`: Unique identifier (UUID)
   - `name`: Chain name
   - `accounts`: Ordered array of account IDs
   - `defaultLimit`: Default limit per account (default: 2000)
   - `accountLimits`: Custom limits per account in chain
   - `createdAt`: Creation timestamp
   - `updatedAt`: Last update timestamp

### Phase 2: State Management & Services
1. **Account Service** - CRUD operations for accounts
   - `createAccount()`
   - `getAccount(id)`
   - `getAllAccounts()`
   - `updateAccount(id, data)`
   - `deleteAccount(id)`

2. **Chain Service** - Chain management operations
   - `createChain()`
   - `getChain(id)`
   - `getAllChains()`
   - `addAccountToChain(chainId, accountId)`
   - `removeAccountFromChain(chainId, accountId)`
   - `reorderChain(chainId, newOrder)`
   - `deleteChain(id)`

3. **Deposit Service** - Chain deposit/withdrawal logic
   - `depositToChain(chainId, amount)` - Deposits left to right, moving along when limit is met
   - `withdrawFromChain(chainId, amount)`
   - `depositToAccount(accountId, amount)`
   - `withdrawFromAccount(accountId, amount)`

### Phase 3: UI Components
1. **Layout Components**
   - `Header` - Navigation and branding
   - `Sidebar` - Navigation menu
   - `MainLayout` - Page wrapper

2. **Account Components**
   - `AccountCard` - Display single account with icon/color
   - `AccountList` - Grid/list of accounts
   - `AccountForm` - Create/edit account modal
   - `IconPicker` - Custom icon selection
   - `ColorPicker` - Color scheme selection

3. **Chain Components**
   - `ChainDisplay` - Visual chain representation with overflow handling
   - `ChainList` - List of all chains
   - `ChainForm` - Create/edit chain
   - `ChainDepositModal` - Deposit interface

4. **Shared Components**
   - `Modal` - Reusable modal component
   - `Button` - Styled button component
   - `Input` - Form input component
   - `Card` - Base card component

### Phase 4: Pages
1. **Dashboard Page** (`/`) - Overview of accounts and chains
2. **Accounts Page** (`/accounts`) - Manage accounts
3. **Chains Page** (`/chains`) - Manage chains
4. **Account Detail Page** (`/accounts/[id]`) - Single account view

### Phase 5: Data Persistence
- Use localStorage for MVP
- Prepare for future database integration

## Technical Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with custom design system
- **State**: React Context + useReducer
- **Package Manager**: pnpm

## File Structure
```
app/
├── layout.tsx
├── page.tsx (Dashboard)
├── accounts/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── chains/
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── account/
│   │   ├── AccountCard.tsx
│   │   ├── AccountList.tsx
│   │   ├── AccountForm.tsx
│   │   ├── IconPicker.tsx
│   │   └── ColorPicker.tsx
│   ├── chain/
│   │   ├── ChainDisplay.tsx
│   │   ├── ChainList.tsx
│   │   ├── ChainForm.tsx
│   │   └── ChainDepositModal.tsx
│   └── shared/
│       ├── Modal.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── context/
│   ├── AccountContext.tsx
│   └── ChainContext.tsx
├── hooks/
│   ├── useAccounts.ts
│   └── useChains.ts
├── model/
│   ├── account.ts
│   └── chain.ts
├── services/
│   ├── accountService.ts
│   ├── chainService.ts
│   └── depositService.ts
├── types/
│   ├── account.ts
│   └── chain.ts
├── utils/
│   ├── storage.ts
│   └── helpers.ts
└── style/
    ├── globals.css
    ├── components.css
    └── variables.css
```

## Custom Icons (To Be Implemented)
- 💰 Money/Cash
- 🚗 Car
- 🛒 Grocery
- 🏠 Home
- 💊 Health
- 🎓 Education
- 🎮 Entertainment
- ✈️ Travel
- 👔 Clothing
- 💼 Business
- 🍽️ Food
- 📱 Technology
- 💪 Fitness
- 🎁 Gifts
- 📦 Savings

## Color Schemes
Pre-defined color options using the existing design tokens:
- Jet Black (#122C34)
- Yale Blue (#224870)
- French Blue (#2A4494)
- Fresh Sky (#4EA5D9)
- Strong Cyan (#44CFCB)
- Plus additional custom colors

## Implementation Order
1. ✅ Create plan (this document)
2. Set up types and models
3. Implement services
4. Create context providers
5. Build shared components
6. Build account components
7. Build chain components
8. Create pages
9. Add styling
10. Testing
11. Documentation

---

**Status**: Awaiting approval to proceed

**Date Created**: 27 January 2026
