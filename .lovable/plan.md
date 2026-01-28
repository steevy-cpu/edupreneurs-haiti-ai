

# Expand Home Chatbot to Answer Educational Questions

## Overview

This plan modifies the home page chatbot (Jude) to answer any education-related questions while always encouraging visitors to create an account at the end of each response.

---

## Current Behavior

The system prompt currently says:
> "Si on te pose des questions hors sujet, rappelle gentiment que tu es là pour parler d'EDUPRENEURS et de l'éducation."

This limits Jude to only discussing the platform itself.

---

## Proposed Changes

### Change 1: Update System Prompt

**File:** `supabase/functions/home-eric-chat/index.ts` (lines 155-195)

**Before (line 168-173):**
```text
📚 Ton rôle :
- Accueillir les ÉTUDIANTS et futurs apprenants
- Leur présenter EDUPRENEURS comme leur futur outil d'apprentissage
- Répondre aux questions sur la plateforme et ses fonctionnalités
- Expliquer comment s'inscrire et utiliser la plateforme
- Encourager l'apprentissage et l'inscription
```

**After:**
```text
📚 Ton rôle :
- Accueillir les ÉTUDIANTS et futurs apprenants
- Répondre à TOUTES les questions sur l'ÉDUCATION (mathématiques, sciences, français, histoire, etc.)
- Aider avec les devoirs, expliquer des concepts, donner des exemples
- Présenter EDUPRENEURS comme leur futur outil d'apprentissage
- Encourager l'apprentissage et l'inscription
```

**Before (line 195):**
```text
Si on te pose des questions hors sujet, rappelle gentiment que tu es là pour parler d'EDUPRENEURS et de l'éducation.
```

**After:**
```text
🎯 RÈGLE OBLIGATOIRE - APPEL À L'ACTION :
À la FIN de CHAQUE réponse, tu DOIS inclure un encouragement à créer un compte. Exemples :
- "Pour approfondir ce sujet et accéder à plus de leçons interactives, créez votre compte gratuit sur EDUPRENEURS ! 🚀"
- "Envie d'en apprendre plus ? Inscrivez-vous gratuitement sur EDUPRENEURS pour accéder à tous nos cours ! 📚✨"
- "Pour continuer votre apprentissage avec moi comme tuteur personnel, créez votre compte EDUPRENEURS ! 🎓"

⛔ Questions NON-ÉDUCATIVES :
Si on te pose des questions sans rapport avec l'éducation (politique, divertissement, etc.), réponds poliment que tu es spécialisé dans l'éducation et propose de l'aide sur des sujets scolaires.
```

---

### Change 2: Update FAQ Exact-Match Responses

Add account creation CTA to all three FAQ responses.

**File:** `supabase/functions/home-eric-chat/index.ts` (lines 56-102)

Each FAQ response should end with a CTA like:

```text
👉 Créez votre compte gratuit maintenant pour commencer ! 🚀
```

---

### Change 3: Update EDUPRENEURS Description Response

**File:** `supabase/functions/home-eric-chat/index.ts` (lines 125-141)

Add CTA at the end of the hardcoded EDUPRENEURS description.

---

### Change 4: Increase max_tokens

Since responses now include educational content + CTA, increase token limit slightly.

**File:** `supabase/functions/home-eric-chat/index.ts` (line 218)

```tsx
// Before
max_tokens: 350,

// After
max_tokens: 500,
```

---

## Technical Summary

| File | Changes |
|------|---------|
| `supabase/functions/home-eric-chat/index.ts` | Update system prompt, FAQ responses, EDUPRENEURS response, and max_tokens |

---

## Example Interaction

**User asks:** "Quelle est la formule de Pythagore ?"

**Before:** Jude might redirect to platform topics

**After:**
```
Le théorème de Pythagore est une formule fondamentale en géométrie ! 📐

Dans un triangle rectangle, il établit que :
$$a^2 + b^2 = c^2$$

Où $c$ est l'hypoténuse (le côté le plus long, opposé à l'angle droit) et $a$, $b$ sont les deux autres côtés. 🔺

Exemple : Si $a = 3$ et $b = 4$, alors :
$c = \sqrt{3^2 + 4^2} = \sqrt{25} = 5$ ✨

👉 Pour maîtriser ce théorème avec des exercices interactifs et un suivi personnalisé, créez votre compte gratuit sur EDUPRENEURS ! 🚀🎓
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | Yes - existing FAQ buttons still work |
| Breaks existing functionality? | No - only expands capabilities |
| 3G optimized? | Yes - minor token increase (350→500) |
| Security maintained? | Yes - still blocks non-educational content |
| CTA consistent? | Yes - every response ends with account creation encouragement |

