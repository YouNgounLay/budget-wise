# Implementation Plan: Agents Features

**Date:** February 8, 2026

## Overview
This plan covers the implementation of features outlined in the agents.md file:
1. Rule Frequency Options
2. Tutorial System
3. Layout Patching (Sidebar/Navbar fixes)
4. Search Feature

---

## 1. Rule Frequency Options

### Requirements
- Add frequency options: weekly, fortnightly, monthly, annually
- Display next trigger date for each rule

### Implementation

#### Types (app/types/rule.ts)
- Add `RuleFrequency` type: `'weekly' | 'fortnightly' | 'monthly' | 'annually'`
- Add `RULE_FREQUENCY_LABELS` constant
- Add `frequency` field to `AccountRule` interface
- Add `frequency` to DTOs

#### Service (app/services/ruleService.ts)
- Add `calculateNextTriggerDate(rule: AccountRule): Date` function
- Update rule creation/update logic

#### UI (app/components/account/AccountRulesModal.tsx, app/rules/page.tsx)
- Add frequency selector dropdown
- Display "Next Trigger Date" for each rule

---

## 2. Layout Patching

### Requirements
- Fix sidebar scrolling issue (shouldn't block navbar when scrolling)
- Remove navigation from header (keep only sidebar navigation)
- Add fuzzy search feature to header

### Implementation

#### Header (app/components/layout/Header.tsx)
- Remove navigation links
- Add search input with filter dropdown (accounts/chains/tags)
- Implement fuzzy search using simple string matching

#### Sidebar (app/components/layout/Sidebar.tsx)
- Fix position to not overlap with header on scroll
- Keep navigation in sidebar only

#### MainLayout (app/components/layout/MainLayout.tsx)
- Adjust layout structure for proper scrolling behavior

---

## 3. Settings System

### Requirements
- Merge dark/light mode toggle and theme selector into settings modal
- Add gear icon button to trigger settings
- Add tutorial button in settings

### Implementation

#### Create SettingsModal (app/components/shared/SettingsModal.tsx)
- Gear icon button trigger
- Dark/Light mode toggle
- Theme profile selector
- Data import/export
- Tutorial button

---

## 4. Tutorial System

### Requirements
- Interactive tutorial with opt-out option
- 6 steps covering:
  1. Create 5 dummy accounts (grocery $100, rent $500, mortgage $10,000, Excess Saving $500, Emergency Fund $3000)
  2. Create "medical insurance" account with blue color
  3. Show deposit/withdraw ($300 deposit, $100 withdraw)
  4. Create chain: grocery → rent → mortgage → emergency fund → excess saving
  5. Demonstrate rule setup (weekly automatic transaction)
  6. Guide through tag system

### Implementation

#### Create TutorialContext (app/context/TutorialContext.tsx)
- State: `isActive`, `currentStep`, `hasOptedOut`
- Actions: start, stop, nextStep, previousStep

#### Create TutorialOverlay (app/components/tutorial/TutorialOverlay.tsx)
- Modal overlay with highlighting
- Step content and navigation
- Exit button always visible

#### Create tutorial steps configuration
- Define step targets, content, and actions

---

## 5. Import/Export Updates

### Requirements
- Include rule frequency in exports
- Handle rule frequency in imports

### Implementation

#### Export Service (app/services/exportService.ts)
- Include rules in export data
- Update version to handle new fields

#### Import Service (app/services/importService.ts)
- Validate and import rules with frequency
- Add backward compatibility for old exports

---

## File Changes Summary

### New Files
- `app/components/shared/SettingsModal.tsx`
- `app/components/shared/SearchBar.tsx`
- `app/context/TutorialContext.tsx`
- `app/components/tutorial/TutorialOverlay.tsx`
- `app/components/tutorial/TutorialStep.tsx`
- `app/components/tutorial/index.ts`

### Modified Files
- `app/types/rule.ts` - Add frequency types
- `app/services/ruleService.ts` - Add next date calculation
- `app/components/layout/Header.tsx` - Remove nav, add search
- `app/components/layout/Sidebar.tsx` - Fix scroll position
- `app/components/layout/MainLayout.tsx` - Fix layout structure
- `app/components/account/AccountRulesModal.tsx` - Add frequency UI
- `app/rules/page.tsx` - Add frequency UI
- `app/services/exportService.ts` - Include rules
- `app/services/importService.ts` - Import rules
- `app/providers.tsx` - Add TutorialProvider
