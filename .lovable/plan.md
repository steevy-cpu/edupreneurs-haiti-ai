

# Remove Emojis from Time Control Selector

## Problem
The `TimeControlSelector` component uses emojis (⚡, 🔥, ⏱️, ♟️, ∞) which violates the "anti-vibe" design standards established for this project.

## Solution
Replace all emojis with appropriate Lucide React icons for a cleaner, more professional look.

---

## Changes

### File: `src/components/chess/TimeControlSelector.tsx`

**Icon Mapping:**
| Time Control | Current (Emoji) | New (Lucide Icon) |
|--------------|-----------------|-------------------|
| Bullet       | ⚡              | `Zap`             |
| Blitz        | 🔥              | `Flame`           |
| Rapid        | ⏱️              | `Timer`           |
| Classic      | ♟️              | `Clock`           |
| Untimed      | ∞               | `Infinity`        |

**Technical Changes:**
1. Import `Zap`, `Flame`, `Timer`, `Clock`, `Infinity` from `lucide-react`
2. Update `TIME_CONTROLS` array to use `LucideIcon` type instead of string
3. Replace the `<span>` emoji wrapper with the actual icon component

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - visual change only |
| 3G optimized? | Yes - Lucide icons are tree-shaken |
| Mobile friendly? | Yes - icons scale properly |
| Consistent with design system? | Yes - follows anti-vibe guidelines |

