## Promo v7 — Polish Pass (Accessibility, Cohérence, Micro-interactions)

Création d'une nouvelle composition `MainVideoV7` (basée sur v6) intégrant les 5 corrections demandées, avec **+15s de durée** pour respirer les améliorations.

### Durée cible
- v6 : 58s (1740 frames)
- **v7 : 73s (2190 frames)** — 15s ajoutées réparties sur Hook (+2s), Dashboard (+3s), Matières (+2s), Lesson math (+3s), Quiz (+2s), Outro (+3s)

### Corrections techniques

**1. Hook / Intro (00:00–00:04)**
- Sous-titre "PANNES • PAS DE PROF • MANUELS CHERS" : entrée mot-par-mot avec **fade-in + slide-up 12px**, courbe `ease-out` (`interpolate` + `cubic-bezier(0.16, 1, 0.3, 1)` via easing custom). Stagger 4 frames entre chaque token.
- "ÇA CHANGE" : suppression du biseau/relief 3D. Remplacé par texte **flat blanc** + **drop-shadow diffuse** (`textShadow: '0 8px 40px rgba(255,159,0,0.35), 0 2px 12px rgba(0,0,0,0.4)'`).

**2. Curseur & navigation UI (00:05–00:16)**
- `FakeCursor` : trajectoire Bézier prolongée **jusqu'au bouton "Reprendre"** (coordonnées cibles précises sur la carte CTA du Dashboard).
- Ajout d'une **micro-animation de clic** au point d'arrivée : 
  - Rétrécissement du bouton (`scale 1 → 0.96 → 1` sur 6 frames)
  - **Ripple concentrique** émanant du curseur (cercle SVG, `r: 0→40`, `opacity: 0.6→0`)
  - Délai 2 frames avant transition vers la scène suivante
- Même logique appliquée scène Matières (curseur clique réellement sur la tuile mise en avant).
- Cartes matières : remplacement de l'easing par **`cubic-bezier(0.16, 1, 0.3, 1)`** (Quint out) — entrée rapide puis ralentissement doux.

**3. Formule mathématique (00:17–00:22)**
- Réécriture complète de `QuadraticFormulaSVG` :
  - **SVG natif vectoriel pur**, viewBox haute résolution (800×200)
  - Texte rendu en `<text>` SVG (pas en `<foreignObject>`), `font-family: 'Instrument Serif'`
  - Symbole `±` et barre de fraction dessinés en **`<path>` / `<line>` SVG** (vecteur pur, jamais pixelisé)
  - `shape-rendering: geometricPrecision`, `text-rendering: geometricPrecision`
  - Rendu à 2× résolution interne puis scalé.

**4. Quiz Battle — cohérence (00:34–00:39)**
- Boutons de réponse : `borderRadius` aligné sur le système (**18px** comme les cartes Examens/Stats au lieu de 14px actuel).
- Bouton vert validé : même radius, plus le glow vert existant.
- Audit rapide des autres éléments anguleux du quiz (timer, scores) pour harmoniser à 18-20px.

**5. CTA final — accessibilité (00:53+)**
- "Conçu en Haïti 🇭🇹 Pour Haïti" : couleur passée de gris foncé à **`rgba(255,255,255,0.72)`** (WCAG AA sur fond teal/amber dégradé).
- Légère augmentation de `font-weight` (400 → 500) pour lisibilité mobile.
- Fondu enchaîné plus doux (durée 25 → 40 frames).
- **+3s** sur l'outro pour laisser respirer le CTA + glow pulsant du bouton "Crée ton compte".

### Fichiers touchés
- **Créé** : `remotion/src/v7/MainVideoV7.tsx` (composition + scènes patchées)
- **Créé** : `remotion/src/v7/QuadraticFormulaSVG.tsx` (vecteur pur)
- **Créé** : `remotion/src/v7/FakeCursorV7.tsx` (trajectoire + click ripple)
- **Modifié** : `remotion/src/Root.tsx` — pointer vers `MainVideoV7`, `TOTAL_FRAMES = 2190`
- **Régénéré** : `public/edupreneurs-promo.mp4` (CRF 16 + film grain post-process via ffmpeg)
- **Régénéré** : `public/edupreneurs-promo-poster.jpg`
- **Mis à jour** : `src/pages/Decouvrir.tsx` — mention "73 secondes" au lieu de "75 secondes"

### Rendu & QA
- Render programmatique via `remotion/scripts/render-remotion.mjs` (CRF 16, h264)
- Post-process ffmpeg : `-tune film`, `aq-mode=3`, `noise=c0s=2` (grain subtil)
- Stills de vérification aux frames clés : 30 (sous-titre stagger), 90 (clic curseur), 540 (formule SVG), 1050 (boutons quiz arrondis), 2100 (footer CTA accessible)
- Vérification taille finale < 15MB

### Notes
- Aucune modification backend, RLS, ou edge function.
- Aucune dépendance ajoutée.
- Compatible avec le lecteur HTML5 existant sur `/decouvrir`.