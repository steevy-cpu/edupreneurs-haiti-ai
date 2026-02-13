
# Floating Feature Bubbles Background for Donate Page

## Concept

A CSS-only animated background layer behind the donate page content. Small translucent "bubbles" containing short feature labels (like "IA Personnalisee", "Systeme Gold", "Examens Officiels", etc.) float slowly upward across the page, creating a subtle, engaging visual that showcases what the platform offers -- reinforcing why donations matter.

## Design Decisions

- **CSS-only animations** (no JS animation loop) -- critical for 3G performance
- **Fixed position layer** behind all content with `pointer-events-none` so it never blocks interaction
- **Low opacity** (10-15%) so bubbles don't compete with the actual page content
- **Multiple speed/delay variations** so bubbles feel organic, not synchronized
- **`overflow: hidden`** on the container to prevent horizontal scroll from bubbles exiting the viewport

## Bubble Content (from platform features)

Short labels extracted from existing feature data:
- "IA Personnalisee"
- "200 Gdes/mois"
- "Systeme Gold"
- "Multilingue"
- "Examens Officiels"
- "Decouvre ta Passion"
- "Messagerie"
- "Fil d'Actualite"
- "Classement"
- "Developpement Personnel"

## Implementation

### 1. New Component: `src/components/donate/FloatingFeatureBubbles.tsx`

A pure presentational component:
- Renders ~10 `<span>` elements, each with a feature label
- Each bubble is absolutely positioned at a random horizontal offset (using inline styles for variety)
- Each uses a shared `float-up` CSS animation with different `animation-duration` (15-30s) and `animation-delay` (0-15s) values
- Bubbles are styled as small rounded pills: `bg-primary/10 text-primary/15 text-xs px-3 py-1 rounded-full`
- The container is `fixed inset-0 overflow-hidden pointer-events-none z-0`

### 2. New Keyframe in `tailwind.config.ts`

Add a `float-up` keyframe:
```
"float-up": {
  "0%":   { transform: "translateY(100vh)", opacity: "0" },
  "10%":  { opacity: "1" },
  "90%":  { opacity: "1" },
  "100%": { transform: "translateY(-100vh)", opacity: "0" }
}
```

And the corresponding animation utility:
```
"float-up": "float-up 20s linear infinite"
```

### 3. Integrate in `src/pages/Donate.tsx`

- Import `FloatingFeatureBubbles`
- Place it as the first child inside the outer `<div>`, before `<HeaderNav />`
- The `relative` + `z-index` layering ensures content stays on top

## File Summary

| File | Action | What Changes |
|------|--------|--------------|
| `src/components/donate/FloatingFeatureBubbles.tsx` | Create | New bubble background component |
| `tailwind.config.ts` | Edit | Add `float-up` keyframe + animation |
| `src/pages/Donate.tsx` | Edit | Import and render FloatingFeatureBubbles |

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- purely decorative layer with pointer-events-none |
| 3G optimized? | Yes -- CSS-only animations, no JS loops, no images |
| Backward compatible? | Yes -- additive only |
| Edge cases? | overflow-hidden prevents horizontal scroll; reduced-motion users see static low-opacity text |
| Performance? | ~10 DOM elements with CSS transforms (GPU-accelerated), negligible cost |
