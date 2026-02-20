

# Fix — Hide Grade Tag and Globe Icon for Founders and Jude

## Problem

- **Djood** — correct (no globe, no grade tag)
- **Steeve** — globe icon shows (his posts are `is_public = true`)
- **Jude** — both globe icon AND NS4 grade tag show (Jude's UUID is not in `FOUNDER_USER_IDS`)

## Root Cause

1. Jude's UUID (`68f2f959-e14a-47f9-8277-07df3a6fcd79`) is not in the `FOUNDER_USER_IDS` array, so `isFounderUser()` returns false and the grade tag renders.
2. The globe icon renders for any post with `is_public = true` — no exclusion for special accounts.

## Fix (src/pages/Feed.tsx only)

**A) Import JUDE_USER_ID** (already imported at line 23):
```typescript
import { JUDE_USER_ID } from "@/types/community";
```
Already present — no change needed.

**B) Create a helper to check if a user is a "special account" (founder or Jude):**

```typescript
// Founders and Jude (AI assistant) — suppress grade tags and public globe icon
const isSpecialAccount = (userId: string) => isFounderUser(userId) || userId === JUDE_USER_ID;
```

**C) Update grade tag condition (line 1062-1064)** from:
```tsx
!isFounderUser(post.user_id) &&
```
to:
```tsx
!isSpecialAccount(post.user_id) &&
```

**D) Update globe icon condition (line 1056-1059)** from:
```tsx
{post.is_public && (
```
to:
```tsx
{post.is_public && !isSpecialAccount(post.user_id) && (
```

## Files Changed

| File | Change |
|---|---|
| `src/pages/Feed.tsx` | Add `isSpecialAccount` helper, update 2 conditions (globe + grade tag) |

## Safety

| Check | Result |
|---|---|
| Djood posts — no globe, no grade tag | Yes (already correct, stays correct) |
| Steeve posts — globe hidden, no grade tag | Yes |
| Jude posts — globe hidden, grade tag hidden | Yes |
| Regular user posts — globe + grade tag unchanged | Yes |
| Plan A/B/C code untouched | Yes |

