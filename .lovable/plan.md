

# Fix Chess AI Difficulty Levels

## Problem Analysis

Users report that even when selecting "Expert" difficulty, Jude plays at a beginner level. After investigating, I found **two critical issues**:

### Issue 1: Missing "Advanced" Difficulty Level

| Location | Difficulty Levels Defined |
|----------|---------------------------|
| Frontend (`ChessGameControls.tsx`) | `beginner`, `intermediate`, `advanced`, `expert` (4 levels) |
| Edge Function (`chess-ai-tutor`) | `beginner`, `intermediate`, `expert` (3 levels only) |

**Problem**: When a user selects "Avancé" (advanced), the edge function falls back to the `default` case which returns `intermediate` level prompts. This means:
- Selecting "Advanced" → AI plays at "Intermediate"
- No true 4-tier difficulty system

### Issue 2: Weak Expert-Level Prompts

The current expert prompt says "Choisis TOUJOURS le meilleur coup" but doesn't provide the AI with concrete guidance on HOW to evaluate positions or play strong chess. LLMs aren't chess engines - they need explicit strategic instructions to play better moves.

---

## Solution

### Change 1: Add "Advanced" Difficulty to Edge Function

**File:** `supabase/functions/chess-ai-tutor/index.ts`

**Current (line 20):**
```typescript
type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';
```

**After:**
```typescript
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
```

### Change 2: Add Advanced Difficulty Prompt

Insert a new case for `advanced` between `intermediate` and `expert`:

```typescript
case 'advanced':
  return `
NIVEAU DE JEU: AVANCÉ 💪
- Tu joues à un niveau avancé avec une bonne compréhension stratégique
- Joue des coups solides et tactiquement corrects
- Utilise activement des tactiques (fourchettes, clouages, enfilades, attaques doubles)
- Développe tes pièces harmonieusement vers des cases actives
- Contrôle le centre et les colonnes ouvertes
- Applique les principes d'ouverture classiques
- Fais très rarement des erreurs, seulement sur des positions très complexes
- Explique les concepts tactiques et stratégiques avancés`;
```

### Change 3: Strengthen Expert Prompts with Chess Heuristics

The expert prompt needs concrete chess evaluation criteria:

```typescript
case 'expert':
  return `
NIVEAU DE JEU: EXPERT 🏆
- Tu joues au MAXIMUM de tes capacités - comme un maître d'échecs
- TOUJOURS analyser: sécurité du roi, matériel, structure de pions, activité des pièces
- Priorités d'ouverture: 1) Contrôler le centre (e4/d4), 2) Développer les pièces mineures, 3) Roquer tôt
- CALCULE les tactiques: cherche fourchettes, clouages, enfilades, échecs doubles, sacrifices
- En milieu de partie: coordonne tes pièces, crée des faiblesses dans le camp adverse
- EXPLOITE immédiatement les erreurs de l'adversaire
- Utilise des ouvertures solides: Italienne, Espagnole, Sicilienne, Défense Française
- Si tu captures, calcule TOUS les échanges avant de jouer
- Explique des concepts de niveau tournoi: prophylaxie, zugzwang, compensation, initiative`;
```

### Change 4: Increase Temperature for Expert to Avoid Repetitive Play

Consider adjusting the AI temperature based on difficulty to make expert play more varied and less predictable. However, this is optional.

---

## Technical Summary

| File | Changes |
|------|---------|
| `supabase/functions/chess-ai-tutor/index.ts` | Add `advanced` to type, add advanced case, improve expert prompt |

---

## Before vs After Comparison

**Selecting "Avancé" (Advanced):**
- Before: Falls back to Intermediate (default case) → weak play
- After: Uses dedicated Advanced prompt → stronger tactical play

**Selecting "Expert":**
- Before: Generic "play best move" instruction → LLM guesses randomly
- After: Specific chess heuristics → LLM applies opening principles, tactics, coordination

---

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | Yes - existing beginner/intermediate unchanged |
| Breaks existing functionality? | No - only improves AI behavior |
| 3G optimized? | Yes - no payload changes |
| Edge cases handled? | Yes - unknown difficulty still falls back to intermediate |
| Frontend sync? | Yes - frontend already has all 4 levels defined |

---

## Expected Outcome

After implementation:
- "Débutant" → AI makes deliberate mistakes, simple explanations
- "Intermédiaire" → AI plays solid but imperfect, teaching tactics
- "Avancé" → AI plays strong tactical chess with rare mistakes
- "Expert" → AI applies master-level principles, exploits errors immediately

