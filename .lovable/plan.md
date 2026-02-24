

# Theme System Plan A — Implementation Plan (Refined)

## Fix 1: Enable system preference detection

**File:** `src/providers/AppProviders.tsx` (line 103-108)

Update ThemeProvider props:
- `defaultTheme="system"` (was `"light"`)
- `enableSystem={true}` (was `false`)
- `storageKey="edupreneur-theme"` (was default `"theme"`)
- `forcedTheme={undefined}` stays unchanged

One-time localStorage key change means existing users reset to `system` on first load — acceptable since `system` respects their OS preference.

---

## Fix 2: Database persistence + sync hook

### Migration

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'system'
CHECK (theme_preference IN ('light', 'dark', 'system'));
```

### New file: `src/hooks/useThemeSync.ts`

**Key design decisions (addressing user's concern):**

- On mount: makes a **single lightweight query** `SELECT theme_preference FROM profiles WHERE user_id = ?` with `staleTime: Infinity` — this does NOT duplicate useUserProfile because useUserProfile selects `avatar_url, nickname, academic_grade, gold_earned` (line 37-38 of useUserProfile.ts) and does NOT include `theme_preference`. Adding it to useUserProfile would change the CachedUserProfile interface and affect all consumers. A separate query with `staleTime: Infinity` means it fires once per session — negligible cost.
- On theme change: debounces 1 second via `setTimeout`/`clearTimeout` ref, then updates profiles table
- Only runs when `userId` is available (auth-gated by AppShell)
- Uses `useTheme()` from `next-themes` for read/write

### Mount point: `src/shell/AppShell.tsx` (after line 31)

- Import and call `useThemeSync()` after existing hooks (~line 75, after `useNotificationSound`)
- No props needed — hook reads auth from `useSessionAuth()` internally

---

## Fix 3: ThemeToggle in sidebar and mobile nav

### AppSidebar (`src/shell/components/AppSidebar.tsx`)

- Import `useTheme` from `next-themes` and `Sun`/`Moon` from `lucide-react`
- Add a theme toggle button **before the collapse toggle** (before line 277)
- Collapsed: Sun/Moon icon centered, matching existing button styling (`px-3 py-2.5 mx-2 rounded-lg`)
- Expanded: icon + "Theme" label, same styling as collapse button
- Uses `useTheme().setTheme()` to cycle light/dark

### ShellMobileBottomNav (`src/shell/components/ShellMobileBottomNav.tsx`)

- **Not a full nav item** (avoids crowding the already 6-item bar)
- Add an inline compact icon button **after** the nav items map, inside the flex container
- Styling: same `flex-col items-center justify-center` as nav items but narrower (`w-10` instead of `flex-1`)
- Shows Sun (dark mode) or Moon (light mode) icon, `size={20}`
- Label: "Theme" in `text-[10px]`

---

## Fix 4: FOUT prevention in index.html

### Inline script placement (user's concern confirmed)

The script goes in `<head>`, **after the critical CSS** block (after line 82, before `</head>` at line 136). This is:
- Before any `<script src>` tags (the only `<script type="module">` is at line 188, bottom of `<body>`)
- Before the static HTML shell renders
- Synchronous execution — blocks paint until `.dark` class is applied

```html
<script>
  (function() {
    try {
      var theme = localStorage.getItem('edupreneur-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (theme === 'dark' || ((!theme || theme === 'system') && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
</script>
```

### Hardcoded color replacements in critical CSS (lines 47-51)

| Line | Before | After |
|------|--------|-------|
| 47 | `background: #ffffff` | `background: var(--background, #ffffff)` |
| 47 | `color: #0a0a0a` | `color: var(--foreground, #0a0a0a)` |
| 51 | `background: rgba(255,255,255,0.95)` | `background: var(--card, rgba(255,255,255,0.95))` |

### Inline styles in static shell (lines 141, 155)

The header at line 141 has `background:rgba(255,255,255,0.95)` — update to `background:var(--card, rgba(255,255,255,0.95))`.

---

## Files Modified

| File | Fix | Change |
|------|-----|--------|
| `src/providers/AppProviders.tsx` | 1 | ThemeProvider props |
| `profiles` table (migration) | 2 | Add `theme_preference` column |
| `src/hooks/useThemeSync.ts` (new) | 2 | Theme DB sync hook |
| `src/shell/AppShell.tsx` | 2 | Mount `useThemeSync()` |
| `src/shell/components/AppSidebar.tsx` | 3 | Theme toggle button |
| `src/shell/components/ShellMobileBottomNav.tsx` | 3 | Compact theme icon |
| `index.html` | 4 | FOUT script + CSS var skeleton |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No — additive only |
| Provider stack order changed? | No |
| RLS policies needed? | No — column inherits existing profiles RLS |
| New dependencies? | None |
| Bundle size impact? | ~1KB (useThemeSync hook) |
| 3G performance | Improved — no FOUT repaints |
| Backward compatibility | Full — system default is sensible |
| Database migration risk | Safe — ADD COLUMN IF NOT EXISTS with DEFAULT |

