# Theme Toggle Feature - Implementation Plan

## Feature Overview
Implement a light/dark mode toggle functionality with a custom icon button that clearly indicates the current theme state.

## Requirements
1. Toggle button with custom icons (Sun for light mode, Moon for dark mode)
2. System should change page colors based on selected theme
3. Theme preference should persist across sessions
4. Follow existing project styling conventions (SMACSS, OOCSS, BEM)
5. Follow SOLID, GRASP, Clean Code principles

## Implementation Steps

### 1. Create Theme Context (`app/context/ThemeContext.tsx`)
- Create a React Context for managing theme state
- Implement `ThemeProvider` component
- Handle theme persistence using localStorage
- Detect system preference as initial default
- Export `useTheme` hook for consuming components

### 2. Create Theme Toggle Component (`app/components/shared/ThemeToggle.tsx`)
- Custom toggle button with animated Sun/Moon icons
- Clear visual indication of current theme
- Accessible button with proper ARIA attributes
- BEM naming conventions for CSS classes

### 3. Update Providers (`app/providers.tsx`)
- Wrap application with `ThemeProvider`

### 4. Update Layout (`app/layout.tsx`)
- Add theme class to HTML element for CSS targeting
- Handle hydration properly

### 5. Integrate in Header (`app/components/layout/Header.tsx`)
- Add ThemeToggle button to header navigation

### 6. Update Styles (`app/style/globals.css`)
- Add CSS custom properties for light/dark themes
- Remove media query dependency, use class-based theming
- Add theme toggle button styles

### 7. Update Exports
- Update `app/context/index.ts` to export ThemeContext
- Update `app/components/shared/index.ts` to export ThemeToggle

## File Changes Summary
| File | Action |
|------|--------|
| `app/context/ThemeContext.tsx` | Create |
| `app/components/shared/ThemeToggle.tsx` | Create |
| `app/providers.tsx` | Update |
| `app/layout.tsx` | Update |
| `app/components/layout/Header.tsx` | Update |
| `app/style/globals.css` | Update |
| `app/context/index.ts` | Update |
| `app/components/shared/index.ts` | Update |

## Testing
- Verify toggle switches between light and dark mode
- Verify theme persists after page refresh
- Verify initial theme respects system preference
- Verify theme changes are reflected throughout the app

## Dependencies
- No additional dependencies required (using native React and CSS)
