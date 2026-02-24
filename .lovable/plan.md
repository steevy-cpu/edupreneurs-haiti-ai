

# Studygram — Interactive Lesson Flashcards

Add a "Studygram" tab to each lesson page: swipable, visually rich flashcards that summarize the lesson's key points in a Stories-like format. AI generates the cards from lesson content; cards are cached in localStorage for 3G performance.

## How It Works

1. Student opens a lesson and taps the new "Studygram" tab
2. An edge function extracts 5-8 key points from the lesson content (objectif, contenu, exemples) and returns structured JSON
3. The frontend renders each key point as a full-width card in a horizontal Embla carousel (already installed)
4. Students swipe through cards like Instagram Stories, with progress dots at the top
5. Cards are cached in localStorage (7-day window) — identical to the existing quiz/activities caching pattern

## Card Structure (AI-generated JSON)

Each card contains:
- **title**: Short headline (max 10 words)
- **content**: Key point explanation (40-80 words)
- **emoji**: Visual icon for the card
- **type**: One of `concept`, `example`, `formula`, `tip`, `remember`

## Files to Create

### 1. Edge Function: `supabase/functions/generate-studygram/index.ts`
- Accepts: `lessonTitle`, `contenu`, `exemplesExercices`, `objectif`, `gradeLevel`, `subject`
- Calls Lovable AI Gateway (`google/gemini-2.5-flash`) to extract key points
- Returns: `{ success: true, cards: StudygramCard[] }`
- Uses existing `_shared/securityHeaders.ts` and `_shared/rateLimiter.ts`
- Rate limited like other generation endpoints

### 2. Hook: `src/features/matieres/hooks/useStudygramCards.ts`
- Follows the exact same pattern as `useAIGeneratedContent.ts`
- localStorage cache key: `ai_studygram_{lessonId}_v1`
- 7-day stale window
- AbortController for cleanup
- Returns: `{ cards, isLoading, isGenerating, error, isStale, regenerate }`

### 3. Component: `src/features/matieres/components/tabs/LessonStudygramTab.tsx`
- Uses `Carousel`, `CarouselContent`, `CarouselItem` from `src/components/ui/carousel.tsx` (already exists)
- Each card is a full-width slide with gradient background based on card type
- Progress indicator (dots) at top showing current position
- Swipe left/right to navigate
- Loading skeleton while AI generates
- "Regenerate" button when content is stale
- Respects dark mode using CSS variables

### 4. Update tab index: `src/features/matieres/components/tabs/index.ts`
- Add export for `LessonStudygramTab`

## Files to Modify

### 5. `src/components/LessonPageTemplate.tsx`
- Add 6th tab "Studygram" with a Sparkles icon between "Contenu" and "Activites"
- Lazy-load the tab component
- Grid changes: `grid-cols-3 md:grid-cols-5` becomes `grid-cols-3 md:grid-cols-6`
- Pass lesson content props to the new tab

### 6. `src/features/matieres/types/lesson.types.ts`
- No changes needed — all required data fields already exist in `LessonData`

## Visual Design

Each card type has a distinct gradient:
- `concept`: blue gradient (from-blue-500 to-indigo-500)
- `example`: green gradient (from-emerald-500 to-teal-500)
- `formula`: purple gradient (from-purple-500 to-violet-500)
- `tip`: amber gradient (from-amber-500 to-orange-500)
- `remember`: rose gradient (from-rose-500 to-pink-500)

Dark mode: Same gradients work on both themes since they use saturated colors with white text overlay.

Card layout:
```text
+----------------------------------+
|  . . o . . . .    (progress)     |
|                                  |
|        [emoji large]             |
|                                  |
|     Card Title (bold, white)     |
|                                  |
|   Content paragraph centered     |
|   40-80 words, white text        |
|                                  |
|     [type badge: "Concept"]      |
|                                  |
|   Swipe to continue -->          |
+----------------------------------+
```

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No — additive tab only |
| Provider stack / AppShell? | Not touched |
| New dependencies? | None — uses existing Embla carousel |
| Bundle size | Minimal — one new lazy-loaded tab component |
| 3G performance | localStorage cache, lazy-loaded, no page-load edge call |
| Backward compatibility | Full — tab only appears, existing tabs unchanged |
| RLS / Auth? | Edge function uses rate limiting, no DB writes |
| Cold start risk? | No — tab is user-initiated, not loaded on page mount |

## Technical Notes

- The edge function prompt instructs the AI to generate exactly 5-8 cards in JSON format
- Cards are validated with Zod before caching
- The carousel uses `{ align: 'center', containScroll: 'trimSnaps' }` for smooth mobile swiping
- Network-aware: on 2G/slow connections, show a "Generate" button instead of auto-generating
- Card count shown in tab badge: "Studygram (6)"

