

# Enhanced Floating Feature Bubbles

## Problems from Screenshot
- Bubbles are nearly invisible (10-15% opacity is too low)
- Only 10 bubbles -- user wants more
- All bubbles are the same pill shape -- user wants varied shapes

## Changes

### File: `src/components/donate/FloatingFeatureBubbles.tsx` (rewrite)

**More bubbles**: Expand from 10 to ~18 bubbles with additional platform features like "Quiz Interactif", "Tableau de Bord", "Certificats", "Forum", "Mode Hors-ligne", "Exercices", "Lecons Video", "Progression"

**Visible styling**: Increase opacity significantly:
- Background: `bg-primary/20` to `bg-primary/30` (instead of `/10`)
- Text: `text-primary/60` to `text-primary/80` (instead of `/15`)
- Add a subtle border: `border border-primary/20`

**Random shapes** using different `border-radius` values applied via inline styles:
- Standard pill (50px)
- Rounded rectangle (12px)
- Soft square (8px)
- Blob-like (asymmetric radii like `30% 70% 70% 30% / 30% 30% 70% 70%`)
- Circle-ish (50%)

Each bubble gets a `shape` property that maps to a specific `borderRadius` value, distributed across the array so shapes feel random.

**Size variation**: Mix of `text-xs`, `text-sm`, and `text-base` with corresponding padding to create depth.

### File: `tailwind.config.ts`

No changes needed -- the existing `float-up` keyframe and animation work fine.

### File: `src/pages/Donate.tsx`

No changes needed -- already imports and renders the component.

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- same component, updated styles |
| 3G optimized? | Yes -- still CSS-only, just more DOM elements (~18 spans) |
| Backward compatible? | Yes |
| Edge cases? | overflow-hidden still prevents scroll issues |

