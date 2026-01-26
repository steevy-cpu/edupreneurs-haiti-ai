
# Indeed-Style Branded Loading Screen for Homepage

## Overview
Create a minimalist loading screen that displays before the homepage content loads, featuring:
1. The **Edupreneurs logo/brand name** centered
2. An **animated progress bar** below it (like Indeed's design)

This provides visual feedback during the JavaScript bundle loading and React hydration, which is especially important for 3G users.

---

## Design Reference
Based on your Indeed screenshot:
- Clean white/light background
- Brand name prominently displayed
- Thin horizontal progress bar that animates from left to right
- Minimal, professional appearance

---

## Implementation Strategy

There are **two places** where loading happens:

1. **Initial HTML Load** (before React) - `index.html` static shell
2. **Route Transition** (React Suspense) - `HeroSkeleton.tsx` fallback

For the Indeed-style experience, we need to update the **HeroSkeleton** since that's what shows when React loads the homepage component.

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/components/shared/HeroSkeleton.tsx` | Replace skeleton layout with branded loading screen |

---

## Implementation Details

### HeroSkeleton.tsx - Branded Loading Screen

Replace the current skeleton-based layout with a centered branded loader:

```tsx
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

/**
 * Branded loading screen for the homepage.
 * Shows Edupreneurs logo with an Indeed-style progress bar.
 */
export const HeroSkeleton = () => {
  const [progress, setProgress] = useState(0);

  // Animate progress from 0 to ~90% (feels faster initially, slows down)
  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 300);
    const timer3 = setTimeout(() => setProgress(80), 600);
    const timer4 = setTimeout(() => setProgress(90), 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Logo/Brand */}
      <div className="mb-8">
        <img 
          src="/images/edupreneurs-new-logo.webp" 
          alt="Edupreneurs"
          className="h-16 sm:h-20 w-auto"
          fetchPriority="high"
        />
      </div>
      
      {/* Progress Bar */}
      <div className="w-64 sm:w-80">
        <Progress 
          value={progress} 
          className="h-1 bg-muted"
        />
      </div>
    </div>
  );
};
```

### Visual Breakdown

```text
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│            [Edupreneurs Logo]            │
│                                          │
│          ████████████░░░░░░░░            │
│          ← Progress Bar (80%) →          │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

---

## Animation Strategy

The progress animation mimics perceived loading (like Indeed):
- **100ms**: Jump to 30% (fast initial feedback)
- **300ms**: Reach 60% (continues smoothly)
- **600ms**: Reach 80% (slowing down)
- **1000ms**: Reach 90% (near complete, waiting for content)

This creates the perception that loading is almost done, even if the actual content takes longer.

---

## 3G Optimization Considerations

| Aspect | Implementation |
|--------|----------------|
| Logo preloaded | Already in `index.html` preload |
| Minimal DOM | Only 2 elements (logo + progress) |
| No external fonts in skeleton | Uses system fonts until Poppins loads |
| GPU-accelerated animation | Progress uses CSS transforms |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - same component, new design |
| Works with existing data? | N/A - pure UI component |
| 3G optimized? | Yes - minimal assets |
| Backward compatible? | Yes - drop-in replacement |
| Dark mode support? | Yes - uses `bg-background` |
| Accessibility? | Logo has alt text |

---

## Expected Result

When a user navigates to the homepage (or on initial load while React hydrates):
1. They see a clean, centered Edupreneurs logo
2. Below it, a thin progress bar animates smoothly
3. Once the Index page loads, it fades in naturally
4. Professional appearance matching Indeed's loading experience
