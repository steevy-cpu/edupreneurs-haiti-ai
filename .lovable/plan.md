
# First-Time User Flow Review & Fixes for New App Shell

## Overview

After restructuring to the new AppShell architecture, the first-time user onboarding flow needs updates to maintain compatibility with the centralized navigation and floating layer system.

## Issues Found

### Issue 1: Missing Tour Highlighting in ShellMobileBottomNav

**Problem**: The new `ShellMobileBottomNav.tsx` does not include tour highlighting logic, while the old `MobileBottomNav.tsx` did. Mobile users won't see the pulsing indicator showing which nav icon corresponds to the current tour step.

**Location**: `src/shell/components/ShellMobileBottomNav.tsx`

**Fix**: Add tour highlighting from `FirstTimeUserContext`:

```typescript
// Import the hook
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';

// In the component, add:
const { tourActive, tourCompleted, currentTourNavPath, isLoading: tourLoading } = useFirstTimeUser();
const tourHighlightPath = !tourLoading && tourActive && !tourCompleted ? currentTourNavPath : null;

// In the render, add highlighting ring:
const isHighlighted = tourHighlightPath === item.to;
// Add pulsing ring when highlighted
```

---

### Issue 2: Tour Step Navigation Path Mismatch

**Problem**: The tour expects certain paths that don't exist in the new mobile navigation configuration.

| Tour Step | Path | In New Mobile Nav? |
|-----------|------|-------------------|
| 0 | /dashboard | Yes |
| 1 | /matieres | Yes |
| 2 | /feed | No (replaced by /games) |
| 3 | /leaderboard | No |
| 4 | /passion-discovery | No |
| 5 | /community | Yes |
| 6 | /settings | Yes |

**Location**: `src/contexts/FirstTimeUserContext.tsx` (lines 7-15) and `src/shell/config/navigation.ts`

**Fix Options**:
- **Option A**: Update `MOBILE_NAVIGATION` to include `/feed` instead of `/games`
- **Option B**: Update `TOUR_STEP_NAV_PATHS` to use `/games` and accept that some steps won't highlight any icon (current behavior with `null`)

**Recommendation**: Keep Option B (current) since the tour already handles non-highlighted steps by setting `null`. The mobile nav is for quick access, not for tour purposes.

---

### Issue 3: Missing data-tour Attributes on Pages

**Problem**: The tour expects `data-tour` attributes that may be missing from several pages.

| Target | Expected Location | Status |
|--------|-------------------|--------|
| `data-tour='kpi-cards'` | Dashboard.tsx:654 | Present |
| `data-tour='subject-grid'` | Matieres.tsx | Missing |
| `data-tour='feed-content'` | Feed.tsx | Missing |
| `data-tour='leaderboard-list'` | Leaderboard.tsx | Missing |
| `data-tour='passion-categories'` | PassionDiscovery.tsx | Missing |
| `data-tour='community-list'` | Community.tsx | Missing |
| `data-tour='settings-content'` | Settings.tsx:381 | Present |

**Fix**: Add missing `data-tour` attributes to each page's main content container.

---

## Implementation Plan

### Step 1: Add Tour Highlighting to ShellMobileBottomNav

**File**: `src/shell/components/ShellMobileBottomNav.tsx`

```typescript
// Add import
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';

// Add in component (after other hooks)
const { tourActive, tourCompleted, currentTourNavPath, isLoading: tourLoading } = useFirstTimeUser();
const tourHighlightPath = !tourLoading && tourActive && !tourCompleted ? currentTourNavPath : null;

// In the nav item render, add:
const isHighlighted = tourHighlightPath === item.to;

// In the icon div, add highlight ring:
{isHighlighted && (
  <div className="absolute inset-[-10px] rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
)}

// Add z-index to highlighted item
className={cn(..., isHighlighted && 'z-[1005]')}
```

### Step 2: Add Missing data-tour Attributes

**File**: `src/pages/Matieres.tsx`
- Find the main subject grid container
- Add: `data-tour="subject-grid"`

**File**: `src/pages/Feed.tsx`
- Find the main feed content container
- Add: `data-tour="feed-content"`

**File**: `src/pages/Leaderboard.tsx`
- Find the leaderboard list container
- Add: `data-tour="leaderboard-list"`

**File**: `src/pages/PassionDiscovery.tsx`
- Find the passion categories grid
- Add: `data-tour="passion-categories"`

**File**: `src/pages/Community.tsx`
- Find the community/conversations list
- Add: `data-tour="community-list"`

---

## Architecture Validation

| Component | Status | Notes |
|-----------|--------|-------|
| FirstTimeUserProvider in AppProviders | Correct | Inside BrowserRouter |
| FloatingLayer renders OnboardingOverlays | Correct | Lazy-loaded |
| FirstTimeUserContext uses useSessionAuth | Correct | Centralized auth |
| Tour navigation uses double RAF | Correct | Prevents React error #310 |
| Tour z-index layering | Correct | z-[1003] overlay, z-[1004] dialog |

---

## Files to Modify

1. `src/shell/components/ShellMobileBottomNav.tsx` - Add tour highlighting
2. `src/pages/Matieres.tsx` - Add `data-tour="subject-grid"`
3. `src/pages/Feed.tsx` - Add `data-tour="feed-content"`
4. `src/pages/Leaderboard.tsx` - Add `data-tour="leaderboard-list"`
5. `src/pages/PassionDiscovery.tsx` - Add `data-tour="passion-categories"`
6. `src/pages/Community.tsx` - Add `data-tour="community-list"`

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - additive changes only |
| Works with existing data? | Yes - uses existing context |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes - no API changes |
| Hook ordering maintained? | Yes - hooks called unconditionally at top |

---

## Expected Outcome

After these changes:
- Mobile users will see the pulsing highlight on nav icons during the tour
- Tour dialogs will correctly position relative to `data-tour` target elements
- The flow sequence (Welcome → Avatar → Tour) remains unchanged
- All tour steps will navigate and display correctly
