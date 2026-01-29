# Theme Toggle Feature Documentation

## Implementation Date
January 29, 2026

## Feature Overview
A light/dark mode toggle functionality that allows users to switch between themes. The toggle button displays a custom animated Sun/Moon icon that clearly indicates the current theme state.

## Requirements
- Toggle button with custom icons (Sun for light mode, Moon for dark mode)
- System changes page colors based on selected theme
- Theme preference persists across sessions using localStorage
- Respects system preference as initial default when no preference is saved

## Implementation Details

### Files Created

#### 1. `app/context/ThemeContext.tsx`
- React Context for managing theme state
- `ThemeProvider` component that wraps the application
- Handles theme persistence using localStorage with key `budgetwise-theme`
- Detects system preference using `prefers-color-scheme` media query
- Exports `useTheme` hook for consuming components
- Applies theme class directly to `document.documentElement`

#### 2. `app/components/shared/ThemeToggle.tsx`
- Toggle button component with animated Sun/Moon icons
- Sun icon displayed in dark mode (click to switch to light)
- Moon icon displayed in light mode (click to switch to dark)
- Accessible with proper ARIA labels and title attributes
- BEM naming convention for CSS classes

### Files Modified

#### 1. `app/providers.tsx`
- Added `ThemeProvider` as the outermost provider wrapper

#### 2. `app/layout.tsx`
- Added `suppressHydrationWarning` to prevent hydration mismatch warnings
- Added inline `<script>` in `<head>` to apply theme class before React hydrates (prevents flash of wrong theme)

#### 3. `app/components/layout/Header.tsx`
- Imported `ThemeToggle` component
- Added toggle button to header actions area

#### 4. `app/style/globals.css`
- Added Tailwind v4 dark mode configuration: `@variant dark (&:is(.dark *));`
- Changed from media query-based theming to class-based theming (`.dark` selector)
- Added theme toggle component styles following BEM methodology
- Added `.sr-only` utility class for screen reader accessibility

#### 5. `app/context/index.ts`
- Exported `ThemeProvider` and `useTheme`

#### 6. `app/components/shared/index.ts`
- Exported `ThemeToggle` component

## Architecture

### Theme Flow
1. Inline script in `<head>` applies theme class immediately (prevents flash)
2. `ThemeProvider` initializes and syncs with the applied class
3. User clicks toggle → theme state updates → class changes → colors update
4. New preference saved to localStorage

### Tailwind v4 Dark Mode Configuration
```css
@variant dark (&:is(.dark *));
```
This tells Tailwind CSS v4 to use class-based dark mode triggered by the `.dark` class on the HTML element.

### Component Structure
```
Providers
└── ThemeProvider
    └── AccountProvider
        └── ChainProvider
            └── Application
```

## CSS Classes (BEM)

| Class | Description |
|-------|-------------|
| `.theme-toggle` | Block: Main toggle button |
| `.theme-toggle__icon-wrapper` | Element: Container for icons |
| `.theme-toggle__icon` | Element: Base icon styles |
| `.theme-toggle__icon--sun` | Modifier: Sun icon (amber color) |
| `.theme-toggle__icon--moon` | Modifier: Moon icon (indigo color) |
| `.theme-toggle__icon--visible` | Modifier: Visible state |
| `.theme-toggle__icon--hidden` | Modifier: Hidden state with animation |

## Usage

### Using the Theme Context
```tsx
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Using the ThemeToggle Component
```tsx
import { ThemeToggle } from '@/components/shared';

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

## Troubleshooting

### Issue: Theme not changing when toggle is clicked
**Solution:** Ensure the Tailwind v4 dark mode variant is configured in `globals.css`:
```css
@variant dark (&:is(.dark *));
```

### Issue: Flash of wrong theme on page load
**Solution:** Add inline script in `layout.tsx` `<head>` to apply theme before React hydrates.

## Testing Checklist
- [x] Toggle switches between light and dark mode
- [x] Theme persists after page refresh
- [x] Initial theme respects system preference when no saved preference
- [x] Theme changes are reflected throughout the application
- [x] Icons animate smoothly during transition
- [x] Button is accessible via keyboard navigation
- [x] Screen readers announce the button purpose correctly
- [x] No flash of wrong theme on initial load
