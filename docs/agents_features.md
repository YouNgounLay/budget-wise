# Agents Features Documentation

This document describes the features implemented based on the requirements in `agents.md`.

## 1. Rule Frequency System

### Overview
Rules now support configurable execution frequencies, allowing users to specify how often automated transactions should trigger.

### Frequency Options
- **Weekly**: Triggers every week on the specified day
- **Fortnightly**: Triggers every two weeks on the specified day
- **Monthly**: Triggers once per month on the specified day of week (first occurrence)
- **Annually**: Triggers once per year on the specified day of week (first occurrence)

### Next Trigger Date Display
Each active rule displays the next calculated trigger date, helping users understand when their automated transactions will execute.

### Implementation Files
- [app/types/rule.ts](../app/types/rule.ts) - Added `RuleFrequency` type, frequency labels/options, `calculateNextTriggerDate()`, and `formatNextTriggerDate()` functions
- [app/context/RuleContext.tsx](../app/context/RuleContext.tsx) - Updated to include frequency in rule creation
- [app/services/ruleService.ts](../app/services/ruleService.ts) - Updated `createRule` to include frequency
- [app/components/account/AccountRulesModal.tsx](../app/components/account/AccountRulesModal.tsx) - Added frequency selector UI
- [app/rules/page.tsx](../app/rules/page.tsx) - Added frequency display and next trigger date

---

## 2. Layout Improvements

### Sidebar Fix
The sidebar now uses sticky positioning to prevent it from scrolling with the page content. It remains fixed in place while the main content area scrolls.

### Navigation Consolidation
Navigation links have been removed from the top header and consolidated into the sidebar only, eliminating redundancy.

### Implementation Files
- [app/components/layout/Header.tsx](../app/components/layout/Header.tsx) - Removed navigation links, simplified layout
- [app/components/layout/Sidebar.tsx](../app/components/layout/Sidebar.tsx) - Added `lg:sticky lg:top-16` positioning and `overflow-y-auto`

---

## 3. Fuzzy Search Feature

### Overview
A search bar has been added to the header that allows users to fuzzy search for accounts, chains, and tags.

### Features
- **Filter Dropdown**: Users can filter search results by type (All, Accounts, Chains, Tags)
- **Fuzzy Matching**: Searches match partial strings and are case-insensitive
- **Keyboard Navigation**: Arrow keys navigate results, Enter selects, Escape closes
- **Quick Navigation**: Clicking a result navigates directly to the relevant page

### Implementation Files
- [app/components/shared/SearchBar.tsx](../app/components/shared/SearchBar.tsx) - New fuzzy search component
- [app/components/shared/index.ts](../app/components/shared/index.ts) - Added SearchBar export
- [app/components/layout/Header.tsx](../app/components/layout/Header.tsx) - Integrated SearchBar

---

## 4. Settings System

### Overview
A unified settings modal has been created, accessible via a gear icon in the header. This consolidates multiple settings-related features into one location.

### Features
- **Theme Mode Toggle**: Switch between light and dark modes
- **Theme Profile Selector**: Choose from predefined theme profiles or custom themes
- **Theme Management**: Create, edit, and delete custom theme profiles
- **Data Import/Export**: Quick access to the data import/export modal
- **Tutorial Launcher**: Button to start the application tutorial

### Implementation Files
- [app/components/shared/SettingsModal.tsx](../app/components/shared/SettingsModal.tsx) - New unified settings dropdown
- [app/components/shared/index.ts](../app/components/shared/index.ts) - Added SettingsModal export
- [app/components/layout/Header.tsx](../app/components/layout/Header.tsx) - Integrated SettingsModal

---

## 5. Tutorial System

### Overview
An interactive tutorial system guides new users through the application's features with step-by-step instructions.

### Tutorial Steps
1. **Welcome**: Introduction with 5 sample accounts created automatically (Grocery $100, Rent $500, Mortgage $10,000, Excess Saving $500, Emergency Fund $3,000)
2. **Create Account**: Guides user to create a "Medical Insurance" account with description, icon, and blue color
3. **Find Account**: Shows where to find newly created accounts in the sidebar
4. **Transactions**: Demonstrates deposit ($300) and withdrawal ($100) functionality
5. **Create Chain**: Explains the chain system and guides creation of a chain with specific account order
6. **Rule System**: Shows how to set up automatic weekly transactions
7. **Tag System**: Demonstrates tag creation, assignment, and customization

### Features
- **Exit Anytime**: Users can opt out of the tutorial at any step
- **Progress Indicator**: Visual progress bar shows current step and total steps
- **Navigation Controls**: Previous/Next buttons with step descriptions
- **Persistent State**: Tutorial completion state is preserved in local storage

### Implementation Files
- [app/context/TutorialContext.tsx](../app/context/TutorialContext.tsx) - Tutorial state management and step definitions
- [app/components/tutorial/TutorialOverlay.tsx](../app/components/tutorial/TutorialOverlay.tsx) - Tutorial modal overlay component
- [app/providers.tsx](../app/providers.tsx) - Added TutorialProvider
- [app/context/index.ts](../app/context/index.ts) - Added tutorial exports

---

## 6. Import/Export Updates

### Overview
The import and export services have been updated to handle the new rule frequency field.

### Changes
- **Export**: Includes rules with their frequency settings in both JSON and Excel formats
- **Import**: Parses rules with frequency, with backward compatibility for older exports (defaults to 'weekly')
- **Excel Format**: Added "Rules" sheet and "Rule Targets" sheet for rule data

### Version
Export format version updated to **1.2** to reflect the inclusion of rules data.

### Implementation Files
- [app/services/exportService.ts](../app/services/exportService.ts) - Updated to export rules with frequency
- [app/services/importService.ts](../app/services/importService.ts) - Updated to import rules with backward compatibility

---

## Type Definitions

### RuleFrequency
```typescript
type RuleFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'annually';
```

### Updated AccountRule
```typescript
interface AccountRule {
  id: string;
  accountId: string;
  name: string;
  isActive: boolean;
  dayOfWeek: DayOfWeek;
  frequency: RuleFrequency;  // NEW
  thresholdAmount: number;
  targets: AllocationTarget[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Usage Examples

### Setting Rule Frequency
When creating or editing a rule, users can select the frequency from a dropdown menu. The next trigger date is automatically calculated and displayed.

### Using the Search Bar
1. Click on the search input in the header
2. Optionally select a filter (All, Accounts, Chains, Tags)
3. Type to search - results appear in real-time
4. Click a result or use keyboard navigation to select

### Starting the Tutorial
1. Click the gear icon in the header
2. Click "Start Tutorial" button
3. Follow the on-screen instructions
4. Click "Exit Tutorial" at any time to skip
