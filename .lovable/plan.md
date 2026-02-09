

# Translation Feature: Multi-Language Translator Page

## Overview

Create a robust, public translation page that allows users to translate text between **English, Creole, French, and Spanish** using the existing Lovable AI Gateway. This feature will be accessible without authentication and linked from the footer.

---

## Architecture Design

### File Structure

```text
src/
├── pages/
│   └── Translate.tsx                    # Main translation page
├── features/
│   └── translate/
│       ├── types/
│       │   └── translate.types.ts       # TypeScript interfaces
│       ├── constants/
│       │   └── languages.ts             # Language definitions (no hardcoded strings)
│       ├── hooks/
│       │   └── useTranslation.ts        # Translation logic hook
│       └── components/
│           ├── TranslateHeader.tsx      # Page header with navigation
│           ├── LanguageSelector.tsx     # Dropdown for source/target languages
│           ├── TranslateTextArea.tsx    # Input/output text areas
│           ├── SwapLanguagesButton.tsx  # Button to swap source/target
│           └── TranslateButton.tsx      # Submit button with loading state

supabase/
├── functions/
│   └── translate-text/
│       └── index.ts                     # Edge function for AI translation
```

---

## Phase 1: Backend - Edge Function

### File: `supabase/functions/translate-text/index.ts`

**Security Features:**
- Rate limiting using existing `RATE_LIMITS.GENERAL` (100 req/min for anon)
- Input validation with Zod schema
- Security headers (CORS, XSS protection)
- No hardcoded API keys (uses `LOVABLE_API_KEY` from Deno.env)

**Implementation:**

```typescript
// Key schema additions in validation.ts
export const translateSchema = z.object({
  text: z.string()
    .min(1, "Texte requis")
    .max(5000, "Texte trop long (max 5000 caractères)")
    .transform(s => s.trim()),
  sourceLang: z.enum(['en', 'ht', 'fr', 'es']),
  targetLang: z.enum(['en', 'ht', 'fr', 'es']),
}).strict().refine(
  data => data.sourceLang !== data.targetLang,
  { message: "Les langues source et cible doivent être différentes" }
);
```

**AI Prompt Strategy:**
- Use `google/gemini-2.5-flash` for fast, cost-effective translations
- System prompt instructs the AI to ONLY return the translation (no explanations)
- Creole-specific: Uses official Haitian Creole orthography

---

## Phase 2: Frontend - Types & Constants

### File: `src/features/translate/types/translate.types.ts`

```typescript
export type LanguageCode = 'en' | 'ht' | 'fr' | 'es';

export interface Language {
  code: LanguageCode;
  name: string;           // Display name in French
  nativeName: string;     // Name in its own language
  flag: string;           // Emoji flag
}

export interface TranslationRequest {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}

export interface TranslationResult {
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}
```

### File: `src/features/translate/constants/languages.ts`

```typescript
export const SUPPORTED_LANGUAGES: readonly Language[] = [
  { code: 'en', name: 'Anglais', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ht', name: 'Créole', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Espagnol', nativeName: 'Español', flag: '🇪🇸' },
] as const;

// Character limits
export const MAX_TEXT_LENGTH = 5000;
export const MIN_TEXT_LENGTH = 1;
```

---

## Phase 3: Frontend - Custom Hook

### File: `src/features/translate/hooks/useTranslation.ts`

Encapsulates all translation logic:
- State management (loading, error, result)
- API call to edge function
- Error handling with user-friendly messages
- Rate limit detection (429 handling)

```typescript
export function useTranslation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const translate = async (request: TranslationRequest): Promise<void> => {
    // Validation, API call, error handling
  };

  const clearResult = () => setResult('');

  return { translate, isLoading, error, result, clearResult };
}
```

---

## Phase 4: Frontend - Components

### Component Breakdown

| Component | Purpose |
|-----------|---------|
| `TranslateHeader` | Navigation back to home, logo, theme toggle |
| `LanguageSelector` | Dropdown with language options (flag + name) |
| `TranslateTextArea` | Textarea with character count, copy button |
| `SwapLanguagesButton` | Swaps source ↔ target languages |
| `TranslateButton` | Submit with loading spinner |

### UI/UX Design Principles
- Mobile-first responsive design
- 3G-optimized (minimal JS, no heavy animations)
- Accessible (ARIA labels, keyboard navigation)
- Clear visual feedback for loading/errors
- Character count indicator

---

## Phase 5: Main Page

### File: `src/pages/Translate.tsx`

Structure following existing patterns (e.g., `Blog.tsx`):

```typescript
export default function Translate() {
  return (
    <>
      <Helmet>
        <title>Traducteur | EDUPRENEURS - Anglais, Créole, Français, Espagnol</title>
        <meta name="description" content="..." />
        <link rel="canonical" href="https://mon-edupreneur.com/translate" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <TranslateHeader />
        
        <main className="container max-w-screen-md mx-auto px-4 py-8">
          {/* Translation Interface */}
          <Card>
            {/* Source language + text area */}
            {/* Swap button */}
            {/* Target language + result area */}
            {/* Translate button */}
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}
```

---

## Phase 6: Routing & Footer Integration

### App.tsx - Add Public Route

```typescript
const Translate = lazy(() => import("./pages/Translate"));

// In Routes, under PUBLIC ROUTES:
<Route path="/translate" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <Translate />
  </Suspense>
} />
```

### Footer Updates

Update both footers to include the translation link:

**`src/data/homePageData.ts`** - Add to `footerLinks.support`:
```typescript
{ to: "/translate", label: "Traducteur" }
```

**`src/components/Footer.tsx`** - Add to Support section:
```typescript
<li><Link to="/translate" className="...">Traducteur</Link></li>
```

---

## Phase 7: Configuration

### `supabase/config.toml`

```toml
[functions.translate-text]
verify_jwt = false
```

### `supabase/functions/_shared/validation.ts`

Add `translateSchema` export for input validation.

---

## Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | Create types and constants | `translate.types.ts`, `languages.ts` |
| 2 | Add validation schema | `validation.ts` |
| 3 | Create edge function | `translate-text/index.ts` |
| 4 | Update config.toml | `config.toml` |
| 5 | Create translation hook | `useTranslation.ts` |
| 6 | Create UI components | `LanguageSelector.tsx`, `TranslateTextArea.tsx`, etc. |
| 7 | Create main page | `Translate.tsx` |
| 8 | Add route | `App.tsx` |
| 9 | Update footers | `homePageData.ts`, `Footer.tsx` |
| 10 | Deploy and test | Edge function deployment |

---

## Security Checklist

| Check | Implementation |
|-------|---------------|
| No hardcoded API keys | Uses `Deno.env.get('LOVABLE_API_KEY')` |
| Rate limiting | Uses existing `RATE_LIMITS.GENERAL` |
| Input validation | Zod schema with length limits |
| XSS protection | Security headers, text sanitization |
| CORS configured | Standard cors headers |
| Error messages | User-friendly, no sensitive info exposed |

---

## 3G Optimization

| Optimization | Implementation |
|--------------|---------------|
| Lazy loading | Page loaded via `lazy()` import |
| Minimal bundle | Feature-specific components only |
| No heavy animations | Simple loading states |
| Progressive enhancement | Works without JS (basic form) |
| Caching | Service worker will cache static assets |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - new isolated feature |
| Works with existing data? | N/A - no database tables needed |
| Backward compatible? | Yes - public route addition |
| 3G performance impact? | Minimal - lazy loaded |
| Security maintained? | Yes - rate limited, validated |
| Edge cases handled? | Yes - same language check, empty text |

---

## Test Scenarios

1. **Basic translation**: French → Creole
2. **All language pairs**: Test each combination
3. **Empty text**: Should show validation error
4. **Long text**: Should respect 5000 char limit
5. **Same language**: Should prevent submission
6. **Rate limiting**: Verify 429 handling
7. **Mobile responsiveness**: Test on small screens
8. **Swap languages**: Verify swap works correctly
9. **Copy result**: Verify copy to clipboard works

