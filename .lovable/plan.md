

# Theme System Plan B — Dark Mode CSS Fixes

Surgical CSS-only changes to fix hardcoded colors that break dark mode. No logic changes.

## Fix 1: Eric Chatbot Hardcoded Colors (src/index.css)

Six targeted replacements in the Eric chatbot CSS block. Each hardcoded hex/rgba value is replaced with CSS variables, and `.dark` overrides are added where `!important` prevents variable inheritance.

### 1a. `.eric-close-btn` (lines 882, 890)
- Replace `rgba(239, 68, 68, 0.9)` with `hsl(var(--destructive) / 0.9)`
- Replace hover `rgba(239, 68, 68, 1)` with `hsl(var(--destructive))`
- Remove the `!important` on background since variables now handle theming

### 1b. `.eric-message-user .eric-message-content` (line 917)
- Replace `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)` with `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)`

### 1c. `.eric-message-speaker-btn.speaking` (lines 976-977)
- Replace `#10b981 !important` with `hsl(var(--success)) !important`
- Replace `rgba(16, 185, 129, 0.1) !important` with `hsl(var(--success) / 0.1) !important`

### 1d. `@keyframes dots-animation` (lines 1000-1003)
- Replace all `#6b7280` with `hsl(var(--muted-foreground))`

### 1e. `.eric-voice-btn` (line 1042)
- Replace `linear-gradient(135deg, #10b981 0%, #059669 100%)` with `linear-gradient(135deg, hsl(var(--success)) 0%, hsl(var(--success) / 0.8) 100%)`

### 1f. `.eric-send-btn` (line 1057)
- Replace `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)` with `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)`

---

## Fix 2: Matieres Hero Hardcoded Whites (src/pages/Matieres.tsx)

Four targeted class replacements in the hero section:

| Line | Current | Replacement |
|------|---------|-------------|
| 257 | `bg-white/15` | `bg-white/15 dark:bg-white/5` |
| 280 | `bg-white/20` | `bg-white/20 dark:bg-white/10` |
| 284 | `bg-white/20` | `bg-white/20 dark:bg-white/10` |
| 288 | `bg-white/20` | `bg-white/20 dark:bg-white/10` |
| 463 | `bg-white` | `bg-background` |

All `text-white` values remain unchanged — they sit on gradient backgrounds where white text is correct in both themes.

---

## Fix 3: AppSidebar Collapsed Logo (src/shell/components/AppSidebar.tsx)

| Line | Current | Replacement |
|------|---------|-------------|
| 153 | `bg-white/20` | `bg-foreground/10` |

Uses `bg-foreground/10` so it adapts: light translucent on dark backgrounds, dark translucent on light backgrounds.

---

## Fix 4: VisitorBanner Documentation (src/components/visitor/VisitorBanner.tsx)

No functional changes. Add a comment on the outer `<div>` explaining the intentional always-dark design:

```tsx
{/* Intentionally dark regardless of theme — visitor banner is a distinct overlay */}
<div className="sticky top-0 z-[1002] bg-slate-900/95 ...">
```

---

## Files Modified

| File | Fix | Scope |
|------|-----|-------|
| `src/index.css` | 1 | 6 hardcoded color replacements in Eric chatbot CSS |
| `src/pages/Matieres.tsx` | 2 | 5 class replacements in hero section |
| `src/shell/components/AppSidebar.tsx` | 3 | 1 class replacement |
| `src/components/visitor/VisitorBanner.tsx` | 4 | 1 comment addition |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No — CSS-only, no logic |
| Provider stack order changed? | No |
| New dependencies? | None |
| Bundle size impact | Zero |
| 3G performance | No change |
| Backward compatibility | Full — visual improvement only |
| Dark mode verified? | All replacements use existing CSS variables from the project's theme system |

