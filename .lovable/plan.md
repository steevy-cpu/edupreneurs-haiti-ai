
# Plan: Fix Mobile Menu Background Transparency Issue

## Problem Analysis

The mobile navigation menu in `HeaderNav.tsx` shows page content ("Pour les élèves" section) bleeding through at the bottom. This happens because:

1. **Current Implementation**: The mobile menu uses a `max-h-96` (384px) height constraint with `overflow-hidden` and slides down inline with the document flow
2. **Root Cause**: When the menu is shorter than max-height, there's no visual "cap" - and the sticky header's z-index doesn't prevent content from appearing behind the semi-transparent header backdrop
3. **The `bg-card` class** is correct, but the menu expansion pattern doesn't create a solid overlay

## Solution

Transform the mobile menu from an inline expanding element to a proper dropdown overlay that:
- Has guaranteed solid background color
- Uses proper z-indexing to overlay page content  
- Adds a shadow to visually separate from content below

## Implementation

### File: `src/components/home/HeaderNav.tsx`

**Current mobile menu container (lines 100-104):**
```tsx
<div 
  className={`lg:hidden bg-card border-t border-border overflow-hidden transition-all duration-300 ease-out ${
    mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
  }`}
>
```

**Fixed:**
```tsx
<div 
  className={`lg:hidden absolute left-0 right-0 top-full bg-card border-t border-border shadow-lg overflow-hidden transition-all duration-300 ease-out ${
    mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
  }`}
>
```

**Key Changes:**

| Change | Purpose |
|--------|---------|
| `absolute left-0 right-0 top-full` | Position menu as overlay below header |
| `shadow-lg` | Visual separation from page content |
| `max-h-[500px]` | Slightly more room for content if needed |
| `pointer-events-none` when closed | Prevent accidental clicks on hidden menu |

**Also update the parent header element (line 27):**

Current:
```tsx
<header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300">
```

Fixed (add `relative` for absolute child positioning):
```tsx
<header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300 relative">
```

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Same visual appearance, just better layering |
| Affects desktop? | No | `lg:hidden` keeps it mobile/tablet only |
| 3G performance? | Yes | No additional resources, just CSS |
| Works with dark mode? | Yes | `bg-card` adapts to theme |
| Accessibility? | Yes | No changes to ARIA attributes |

## Expected Result

After this fix:
- Mobile menu will properly overlay page content
- No more "Pour les élèves" section bleeding through
- Clean shadow separates menu from page
- Menu closes cleanly without visual artifacts
