
# Fix: Community Chat Mobile Keyboard Layout Bug

## Root Cause (Precise)

The conversation view `<section>` in `Community.tsx` (line 2196) uses `position: fixed` on mobile with:
```
fixed inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))]
```

`position: fixed` anchors to the **layout viewport** — the full browser window that does NOT shrink when the virtual keyboard opens. When the keyboard rises:
- The fixed bottom stays at the original screen bottom, now hidden behind the keyboard
- The input bar is physically present but covered by the keyboard
- `ChatLayout` receives the full pre-keyboard height as `h-full`, so `flex-1` (message list) expands into the hidden zone
- The chat background pattern appears to overflow because the container hasn't shrunk

The Community page root `<div>` already correctly uses `h-dvh` (dynamic viewport height, responds to keyboard), but the `fixed` child ignores its parent entirely.

## The Fix

Replace `position: fixed` with `position: absolute` on mobile. The root `<div>` is already `relative h-dvh overflow-hidden` — making the section `absolute inset-0` on mobile means it fills the exact visual-viewport-aware parent instead of the layout viewport.

This is a **single-line class change** in `Community.tsx`. No new dependencies, no structural changes, no other files touched.

### Before (line 2199)
```
"fixed inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] flex md:relative md:inset-auto md:bottom-auto md:pb-16 lg:pb-0 md:flex md:h-full"
```

### After
```
"absolute inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] flex md:relative md:inset-auto md:bottom-auto md:pb-16 lg:pb-0 md:flex md:h-full"
```

**Why `absolute` works here:**
- The parent `<div>` is `relative h-dvh overflow-hidden` — `dvh` is the **dynamic viewport height** that automatically contracts when the keyboard appears on iOS 15.4+ and Android Chrome 108+
- `absolute` children respect the parent's computed height, so as `h-dvh` shrinks with the keyboard, the conversation section shrinks too
- `ChatLayout` is `h-full flex flex-col overflow-hidden` — it fills the absolute section exactly, and since the section now shrinks, `flex-1` (message list) contracts correctly above the input bar
- The input (`ChatComposer`) is in `ChatLayout`'s `<footer>` with `shrink-0` — it stays anchored to the visual bottom, above the keyboard

## Why Not Other Approaches

| Approach | Problem |
|----------|---------|
| Keep `fixed`, add `env(keyboard-inset-height)` | Not supported on iOS Safari; non-standard |
| Change root to `min-h-dvh` | Doesn't cap height — container can grow past keyboard boundary |
| Add `translateY` CSS var approach (like old `MessageInput`) | Complex, fragile, requires JS measurement |
| `position: absolute` inside `h-dvh relative` | Clean, correct, zero JS needed — chosen approach |

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Community.tsx` | Line 2199: `fixed` → `absolute` in mobile section class |

## Safety Verification

| Check | Status |
|-------|--------|
| Desktop layout unaffected | `md:relative md:inset-auto md:bottom-auto` overrides absolute on tablet/desktop — no change |
| Conversation list unaffected | It's in a separate grid column, not inside the section |
| ChatLayout internals unaffected | It is already correctly structured as flex-col with flex-1 scroll area |
| ChatComposer unaffected | Already has `shrink-0` in ChatLayout footer |
| Background pattern fix | Parent `h-dvh` shrinks → absolute child shrinks → background stays within bounds |
| Safe area inset preserved | `bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))]` unchanged |
| Mobile bottom nav still clears | `bottom-[calc(3.5rem+...)]` still reserves space for the 56px nav bar |
| No new dependencies | One word changed: `fixed` → `absolute` |
| 3G/slow connection | No JS polling, no resize listeners — pure CSS, zero overhead |
