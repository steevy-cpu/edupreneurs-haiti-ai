
## Plan 2 — Part A: Fix C1, C2, C3 — XSS Sanitization on Three dangerouslySetInnerHTML Calls

Three locations in the codebase pass unsanitized HTML strings directly into `dangerouslySetInnerHTML`. These are the exact three issues flagged as Critical in the audit. No other code is touched.

---

### The Three Vulnerabilities

#### C1 — `src/components/MathContent.tsx` (line 514)

This is the highest-impact location. It sits on the main lesson rendering path that every student hits when reading non-math content.

**Current code:**
```tsx
return <div dangerouslySetInnerHTML={{ __html: content }} />;
```

`content` here is raw HTML from the database (lesson `contenu`, `introduction`, `exemples_exercices` fields). No sanitization is applied. If any lesson content were ever to contain a malicious `<script>` or `onerror` handler — whether via a compromised content editor account or a database injection — it would execute in every student's browser.

**Fix:** Import `sanitizeHtml` from the existing `src/lib/sanitize.ts` utility (already used in 8+ other files) and wrap `content`:

```tsx
// Add import at top of file:
import { sanitizeHtml } from '@/lib/sanitize';

// Line 514 — change:
return <div dangerouslySetInnerHTML={{ __html: content }} />;
// To:
return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
```

No other changes to `MathContent.tsx`. The KaTeX rendering path (`parseAndRenderMath`) is unaffected — it only reaches this line when `containsMath()` returns false, meaning the content is treated as plain HTML.

---

#### C2 — `src/components/InteractiveActivities.tsx` (line 666)

This is a debug/fallback section ("Voir tous les exercices") rendered inside a collapsed `<details>` element at the bottom of the activity card. DOMPurify is **already imported** at line 2, and a local `sanitizeHtml` helper is **already defined** at line 21 — it is just not called on this particular `dangerouslySetInnerHTML`.

**Current code:**
```tsx
<div dangerouslySetInnerHTML={{ __html: content }} />
```

**Fix:** Call the already-existing local `sanitizeHtml` — no new imports needed:

```tsx
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
```

This is a one-word change. The local `sanitizeHtml` at line 21 already uses a strict DOMPurify config (forbids `script`, `iframe`, `object`, `embed`, `form`, `input`, `button`, and all event handler attributes).

---

#### C3 — `src/components/content-editor/BatchGenerationValidation.tsx` (line 1370)

This is the admin/content-editor lesson preview panel. Even though only authenticated content editors see this UI, the audit correctly flags it — a compromised editor account or an injection in the AI-generated lesson content could execute scripts in the editor's session.

**Current code:**
```tsx
<div
  className="prose prose-sm max-w-none dark:prose-invert text-sm"
  dangerouslySetInnerHTML={{ __html: String(content).substring(0, 2000) + (String(content).length > 2000 ? '...' : '') }}
/>
```

**Fix:** Import `sanitizeHtml` from `src/lib/sanitize` (not yet imported in this file) and wrap the string:

```tsx
// Add import at top of file (alongside existing imports):
import { sanitizeHtml } from '@/lib/sanitize';

// Line 1370 — change to:
<div
  className="prose prose-sm max-w-none dark:prose-invert text-sm"
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(String(content).substring(0, 2000) + (String(content).length > 2000 ? '...' : '')) }}
/>
```

---

### Files Changed

| File | Change |
|---|---|
| `src/components/MathContent.tsx` | Add `import { sanitizeHtml }` from `@/lib/sanitize`; wrap `content` on line 514 |
| `src/components/InteractiveActivities.tsx` | Wrap `content` on line 666 with already-existing `sanitizeHtml()` — no import needed |
| `src/components/content-editor/BatchGenerationValidation.tsx` | Add `import { sanitizeHtml }` from `@/lib/sanitize`; wrap string expression on line 1370 |

---

### What Is NOT Changed

- The `PURIFY_CONFIG` in `src/lib/sanitize.ts` — already correct, no modifications needed.
- The KaTeX rendering path in `MathContent.tsx` — it builds React elements directly, never uses `dangerouslySetInnerHTML`.
- All other `dangerouslySetInnerHTML` calls in the codebase — already use `sanitizeHtml` or `createSanitizedMarkup` correctly.
- No component logic, props, state, or layout is altered.

---

### Safety Verification

| Check | Status |
|---|---|
| Does `sanitizeHtml` strip KaTeX/math content? | No — `PURIFY_CONFIG` in `sanitize.ts` explicitly allows math tags (`math`, `mi`, `mo`, `mn`, etc.) and common HTML tags used in lesson content |
| Does this affect the KaTeX rendering path? | No — the unsanitized path in `MathContent.tsx` is only reached when `containsMath()` returns false |
| Does wrapping the truncated string in BatchGenerationValidation cause double-truncation? | No — `sanitizeHtml` sanitizes HTML structure, it does not truncate or alter text length beyond removing disallowed tags |
| Does this break the debug view in InteractiveActivities? | No — the local `PURIFY_CONFIG` in that file allows all the common HTML tags that lesson content uses |
| Does this affect the Provider Stack, AppShell, or auth? | No — these are pure render-layer changes only |
| Does this work on 3G? | Yes — DOMPurify runs synchronously in microseconds, no network calls |
| New dependencies? | No — DOMPurify is already installed and imported in both `InteractiveActivities.tsx` and `src/lib/sanitize.ts` |
