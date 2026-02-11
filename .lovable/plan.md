

# Fix: Subscription Banner Hidden Behind Sidebar

## Problem
The subscription expiry banner at the top of the page uses `z-50` (z-index: 50), but the sidebar uses `z-[1000]`. This means the sidebar renders **on top** of the banner, cutting it off on the left side.

## Solution
Two changes to `src/components/SubscriptionExpiryBanner.tsx`:

1. **Increase z-index** from `z-50` to `z-[1100]` so the banner stacks above the sidebar (`z-[1000]`) and the sidebar toggle button (`z-[1001]`).

2. **Add left padding on desktop** to offset the banner content from behind the sidebar. On large screens (`lg:`), add `lg:pl-[260px]` (matching the sidebar width) so the banner text starts after the sidebar. This way the banner spans the full top but the content is visible.

## Technical Detail

**File: `src/components/SubscriptionExpiryBanner.tsx`** (line 45)

Change the className from:
```
fixed top-0 left-0 right-0 z-50 px-4 py-2.5 ...
```
To:
```
fixed top-0 left-0 right-0 z-[1100] px-4 py-2.5 lg:pl-[260px] ...
```

This keeps the banner full-width visually (background color spans edge to edge) while ensuring the text and buttons are not hidden behind the sidebar on desktop.

