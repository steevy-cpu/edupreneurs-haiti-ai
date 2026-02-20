

# Performance Plan A — Critical 3G Improvements

## Overview

Six fixes targeting LCP, image delivery, JS bundle size, and cache lifetimes. No game, feed, messaging, or passion-discovery code is touched.

---

## Fix 1 — LCP Image Mismatch

**File:** `src/components/home/HeroSection.tsx`

- Remove the `import ericCelebrating from "@/assets/eric-celebrating.png"` static import (line 6)
- Replace the `<img>` tag (lines 146-155) with a `<picture>` element using the existing WebP at `/images/eric-celebrating.webp` and PNG fallback at `/images/eric-celebrating.png` (from `public/images/`)
- Keep `loading="eager"`, `fetchPriority="high"`, `decoding="sync"` on the `<img>` inside `<picture>`
- The `index.html` preload for `/images/eric-celebrating.webp` now matches what the component renders

## Fix 2 — Homepage Images to WebP

**File:** `src/components/home/HeaderNav.tsx`

- Remove `import edupreneursLogo from "@/assets/edupreneurs-new-logo.png"` (line 7)
- Replace the logo `<img>` (lines 31-39) with a `<picture>` using `/images/edupreneurs-new-logo.webp` as source and `/images/edupreneurs-new-logo.png` as fallback

**File:** `src/components/home/HowItWorksSection.tsx`

- No WebP version of `eric-student-desk` exists in `public/images/`, so just add `loading="lazy"` (already present at line 44 -- confirmed, no change needed here)

## Fix 3 — Lazy Load Below-the-Fold Sections

**File:** `src/pages/Index.tsx`

- Remove the 9 static imports for below-the-fold sections (lines 13-21: FeaturesSection through BlogSectionWrapper)
- Replace with `React.lazy()` calls using default imports (all files have `export default`)
- Keep `HeaderNav` and `HeroSection` as static imports (above the fold)
- Keep `CTASection` and `Footer` as static imports (they're lightweight)
- Wrap each lazy section inside `DeferredContent` with a `<Suspense fallback={null}>` boundary

## Fix 4 — Auth Image Lazy Loading

**File:** `src/auth/layout/AuthSidebar.tsx`

- Change `loading="eager"` to `loading="lazy"` on the auth00.png image (line 17)
- The auth sidebar is never above the fold on mobile (it appears below the form)

## Fix 5 — OnboardingQuiz Image Lazy Loading

**File:** `src/components/firsttime/OnboardingQuiz.tsx`

- The component imports 7 Eric PNGs (lines 25-31) as static imports -- these can't be individually lazy-loaded since they're module-level imports
- Instead, add `loading="lazy"` to all `<img>` tags rendering these images, except for the first step image (`ericWaving`, step 0) which should remain `loading="eager"`
- Find the `<img>` tag that renders `currentContent.image` and conditionally set `loading` based on `currentStep === 0 && !showReaction && !isOutro`

## Fix 6 — Service Worker Cache Expiry

**File:** `public/sw.js`

- Add a `MAX_STATIC_AGE` constant (30 days in ms) and `MAX_JS_AGE` (7 days in ms)
- In the image cache handler: after matching a cached response, check the `date` header age; if older than 30 days, bypass cache and fetch fresh
- In the JS/CSS cache handler: same check with 7-day threshold
- Add a helper function `isCacheExpired(response, maxAgeMs)` that reads the response `date` header and compares to `Date.now()`

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/home/HeroSection.tsx` | picture element with WebP, remove PNG import |
| `src/components/home/HeaderNav.tsx` | picture element with WebP logo, remove PNG import |
| `src/pages/Index.tsx` | 9 sections converted to React.lazy() |
| `src/auth/layout/AuthSidebar.tsx` | loading="lazy" on auth image |
| `src/components/firsttime/OnboardingQuiz.tsx` | Conditional loading="lazy" on quiz images |
| `public/sw.js` | Cache expiry logic for images (30d) and JS (7d) |

## Safety Verification

| Check | Status |
|-------|--------|
| No game/feed/messaging/passion code touched | Only homepage, auth sidebar, onboarding, SW |
| HeroSection still renders immediately | Static import preserved, eager loading kept |
| HeaderNav still renders immediately | Static import in Index.tsx preserved |
| DeferredContent still works | Lazy sections wrapped inside existing DeferredContent |
| All sections have default exports | Verified -- React.lazy() will work |
| No new dependencies added | Uses built-in React.lazy, Suspense, picture element |
| 3G-compatible | Reduces initial bundle, defers image loading |
| Backward compatible | WebP with PNG fallback via picture element |
| index.html preload now matches | HeroSection uses /images/eric-celebrating.webp |

