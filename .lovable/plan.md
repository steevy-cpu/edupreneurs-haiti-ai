## Cap levé sur le poids → on vise la qualité maximale

Tu m'autorises à dépasser 15 Mo. Cible révisée : **25-35 Mo**, qualité broadcast, zéro compromis visuel.

---

## 1. Render haute qualité (plus de two-pass agressif)

- **CRF 16** (visuellement lossless, contre 23 actuel)
- Preset `slow` + profil `high` + `yuv420p`
- `-tune film` + `aq-mode=3` pour préserver dégradés paper/teal
- **Pas de re-compression two-pass** : on garde le rendu Remotion natif
- Léger grain pellicule (`noise=alloc=1:c0s=2`) — masque tout artefact résiduel et donne un côté cinéma

Résultat attendu : ~25-30 Mo, indistinguable d'un master.

---

## 2. Visuel — sortir radicalement de la monotonie

### a) 5 ambiances de fond réparties (au lieu du paper uniforme)

```text
Google + Landing         → paper pur (#FAFAF7)
Grades + Matières        → paper + grille fine teal 1%
Dashboard + Leçon        → paper + halo radial teal haut-gauche
Jude + Translate         → ivory chaud (#F7F3EC) — ambiance IA
Feed + Messages + Quiz   → paper froid (#F4F6F7) — ambiance social
Big words (ÉCOLE/JUDE/ENSEMBLE) → fond teal profond (#0A4F4F), texte ivory
Outro                    → paper + halo teal central diffus
```

Les big words sur teal profond = **rupture cinématique forte**, l'œil sort du paper.

### b) Profondeur — 3 couches par scène

- **Fond** : couleur + texture (grille, halo radial, ou bruit 1%)
- **Midground** : cards/mockups existants
- **Foreground** : particules teal qui dérivent (3-5 max) + anneau lumineux derrière l'élément focus

### c) Caméra virtuelle (fin de l'image fixe)

Chaque scène UI gagne un mouvement subtil mais perceptible :
- Dashboard : pan lent gauche→droite (translate -20px)
- Leçon : push-in (scale 1.0 → 1.04)
- Matières : pull-out (1.05 → 1.0) qui révèle plus de cards
- Jude : push-in sur la bulle réponse (scale 1.0 → 1.06 + Y -10px)
- Feed : scroll vertical lent du fil
- Quiz Battle : micro-shake continu + rumble fort sur GO!
- Big words : zoom continu 1.0 → 1.08

Toutes en `ease-out cubic` longues (60-90 frames), jamais robotiques.

### d) Typographie enrichie

- Ajouter **Fraunces** (display sérif moderne) en complément d'`Instrument Serif` pour les big words
- Tailles plus contrastées : ÉCOLE/JUDE/ENSEMBLE de 140 → **200px**
- Kerning serré (-0.04em) sur les big words = look magazine éditorial
- Kicker au-dessus en sans-serif 18px teal ("PARTIE 1·2·3")

### e) Finitions premium

- Ombres portées subtiles sous chaque card : `0 20px 40px rgba(0,0,0,0.06)`
- Bordures hairline 0.5px (au lieu de 1px)
- Mini-sparklines teal 30% derrière les counters Dashboard
- **4 types de transitions** au lieu d'un seul cross-fade :
  1. Cross-fade — au sein d'une même section
  2. Wipe teal vertical — avant chaque big word
  3. Push horizontal — Matières → Leçon (suggère navigation)
  4. Iris/zoom — Outro

### f) Détails par scène prioritaires

- **Google** : ajouter favicon teal "E" devant la suggestion, 2 suggestions au lieu d'1, curseur souris SVG dès frame 0
- **Grades** : focus ring teal animé, hover 18f au lieu de 10f, sous-titre corrigé "Secondaire avancé" pour NS3
- **Dashboard** : Wideline (pas Marvens), counter overshoot 2840→2900→2840, SVG coin/flame/level
- **Matières** : monogrammes lettres uniformes (M/F/P/S/H/E), zéro emoji
- **Leçon** : vraie KaTeX (`x = (-b±√(b²-4ac))/2a`), dégradé subtil dans bloc formule
- **Jude** : breadcrumb header, avatar "W" sur user, streaming 1.2 char/f, "✨ Jude réfléchit…" avant réponse
- **Quiz** : 2 portraits SVG, countdown pulse scale 1.4→1.0, GO! ambre + rumble
- **Outro** : suppression CTA pill, URL en sans-serif 44px medium sous fine ligne 120px, "Conçu en Haïti · Pour Haïti" 16px muted

---

## 3. Fichiers touchés

- `remotion/src/v3/MainVideoV3.tsx` — ambiances, caméra, particules, détails
- `remotion/scripts/render-remotion.mjs` — CRF 16, preset slow, profil high
- `remotion/scripts/finalize-v4.sh` (nouveau) — grain ffmpeg simple pass
- `public/edupreneurs-promo.mp4` — remplacement
- `public/edupreneurs-promo-poster.jpg` — re-capture sur big word JUDE (fond teal, plus iconique)
- Ajout dép : `@remotion/google-fonts/Fraunces` (~40 KB)

v1, v2, v3 préservées dans `/mnt/documents/`.

---

## Hors périmètre (inchangé)

- Pas de voix off ni musique (muet)
- Pas de nouvelles scènes (17 existantes)
- Pas de captures Puppeteer

---

## Une seule confirmation

**Big words sur fond teal profond** (recommandé — rupture forte, plus cinéma) ou rester paper partout (plus calme) ?

Si tu valides "go avec teal", j'exécute tout d'un bloc.