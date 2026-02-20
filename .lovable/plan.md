

# Redesign AIAvatarGenerator — Game-Style Character Creator

## Overview
Complete visual overhaul of the AIAvatarGenerator into a two-panel character creator with animated tabs, Jude reactions, and three new customization parameters. All existing logic (props, save flow, auth, rate limiting, onboarding fallback) remains untouched.

## Layout

```text
Desktop (md+):                         Mobile:
+----------+--------------------+      +--------------------+
| Preview  |  Tab pills         |      | Preview + Jude     |
| (w-48)   |  [Apparence|Style  |      | (h-40, horizontal) |
|          |   |Tenue|Extras]   |      +--------------------+
| Jude     |                    |      | Tab pills          |
| reaction |  Category grid     |      | Category grid      |
| bubble   |  (scrollable)      |      | (scrollable)       |
+----------+--------------------+      +--------------------+
| Footer: Gradient CTA or Save buttons                     |
+----------------------------------------------------------+
```

## File Changes

### 1. `src/components/AIAvatarGenerator.tsx` — Full UI Rewrite

**Preserved exactly as-is:**
- Props interface (open, onOpenChange, onAvatarGenerated, userId, isSuperUser, isOnboarding)
- `useEffect` for regeneration limit check
- `handleGenerate()` — calls edge function, sets generatedImage
- `handleSaveAvatar()` — canvas compression, Storage upload, profile update
- `handleClose()` — prevents close during generation/save
- `isOnboarding` fallback UI with "Continuer sans avatar" button
- `canRegenerate` / `nextRegenerateDate` cooldown logic

**New state:**
- `activeTab`: `"apparence" | "style" | "tenue" | "extras"` (default: "apparence")
- `selectedHairStyle`: new input (default: "court")
- `selectedOutfit`: new input (default: "casual")
- `selectedBackground`: new input (default: "classroom")
- `selectedEffect`: new input (default: "none")
- `reactionMessage`: string cycling from pool on any option change

**New option arrays:**
- `hairStyles`: Court, Long, Tresses, Afro, Locks, Rase (6 options)
- `outfits`: Uniforme scolaire, Decontracte, Sport, Traditionnel haitien, Futuriste (5 options)
- `backgrounds`: Salle de classe, Plage haitienne, Ciel etoile, Ville moderne, Nature tropicale, Bibliotheque (6 options)
- `effects`: Aucun, Entoure de livres, Lumiere doree, Effet aquarelle, Particules magiques, Neon urbain (6 options)
- `accessories` array: add "backpack" (Sac a dos) and "bike-helmet" (Casque de velo) to existing 6

**UI structure:**
- Dialog same max-w-lg, max-h-[90vh]
- Header: gradient banner with onboarding step indicator (unchanged logic)
- Body: flex-row on md+, flex-col on mobile
  - Left panel (md:w-48): preview image or pulsing silhouette placeholder, Jude image (eric-new-profile.png, h-16) with AnimatePresence speech bubble
  - Right panel (flex-1): custom pill tab selector (horizontal scroll, rounded-full buttons), AnimatePresence slide transition for category content
- Footer: identical logic, gradient CTA button styling

**Jude reaction system:**
- Pool of 5 messages: "Beau choix! ...", "J'adore cette couleur! ...", etc.
- On any option change, pick a random different message
- AnimatePresence fade transition on the speech bubble text

**Tab animations:**
- framer-motion AnimatePresence + motion.div
- Category content slides in from x:20 with opacity:0 to x:0, opacity:1
- Key prop on motion.div set to activeTab for proper exit/enter

**handleGenerate update:**
- Pass three new fields to edge function: `outfitStyle`, `background`, `specialEffect`
- Also pass `hairStyle` (for prompt enrichment)

**Footer button changes (visual only):**
- "Creer mon avatar" button: gradient bg (from-primary to-purple-500)
- Loading: animate-spin + "Creation en cours..."
- Generated: "Regenerer" outline + "Utiliser cet avatar" gradient

### 2. `supabase/functions/generate-custom-avatar/index.ts` — Schema + Prompt Update

**Zod schema additions (all optional with defaults for backward compatibility):**
```
hairStyle: z.string().max(50).optional().default('court'),
outfitStyle: z.string().max(50).optional().default('casual'),
background: z.string().max(100).optional().default('classroom'),
specialEffect: z.string().max(100).optional().default('none'),
```

**Prompt additions — appended to existing prompt sections:**
- Hair style line: `- Hair style: ${hairStyle}`
- Outfit section: `- Outfit/clothing: ${outfitStyle}` with descriptive mapping
- Background section: Replace "Soft lighting with subtle gradient background" with the selected background description
- Special effect section: Add effect description if not "none"

**Everything else unchanged:** auth, rate limiting, DALL-E 3 call, base64 conversion, response shape.

## Safety Verification

| Check | Status |
|---|---|
| All existing props preserved? | Yes -- same interface, no changes |
| Save flow identical? | Yes -- handleSaveAvatar untouched |
| isOnboarding fallback preserved? | Yes -- same error state + "Continuer sans avatar" |
| Existing users can regenerate from Settings? | Yes -- same flow, same cooldown logic |
| New parameters have safe defaults? | Yes -- all optional with defaults in Zod schema |
| Old avatars affected? | No -- they are stored Storage URLs, unrelated to generation params |
| Bundle size impact? | Minimal -- framer-motion already installed, no new deps |
| 3G performance? | Same -- animations use framer-motion (GPU-accelerated), no extra network calls |
| RLS / auth unchanged? | Yes -- no database schema changes |
| Edge function response shape? | Identical -- `{ success: true, imageUrl: string }` |
| Provider stack / AppShell affected? | No |

