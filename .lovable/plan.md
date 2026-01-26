
# Cleanup: Remove Duplicate HeroSkeleton from SkeletonLoaders.tsx

## Problem
There are now **two** `HeroSkeleton` components:
1. **Active** (`src/components/shared/HeroSkeleton.tsx`) - The new Indeed-style branded loader with logo and progress bar
2. **Duplicate** (`src/components/shared/SkeletonLoaders.tsx:102-117`) - The old skeleton-based layout (unused)

The duplicate creates confusion and increases bundle size unnecessarily.

## Verification
- `App.tsx` imports `HeroSkeleton` from `@/components/shared/HeroSkeleton` (the new one)
- No other files import `HeroSkeleton` from `SkeletonLoaders.tsx`
- Safe to remove

---

## Changes

| File | Action |
|------|--------|
| `src/components/shared/SkeletonLoaders.tsx` | Remove duplicate `HeroSkeleton` definition and default export reference |

### Step 1: Remove HeroSkeleton component (lines 101-117)

Delete the following code:
```tsx
// Hero Section Skeleton for Index page (LCP optimization)
export const HeroSkeleton = () => (
  <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center py-8 px-4">
    <div className="space-y-4">
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-36 rounded-lg" />
        <Skeleton className="h-12 w-36 rounded-lg" />
      </div>
    </div>
    <Skeleton className="h-64 w-64 mx-auto rounded-full" />
  </div>
);
```

### Step 2: Remove from default export (line 418)

Before:
```tsx
export default {
  DashboardKPISkeleton,
  // ...
  ChartSkeleton,
  HeroSkeleton,  // ← Remove this line
  AuthFormSkeleton,
  // ...
};
```

After:
```tsx
export default {
  DashboardKPISkeleton,
  // ...
  ChartSkeleton,
  AuthFormSkeleton,
  // ...
};
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - App.tsx uses HeroSkeleton.tsx, not this one |
| Other importers affected? | No - verified no other imports |
| Bundle size impact? | Slight reduction (removed ~15 lines of unused code) |
