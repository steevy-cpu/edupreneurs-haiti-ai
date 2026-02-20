

# Fix: Replace Jude Flash with Skeleton/Initial in Sidebar Avatar

## Location
**File:** `src/shell/components/AppSidebar.tsx`

## Change 1 — Import Skeleton and extract isLoading

**Line 17 (imports area):** Add `import { Skeleton } from '@/components/ui/skeleton';`

**Line 84:** Change `const { profile } = useUserProfile();` to `const { profile, isLoading: isProfileLoading } = useUserProfile();`

## Change 2 — Conditional avatar rendering (lines 172-182)

Replace the current `<img>` block inside the avatar container with conditional logic:

```tsx
{isProfileLoading ? (
  /* Skeleton placeholder — prevents Jude flash during query */
  <Skeleton className="w-full h-full rounded-full" />
) : userAvatar && userAvatar !== dashboardImage ? (
  /* Real avatar from profile */
  <img
    src={userAvatar}
    alt="User Avatar"
    className="w-full h-full object-cover"
    loading="lazy"
    decoding="async"
  />
) : (
  /* Neutral initial-based fallback when no avatar is saved */
  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-lg">
    {(userNickname ?? '?').charAt(0).toUpperCase()}
  </div>
)}
```

**Line 14 (imports area):** Add `import dashboardImage from '@/assets/dashboard00.png';` so we can compare against it to detect the Jude fallback.

## What this achieves

- **During loading:** A pulsing skeleton circle appears (no Jude face)
- **After loading, real avatar exists:** The user's saved avatar renders normally
- **After loading, no avatar:** A neutral gray circle with the user's first initial shows instead of Jude
- **No global changes:** `FALLBACK_PROFILE.avatarUrl` is untouched — other components are unaffected

## Safety Verification

| Check | Status |
|---|---|
| Jude image during loading | Eliminated — skeleton shown instead |
| Real avatar renders correctly | Yes — unchanged path when avatarUrl is valid |
| No-avatar fallback | Neutral initial circle, not Jude |
| FALLBACK_PROFILE changed? | No — sidebar-only fix |
| Other sidebar elements affected? | No — only avatar container touched |
| Nickname display below avatar | Unchanged |
| Collapsed sidebar avatar | Works — same container, same sizing |
| Bundle impact | None — Skeleton already in project |

