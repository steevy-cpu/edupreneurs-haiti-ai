

# Revert HeroSection Hero Image to PNG

## What
The WebP version of `eric-celebrating` lost its transparent background, so we revert the hero image back to the original PNG import. All other Performance Plan A changes remain untouched.

## Changes (2 files)

### 1. `src/components/home/HeroSection.tsx`
- Re-add the static import: `import ericCelebrating from "@/assets/eric-celebrating.png"`
- Replace the `<picture>` element (lines 146-159) with a plain `<img>` tag using `{ericCelebrating}` as `src`
- Keep `loading="eager"`, `fetchPriority="high"`, `decoding="sync"`, and the existing className

### 2. `index.html`
- Remove the WebP preload line (line 29): `<link rel="preload" as="image" href="/images/eric-celebrating.webp" ...>`
- Update the PNG preload (line 30) from `fetchpriority="low"` to `fetchpriority="high"` since it is now the primary LCP image
- Update the comment on line 28 to reflect PNG-only

## Not Touched
HeaderNav WebP, lazy sections, auth lazy loading, onboarding lazy loading, service worker cache -- all stay as-is.
