
# Feed Fix — Hide Grade Tag for Super Users

## What
Add one condition to the grade tag rendering (line 1061-1063 in `src/pages/Feed.tsx`) to suppress the badge when the post author is a founder/super user.

## How Super Users Are Identified
There is no database column for founder status. Founders are identified client-side by UUID match via `isFounder(userId)` from `src/lib/founderConstants.ts`. This function checks against hardcoded UUIDs for Steevy and Djood.

## Change

**File:** `src/pages/Feed.tsx`

1. Add import at top: `import { isFounder } from "@/lib/founderConstants";`

2. Update grade tag condition (lines 1061-1063) from:
```tsx
{post.profile?.academic_grade && 
 post.profile.academic_grade !== 'NONE' && 
 GRADE_COLORS[post.profile.academic_grade] && (
```
To:
```tsx
{post.profile?.academic_grade && 
 post.profile.academic_grade !== 'NONE' && 
 !isFounder(post.user_id) &&
 GRADE_COLORS[post.profile.academic_grade] && (
```

One import, one line added. No other files touched.

## Safety

| Check | Result |
|---|---|
| Only grade tag rendering affected | Yes -- single condition added |
| Plan A/B/C code untouched | Yes |
| Non-founder posts still show grade tags | Yes -- isFounder returns false for them |
| Founder posts (Steevy, Djood) hide grade tag | Yes -- isFounder returns true |
| No new dependencies | Yes -- founderConstants already in the project |
