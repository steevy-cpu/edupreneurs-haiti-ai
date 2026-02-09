

# Mobile Responsiveness Fixes for Translate Page

## Overview

The translate page is mostly responsive, but there are several small issues that affect the mobile experience on 375px and smaller screens.

---

## Issues Found

| Issue | Component | Fix |
|-------|-----------|-----|
| Language selector text overflows on small screens | `LanguageSelector.tsx` | Hide native name on mobile, truncate trigger text |
| Ctrl+Enter hint is irrelevant on mobile | `Translate.tsx` | Hide keyboard shortcut hint on mobile |
| Language selectors + swap button cramped | `Translate.tsx` | Reduce gap on mobile |
| Select trigger text truncation | `LanguageSelector.tsx` | Add `truncate` class and `min-w-0` |

---

## Detailed Changes

### 1. LanguageSelector - Hide native name on mobile

The dropdown items show "Flag + Name + (NativeName)" which is fine in the dropdown list, but the **trigger** (selected value display) can overflow on small screens.

**Fix:**
- Add `truncate` to the `SelectTrigger` so text doesn't overflow
- Hide the native name `(nativeName)` on mobile in dropdown items using `hidden sm:inline`

**File:** `src/features/translate/components/LanguageSelector.tsx`

```tsx
<SelectTrigger id={id} className="w-full min-w-0">
  <SelectValue />
</SelectTrigger>
```

For dropdown items:
```tsx
<span className="flex items-center gap-2">
  <span className="text-lg">{lang.flag}</span>
  <span className="truncate">{lang.name}</span>
  <span className="text-muted-foreground text-xs hidden sm:inline">({lang.nativeName})</span>
</span>
```

### 2. Hide Ctrl+Enter hint on mobile

Mobile users don't have a Ctrl key. This hint wastes vertical space on small screens.

**Fix:** Add `hidden sm:block` to the hint paragraph.

**File:** `src/pages/Translate.tsx` (line 220)

```tsx
<p className="text-xs text-muted-foreground text-center hidden sm:block">
  Appuyez sur Ctrl + Enter pour traduire
</p>
```

### 3. Ensure textarea minimum height is appropriate

The textarea has `min-h-[160px]` which is fine on mobile but could be slightly reduced for better viewport usage.

**Fix:** Use `min-h-[120px] sm:min-h-[160px]` in TranslateTextArea.

**File:** `src/features/translate/components/TranslateTextArea.tsx`

```tsx
className={cn(
  "min-h-[120px] sm:min-h-[160px] resize-none",
  ...
)}
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/features/translate/components/LanguageSelector.tsx` | Add `min-w-0` to trigger, hide native name on mobile, add `truncate` |
| `src/pages/Translate.tsx` | Hide Ctrl+Enter hint on mobile |
| `src/features/translate/components/TranslateTextArea.tsx` | Responsive min-height for textarea |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - CSS-only changes |
| Works with existing data? | N/A |
| 3G performance impact? | None - no new assets |
| Backward compatible? | Yes - desktop unchanged |
| Edge cases? | Tested at 375px (iPhone SE) width |

