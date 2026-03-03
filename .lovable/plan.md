
# PWA Install System — 6 Fixes Implementation

## Files Modified (4 total, no others touched)

### 1. `src/hooks/usePWAInstall.ts` — Fix 1 + Fix 4 + Fix 5

**Fix 1 — Auth gate:**
- Import `useSessionAuth` from `@/contexts/SessionAuthContext`
- Read `user` from hook, add early returns: `if (!user?.id) return` and `if (loginCount < 2) return`
- `loginCount` from `localStorage.getItem('edupreneurs_login_count')` (same key used by push prompt)
- Add `user?.id` to useEffect deps

**Fix 4 — Celebration state:**
- Add `showCelebration` state + `closeCelebration` function
- On `outcome === 'accepted'`: `setShowCelebration(true)` + dispatch `pwa-installed` event
- Export both in return object

**Fix 5 — Tiered dismiss backoff:**
- `DISMISS_DURATIONS = [7d, 14d, 30d]` array replaces single `DISMISS_DURATION`
- On dismiss: increment `pwa-dismiss-count` in localStorage, store timestamp
- In show condition: read count, pick duration via `Math.min(count - 1, array.length - 1)`

### 2. `src/components/PWAInstallPrompt.tsx` — Fix 2 + Fix 3 + Fix 4

**Full rewrite.** Remove Card banner, replace with:

**Fix 2 — Bottom sheet:**
- Fixed overlay with backdrop (`bg-black/40 backdrop-blur-sm`), dismiss on tap
- `motion.div` with `initial={{ y: '100%' }}`, spring animation
- Handle bar, app icon + name + 5 stars, 3 benefit items (Zap, WifiOff, Bell)
- Full-width CTA button or iOS instructions
- "Plus tard" soft dismiss link

**Fix 3 — iOS instructions:**
- Inline `IOSInstructions` component with 3 numbered step cards
- Icons: Share, PlusSquare, CheckCircle from lucide-react
- Each step has title + subtitle in rounded `bg-muted/50` cards

**Fix 4 — Celebration UI:**
- When `showCelebration` prop is true, replace sheet content with Eric celebrating image, "Super!" heading, "Continuer" button
- Auto-dismiss via useEffect with 4-second timeout

**Props added:** `showCelebration?: boolean`, `onCloseCelebration?: () => void`

### 3. `src/shell/wrappers/PWAPromptWrapper.tsx`

- Import `AnimatePresence` from framer-motion
- Destructure `showCelebration` and `closeCelebration` from hook
- Show component when `showPrompt || showCelebration`
- Wrap in `AnimatePresence` for exit animations
- Pass new props through

### 4. `public/manifest.webmanifest` — Fix 6

- Add missing `152x152` icon entry (for iOS)
- Keep all existing JPEG entries unchanged
- 192 and 512 already have `"purpose": "any maskable"` — confirmed, no change needed

## No new dependencies — framer-motion + lucide-react already installed
## No other files touched
