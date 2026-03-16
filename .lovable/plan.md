

## Fix: Jude Reading Assistant Input Blocked on Mobile

**Problem:** On mobile/tablet, the chat panel sits at `bottom-0` (line 126) but the bottom navigation bar (`ShellMobileBottomNav`) is also fixed at `bottom-0` with `h-14` (56px) + safe-area padding. The input area is hidden behind the nav bar, making it impossible to type.

**File to modify:** `src/components/ebook/EbookJudeAssistant.tsx` only

### Changes

1. **Add bottom padding on mobile** to the outer container so the panel clears the bottom nav:

   Line 126 — change:
   ```tsx
   <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-4 sm:w-96">
   ```
   to:
   ```tsx
   <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] right-0 z-50 w-full sm:bottom-6 sm:right-4 sm:w-96">
   ```
   `3.5rem` = 56px = the nav bar height. `env(safe-area-inset-bottom)` accounts for notch devices. On `sm+` breakpoint, the existing `bottom-6` takes over (desktop/tablet landscape — no bottom nav).

2. **Reduce max height on mobile** to prevent the panel from overflowing above the viewport now that it sits higher:

   Line 127 — change:
   ```tsx
   <div className="flex h-[70vh] max-h-[500px] flex-col ...">
   ```
   to:
   ```tsx
   <div className="flex h-[60vh] max-h-[500px] sm:h-[70vh] flex-col ...">
   ```
   Uses 60vh on mobile (where the bottom nav eats space) and 70vh on larger screens.

3. **Also fix the closed-state FAB** (line 110) which currently uses `bottom-24` on mobile — verify this still clears the raised panel position. Current value `bottom-24` (96px) is fine since the nav is ~56px.

### Safety

| Check | Result |
|---|---|
| Other files touched | No |
| Desktop layout | Unchanged — `sm:bottom-6` overrides |
| Keyboard handling | Bottom nav already hides via `useKeyboardOpen`, so no conflict |
| Safe area | Respected via `env(safe-area-inset-bottom)` |
| 3G impact | None — CSS only |

