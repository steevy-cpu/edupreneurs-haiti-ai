## Objectif

Passer la v3 d'un rendu "soigné mais IA" à un rendu **studio pro** en corrigeant le typing artificiel et en polissant 12 points faibles identifiés. Pas de refonte — chirurgie ciblée.

## 1. Fix typing humain (priorité #1)

Remplacer la cadence uniforme par une fonction de timing réaliste :

```text
m-o-n[pause longue]---e-d-u[pause courte]p-r-[hésitation: backspace 'r' puis retape]-r-e-n-e-u-r[pause]-.-c-o-m
```

- **Délais variables par lettre** : table de durées (4–14 frames) basée sur la difficulté de la touche (lettre courante 4–6f, tiret 10f, point 14f, caractère après pause 8f).
- **Pause longue après "mon"** (20 frames) — simule réflexion.
- **Hésitation réaliste** : à la lettre "p" de "edupreneur", taper "pe", marquer 8 frames, effacer le "e", retaper "pr". Ça humanise instantanément.
- **Curseur** : clignote seulement pendant les pauses ≥6 frames, jamais pendant la frappe active.
- **Soumission** : à la fin du typing, curseur souris descend jusqu'au bouton "Recherche Google" (mouvement courbe Bézier, pas linéaire), clic visible (scale 0.96 sur le bouton 4 frames), puis transition wipe vers la page.

## 2. Google scene — finitions

- Ajouter favicon Edupreneurs (couleur teal, lettre "E") devant la suggestion autocomplete.
- 2 suggestions au lieu d'une seule (la première = celle qu'on choisit, la seconde = "mon edupreneur connexion").
- Curseur souris SVG présent dès frame 0, bouge subtilement, va vers la barre de recherche au début, attend, puis descend vers la suggestion sélectionnée.
- Transition fin de scène : la page Google fait un léger zoom (×1.02) puis wipe blanc vers la landing.

## 3. Sélection classe — polish

- Mouvement curseur en **arc de Bézier** (pas ligne droite) : `cubicBezier((1700, 200) → (1100, 280) → (target))`.
- **Focus ring teal 2px** sur la card survolée, animé en scale (ring grandit de 0 → 100%).
- Hover prolongé : 18 frames au lieu de 10.
- Corriger sous-titre NS3 → "Secondaire avancé" (pas de série, c'est NS4 qui a LLA/SES/SMP/SVT).
- Badge final : remplacer "NS3 sélectionnée — Sciences & Lettres" par juste "**NS3 — Tu es prêt.**" (plus éditorial, moins data-sheet).

## 4. Big words (ÉCOLE / JUDE / ENSEMBLE)

Ajouter à chaque big word :
- **Kicker** au-dessus en sans-serif 18px teal letterspaced ("PARTIE 1", "PARTIE 2", "PARTIE 3").
- **Mot complémentaire** qui apparaît 20 frames après en serif italique 60px ("ÉCOLE. — Toute la tienne, dans ta poche.").
- **Ligne horizontale fine 80px** centrée sous le mot, qui s'étire de 0 → 80px (ease-out 40f).
- Zoom continu pendant toute la scène (1.0 → 1.06 sur 90f) pour éviter le statique.

## 5. Dashboard

- Remplacer "Marvens" par "**Wideline**" (prénom haïtien crédible, féminin pour varier).
- Counter Gold : ajouter overshoot subtil (target = 2840 → atteint 2900 à frame 55 → redescend à 2840 à frame 65).
- Ajouter mini-icônes SVG personnalisées au lieu de ◆ ♦ ▲ (gold coin, flame, level-up).
- Hauteur du bloc augmentée pour respirer (padding 36 → 48).

## 6. Matières — cohérence visuelle

Passer tous les badges en **monogrammes lettre** dans le même style :
- Maths → "M" teal
- Français → "F" violet
- Physique → "P" bleu
- SVT → "S" vert
- Histoire → "H" ambre
- Anglais → "E" rouge

Plus aucun emoji. Typo serif 38px dans le badge.

## 7. Leçon — vraie KaTeX

- Installer `katex` (déjà dans le projet web, l'ajouter aussi dans `remotion/`).
- Rendre la formule via `<KaTeX>` ou injecter le HTML KaTeX statique : `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`.
- Fond du bloc formule : passer de surface plate à un dégradé subtil paper → surface (donne du relief).
- Ajouter en bas un mini bouton "Écouter cette leçon" (visuel seulement, pas d'audio) avec icône speaker.

## 8. Jude — plus réaliste

- Header de chat avec breadcrumb : "Maths · NS3 · Équations du 2nd degré"
- Bulle user : ajouter petit avatar initiale "W" (Wideline)
- Réduire vitesse streaming : 1.2 char/frame (36 char/s — proche d'un vrai LLM perçu)
- Curseur de streaming : barre fine teal qui clignote, pas un bloc plein
- Ajouter "✨ Jude réfléchit…" qui apparaît avant le début de la réponse (frames 25–50), remplacé par le texte qui stream

## 9. Quiz Battle

- Vraie UI : 2 portraits SVG en haut (avatars cercles avec initiales W et S), barre de score 0–0 entre les deux
- Countdown avec pulse propre : chaque chiffre apparaît avec scale 1.4 → 1.0 + opacity 0 → 1 sur 8 frames, reste 22f, puis disparaît avec scale 1 → 0.85 + opacity 1 → 0 sur 8f
- "GO!" en couleur amber (pas teal) pour contraste avec le reste
- Ajouter rumble subtil de l'écran sur "GO!" (translate ±3px sur 6 frames, sinusoïdal)

## 10. Outro — plus éditorial

- Supprimer le CTA pill noir
- Remplacer par : URL "mon-edupreneur.com" en sans-serif 44px medium, color ink, sous une fine ligne horizontale 120px
- Ajouter en bas en très petit (16px, muted) : "Conçu en Haïti · Pour Haïti"
- Logo Edupreneurs (lettre "E" stylisée teal dans un cercle) au-dessus du titre

## 11. Rythme global

- 2 wipes horizontaux teal pour les moments charnière : avant "JUDE." (passage individuel → IA) et avant "ENSEMBLE." (passage IA → communauté).
- 3 frames de paper blanc pur entre certaines scènes pour respirer (avant chaque big word).
- Zoom global continu (1.0 → 1.04) sur toutes les scènes UI Dashboard/Matières/Leçon/Jude/Feed/Messages/Translate pour éviter le statique parfait.

## 12. Poster

Capturer frame **165** (premier frame de scène 2 — landing révélée) OU frame **480** (Dashboard avec compteurs montés à mi-course). Choix : frame 480 — plus parlant qu'un titre seul.

## Détails techniques

- Toutes modifs dans `remotion/src/v3/MainVideoV3.tsx` (fichier unique).
- Ajout d'un helper `useHumanTyping(query, startFrame)` retournant `{ text, showCursor }` avec la table de timings réaliste + hésitation scriptée.
- Ajout d'un helper `useBezierCursor(from, control, to, t0, t1)` pour mouvement courbe.
- Ajout dépendance `katex` côté remotion : `cd remotion && bun add katex` (taille ~280KB, ok).
- Re-render `/mnt/documents/edupreneurs-promo-v3.mp4` (écrasement) + re-publication dans `public/`.
- Régénération poster via `ffmpeg -ss <timestamp_frame_480>`.

## Livrables

- `/mnt/documents/edupreneurs-promo-v3.mp4` (écrasé, ~5–7 Mo)
- `public/edupreneurs-promo.mp4` (mis à jour)
- `public/edupreneurs-promo-poster.jpg` (nouveau cadrage)
- v1, v2, v3 d'origine préservées dans `/mnt/documents/`

## Hors périmètre

- Pas de voix off ni musique (conformément à v3)
- Pas de nouvelles scènes (les 17 existantes restent, on les améliore)
- Pas de captures Puppeteer réelles (rester full TSX pour fiabilité)
