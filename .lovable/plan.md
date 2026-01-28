

# Remove Cosmetic Lovable References Plan

## Overview

This plan removes visible "Lovable" branding from the repository while preserving critical AI infrastructure (the AI gateway that powers tutors and content generation).

---

## Reference Categories

### Category 1: REMOVABLE (Cosmetic/Dev Tools)

| Location | Reference | Action |
|----------|-----------|--------|
| `.lovable/plan.md` | Internal planning file | **Delete folder** |
| `vite.config.ts` line 4 | `import { componentTagger } from "lovable-tagger"` | **Remove import & usage** |
| `package.json` line 108 | `"lovable-tagger": "^1.1.10"` | **Remove dependency** |

### Category 2: REBRAND (UI Labels)

| File | Current Text | New Text |
|------|--------------|----------|
| `src/components/content-editor/AIAssistant.tsx` line 265 | "Propulsé par Lovable AI" | "Propulsé par IA" |
| `src/components/content-editor/BatchLessonGenerator.tsx` line 1267 | "Lovable AI (Nano banana)" | "IA Edupreneurs" |
| `src/components/content-editor/BatchGenerationValidation.tsx` line 2026 | "Lovable AI (Nano banana)" | "IA Edupreneurs" |
| `src/components/content-editor/SectionGenerator.tsx` line 114 | "Crédits Lovable AI épuisés" | "Crédits IA épuisés" |

### Category 3: INTERNAL CODE (Keep As-Is)

| Type | Reason to Keep |
|------|----------------|
| `imageGenerationModel: 'lovable'` (type values) | Internal enum value, not visible to users |
| `model: 'lovable'` in LessonImageManager.tsx | API parameter, not user-facing |
| Edge functions using `ai.gateway.lovable.dev` | **Critical infrastructure** - powers all AI features |
| `LOVABLE_API_KEY` references | Required for AI gateway authentication |

### Category 4: FILE PATHS (Cannot Change)

| Reference | Reason |
|-----------|--------|
| `/lovable-uploads/...` paths in sciencesLessons.ts | These are Lovable's CDN paths for uploaded files. Changing them would break audio playback. They are not visible to end users. |
| Push notification cleanup comment | Internal code comment, not visible |

---

## Implementation Steps

### Step 1: Delete `.lovable` Folder
- Delete `.lovable/plan.md`
- Remove the empty folder

### Step 2: Remove lovable-tagger from Vite Config

**Before (vite.config.ts):**
```typescript
import { componentTagger } from "lovable-tagger";
// ...
plugins: [
  react(),
  mode === "development" && componentTagger(),
  // ...
]
```

**After:**
```typescript
// Remove import entirely
// ...
plugins: [
  react(),
  // componentTagger removed
  // ...
]
```

### Step 3: Remove lovable-tagger from package.json

Remove from devDependencies:
```json
"lovable-tagger": "^1.1.10",
```

### Step 4: Rebrand UI Labels

| File | Line | Change |
|------|------|--------|
| AIAssistant.tsx | 265 | "Propulsé par Lovable AI" → "Propulsé par IA" |
| BatchLessonGenerator.tsx | 1267 | "Lovable AI (Nano banana)" → "IA Edupreneurs" |
| BatchGenerationValidation.tsx | 2026 | "Lovable AI (Nano banana)" → "IA Edupreneurs" |
| SectionGenerator.tsx | 114 | "Crédits Lovable AI épuisés" → "Crédits IA épuisés" |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Will this break AI features? | No - backend infrastructure untouched |
| Will this break audio playback? | No - `/lovable-uploads/` paths preserved |
| Will this affect development? | Minor - componentTagger was dev-only (optional analytics) |
| Is backward compatibility maintained? | Yes - no functional changes |
| Are edge cases handled? | Yes - internal code values left as-is |

---

## What Will Remain (Unavoidable)

| Item | Why It Stays |
|------|--------------|
| `/lovable-uploads/` file paths | Lovable CDN - files are hosted there |
| `ai.gateway.lovable.dev` in edge functions | Critical AI infrastructure |
| `LOVABLE_API_KEY` environment variable | Required for AI authentication |
| Git history (commits by lovable-dev[bot]) | Permanent part of version control |
| Internal `'lovable'` type values | Not user-visible, breaking change if renamed |

---

## Files to Modify

| File | Action |
|------|--------|
| `.lovable/plan.md` | Delete |
| `vite.config.ts` | Remove lovable-tagger import and usage |
| `package.json` | Remove lovable-tagger dependency |
| `src/components/content-editor/AIAssistant.tsx` | Rebrand text |
| `src/components/content-editor/BatchLessonGenerator.tsx` | Rebrand text |
| `src/components/content-editor/BatchGenerationValidation.tsx` | Rebrand text |
| `src/components/content-editor/SectionGenerator.tsx` | Rebrand text |

**Total: 7 files modified/deleted**

---

## Post-Cleanup Result

- No "Lovable" visible in UI labels
- No Lovable-specific dev tools in config
- Clean repository for GitHub
- All AI features continue working
- All uploaded content continues working

