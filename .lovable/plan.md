

# Fix: Warmer Greeting Fallback in Dashboard

## Location
**File:** `src/pages/Dashboard.tsx`

The greeting is rendered at **line 263**: `Bienvenue, ${profileFeature.data.name}!`

The name is set at **line 120** from the profile query, and the initial default is at **line 62**.

## Changes (3 lines in one file)

### Line 62 — Initial default
Change `"Utilisateur"` to `"toi"` in the initial state so the fallback is warm even before the query returns.

### Line 115 — Profile query
Add `full_name` to the select so it is available for the fallback chain:
`select("nickname, full_name, gold_earned, academic_grade")`

### Line 120 — Fallback logic
Replace:
```ts
name: profileResult.data.nickname || "Utilisateur"
```
With:
```ts
name: profileResult.data.nickname ?? profileResult.data.full_name?.split(' ')[0] ?? 'toi'
```

Priority order: nickname, then first word of full_name, then "toi".

## Safety Verification

| Check | Status |
|---|---|
| Greeting renders correctly with nickname | Yes -- nickname is first priority (unchanged) |
| Falls back to first name if nickname is null | Yes -- uses full_name split |
| Falls back to "toi" if both null | Yes -- warm, Jude-friendly default |
| Profile query still works | Yes -- just added one more column to select |
| Other profileFeature consumers affected? | No -- only `.name` and `.gold` are read |
| Database changes? | None |
| Bundle size? | No change |

