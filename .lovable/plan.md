

# Fix Stale Gold on Dashboard

## Problem
The dashboard KPI grid shows gold from `profileFeature.data.gold`, which comes from `fetchCriticalUserData()` -- a one-time fetch on mount. When a student returns from a lesson where they earned gold, the value is stale until a full page reload.

## Solution
Use `useUserProfile().goldEarned` inside `OverviewTab.tsx` instead of `analytics.gold`. Since `useUserProfile` is already invalidated when gold is awarded during lessons (Fix 3-5 from the previous implementation), the dashboard will automatically show fresh gold.

## Changes

### File: `src/components/dashboard/tabs/OverviewTab.tsx`

1. **Import** `useUserProfile` from `@/hooks/useUserProfile`
2. **Call** `const { profile } = useUserProfile();` at the top of the component
3. **Line 114:** Replace `{analytics.gold}` with `{profile.goldEarned}`
4. **Line 144:** Replace `analytics.gold === 0` with `profile.goldEarned === 0` in the zero-state helper check

No changes to `Dashboard.tsx`, no changes to the `OverviewTabProps` interface (the `analytics.gold` field stays for backward compat but is simply ignored in the KPI card).

## Technical Notes

- Zero additional network calls: `useUserProfile` is already active in the component tree (via `LessonPageTemplate`, `AppShell`, etc.) and cached with 10-min stale time
- TanStack Query deduplication ensures only one in-flight request even if multiple components call the same hook
- The `analytics.gold` prop remains in the interface to avoid breaking `Dashboard.tsx` or `ProgressTab` -- we only stop rendering it in the KPI card

## Safety

| Check | Status |
|-------|--------|
| No new DB queries | OK |
| No new dependencies | OK |
| No Provider/AppShell changes | OK |
| Backward compatible (prop still accepted) | OK |
| Works on 3G (no extra fetch) | OK |

