
# Enhanced Floating Bubbles: Colors, Layering, and Content Fix

## 3 Changes

### 1. Remove "Certificats" and add varied colors

Replace the "Certificats" bubble with "Notifications" (a real feature). Each bubble gets a `color` index that maps to a palette of distinct, visible colors applied via inline styles for both background and text:

- Blue: `rgba(59,130,246,0.25)` bg / `rgb(59,130,246)` text
- Green: `rgba(34,197,94,0.25)` bg / `rgb(34,197,94)` text  
- Purple: `rgba(168,85,247,0.25)` bg / `rgb(168,85,247)` text
- Orange: `rgba(249,115,22,0.25)` bg / `rgb(249,115,22)` text
- Pink: `rgba(236,72,153,0.25)` bg / `rgb(236,72,153)` text
- Teal: `rgba(20,184,166,0.25)` bg / `rgb(20,184,166)` text

Each bubble is assigned a color index (distributed across all 18 bubbles). The border color also matches. This makes every bubble distinct and eye-catching.

**File:** `src/components/donate/FloatingFeatureBubbles.tsx`

### 2. Bubbles pass behind content sections (z-index layering)

Currently the bubbles container uses `z-0` (behind content), but the content sections don't have explicit z-index or background, so bubbles may visually appear on top.

To make bubbles slide "under" each section div:
- Change the bubbles container from `fixed` to `absolute` so it scrolls with the page
- Add `relative z-10 bg-background` to the content wrapper sections (DonateHero, DonationCard, ImpactSection, Jude quote) so they stack above the bubbles
- The bubbles at `z-0` will appear to pass behind each content card

**Files:** `src/pages/Donate.tsx` (add `relative z-10` to content sections), `src/components/donate/DonateHero.tsx`, `src/components/donate/ImpactSection.tsx`

### 3. Summary of bubble content update

Remove: "Certificats"  
Add: "Notifications"

---

## Technical Details

### FloatingFeatureBubbles.tsx changes
- Add a `colors` array with 6 color objects `{ bg, text, border }`
- Add `color` property to each bubble entry (0-5, distributed)
- Replace the Tailwind `bg-primary/25 text-primary/70 border-primary/20` classes with inline `style` for `backgroundColor`, `color`, and `borderColor`
- Replace "Certificats" label with "Notifications"

### Donate.tsx changes
- Wrap each content section group with `relative z-10` so they sit above the `z-0` bubble layer
- Add `bg-background` to the main content areas so bubbles don't show through them

### DonateHero.tsx / ImpactSection.tsx changes
- Add `bg-background` to the root `<section>` elements so bubbles are hidden behind them

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- visual-only changes |
| Works with existing data? | N/A |
| 3G optimized? | Yes -- still CSS-only, no new assets |
| Backward compatible? | Yes |
| Edge cases? | Dark mode: inline colors work in both themes since they use explicit RGB values with alpha |
