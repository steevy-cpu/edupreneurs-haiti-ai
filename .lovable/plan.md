

# Enlarge Eric-Celebrating Image on Homepage

## Current State
The hero image container uses fixed pixel sizes that scale with breakpoints, ranging from 180px on mobile to 400px on large screens.

## Proposed Change
Increase the image size by approximately 20-25% at each breakpoint for a more impactful visual presence:

| Breakpoint | Current Size | New Size | Change |
|------------|--------------|----------|--------|
| Base (mobile) | 180x180px | 220x220px | +22% |
| xs | 220x220px | 280x280px | +27% |
| sm | 280x280px | 340x340px | +21% |
| md | 320x320px | 400x400px | +25% |
| lg | 400x400px | 500x500px | +25% |

## Implementation

**File**: `src/components/home/HeroSection.tsx`

Update the image container div sizing:

```tsx
// Before
<div className="relative z-10 w-[180px] h-[180px] xs:w-[220px] xs:h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px]">

// After
<div className="relative z-10 w-[220px] h-[220px] xs:w-[280px] xs:h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
```

Also update the `width` and `height` attributes on the `<img>` tag to match the largest size:

```tsx
// Before
<img
  src={ericCelebrating}
  ...
  width={400}
  height={400}
  ...
/>

// After
<img
  src={ericCelebrating}
  ...
  width={500}
  height={500}
  ...
/>
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - visual change only |
| Works with existing layout? | Yes - container uses grid, image will fit |
| 3G optimized? | Yes - same image, just displayed larger |
| Responsive? | Yes - all breakpoints updated proportionally |
| Backward compatible? | Yes - no API changes |

## Expected Outcome
Eric will appear approximately 25% larger across all screen sizes, making the hero section more visually impactful while maintaining the responsive design.

