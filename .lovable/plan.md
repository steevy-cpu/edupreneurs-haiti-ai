

# Fix Chess AI Tutor Prompt — 2 Targeted Changes

## Fix 1: Move system prompt to correct role

**Current (line 183-185):**
The system prompt is passed as `role: 'user'`:
```typescript
const messages: Message[] = [
  { role: 'user', content: systemPrompt }
];
```

**Change:**
Update to `role: 'system'`:
```typescript
const messages: Message[] = [
  { role: 'system', content: systemPrompt }
];
```

Also update the `Message` interface (line 18) to include `'system'` since it currently only allows `'user' | 'assistant'`:
```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```
Wait -- the interface already includes `'system'` at line 18. So only line 184 needs changing.

**File:** `supabase/functions/chess-ai-tutor/index.ts`, line 184 only.

---

## Fix 2: Reframe explanation to declarative present tense

**Change A — Line 151:**
Replace:
```
2. "explanation": une explication pédagogique de ton coup en français
```
With:
```
2. "explanation": une explication pédagogique EN FRANCAIS de ce que tu viens de jouer et POURQUOI ce coup est bon dans cette position. Commence toujours par décrire le coup joué (ex: 'Je joue mon cavalier en f6') puis explique la raison stratégique. Ne dis jamais 'je vais jouer' ou 'je vais faire' — parle au présent de ce que tu viens de décider.
```

**Change B — Lines 206-210:**
Replace the final user message:
```
"C'est ton tour de jouer. Analyse la position et choisis ton meilleur coup selon ton niveau. Réponds UNIQUEMENT avec un JSON valide. N'oublie pas: format UCI uniquement (ex: e7e5, g8f6)."
```
With:
```
"Choisis ton meilleur coup et explique ce que tu joues et pourquoi. Réponds UNIQUEMENT avec un JSON valide."
```

**File:** `supabase/functions/chess-ai-tutor/index.ts`, lines 151 and 209 only.

---

## What is NOT touched

- No changes to difficulty prompts, FEN handling, move parsing, rate limiting, validation, or response logic
- No changes to any other edge function
- No changes to any frontend file

## Verification

| Check | Status |
|---|---|
| System prompt uses `role: 'system'` | Yes -- line 184 changed |
| Explanation instruction uses present-tense declarative framing | Yes -- line 151 rewritten |
| Final user message simplified | Yes -- line 209 rewritten |
| No other edge function logic touched | Correct |
| Move parsing, FEN handling, difficulty system unchanged | Correct |

