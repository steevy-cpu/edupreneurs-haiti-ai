## Vision

Vidéo promo **Apple Keynote style** : calme, majestueuse, éditoriale. Beaucoup d'air blanc, typographie énorme, cuts lents (3–5s), zooms doux sur les vraies pages du site. Le contraire de la v2 agressive — on laisse respirer chaque feature.

## Direction artistique

- **Palette claire** : `#FAFAF7` (paper bg) · `#EDEAE1` (surface) · `#087E7E` (teal accent) · `#FF9F00` (amber ponctuel) · `#1A1A1A` (texte)
- **Typo** : Instrument Serif pour les titres énormes (220–320px) + Inter pour UI/captions. Mix serif éditorial + sans tech.
- **Motion** : ease-out cubic `(0.22, 1, 0.36, 1)`, springs `{damping: 30, stiffness: 80}` (smooth, zéro bounce). Pas de flash, pas de glitch.
- **Transitions** : cross-fade lent (20f) entre scènes, un seul wipe horizontal réservé aux moments charnière.
- **Rythme** : chaque scène 4–6s. Total ~80s = 2400 frames @ 30fps.

## Pipeline visuel (captures + mockups)

1. **Script Puppeteer** `remotion/scripts/capture-pages.mjs` capture les pages publiques du preview Lovable en 1920×1080 (`/`, `/decouvrir`, `/translate`, leçon démo publique).
2. Pour les pages authentifiées (Dashboard, Jude, Feed, etc.) : **mockups TSX haute-fidélité** reconstruits avec les vrais tokens design.
3. Les captures servent d'arrière-plan avec zoom-in lent (scale 1.0→1.08) et parallax doux. Mockups overlay pour focus sur features clés.

## Storyboard (17 scènes, ~80s)

```
00:00 ─ Hook Google search        (5s) — barre Google, typing lettre par lettre
                                          "mon-edupreneur.com" + autocomplete
00:05 ─ Landing reveal            (4s) — capture /, titre "Apprendre. Autrement."
00:09 ─ Sélection de classe       (6s) — wizard 7 classes (7AF, 8AF, 9AF, NS1,
                                          NS2, NS3, NS4) cards staggered,
                                          curseur clique sur NS3, check teal
00:15 ─ Big word "ÉCOLE."         (3s) — serif 280px sur paper bg
00:18 ─ Dashboard                 (5s) — mockup Gold/Streak/XP counter qui monte
00:23 ─ Matières grid             (4s) — capture + highlight 6 cards subjects
00:27 ─ Leçon immersive           (5s) — capture lesson + zoom sur formule KaTeX
00:32 ─ Big word "JUDE."          (3s)
00:35 ─ Jude AI tutor             (6s) — mockup chat avec réponse en streaming
00:41 ─ Examens Bacc              (5s) — capture exam-hub + NS4 séries (LLA/SES/SMP/SVT)
00:46 ─ Big word "ENSEMBLE."      (3s)
00:49 ─ Feed communauté           (5s) — mockup feed + like + commentaire animés
00:54 ─ Messages                  (4s) — mockup conversation + typing indicator
00:58 ─ Quiz Battle               (4s) — mockup countdown 3-2-1 + score
01:02 ─ Échecs + Passions         (5s) — split screen
01:07 ─ Translate (Kreyòl)        (4s) — capture /translate, mot traduit
01:11 ─ Outro                     (8s) — logo + "mon-edupreneur.com" + tagline
```

**Détail scène "Sélection de classe"** (6s, 180 frames) :
- Frame 0-30 : titre "Choisis ta classe." fade-in (serif 120px)
- Frame 20-90 : 7 cards apparaissent en grille 4+3, stagger 8f chacune, ease-out
  Cards : `7ᵉ AF` · `8ᵉ AF` · `9ᵉ AF` · `NS1` · `NS2` · `NS3` · `NS4` (Bacc)
  Chaque card = fond `#EDEAE1`, bordure 1px, label + sous-titre niveau
- Frame 90-130 : curseur doux glisse vers NS3, scale card 1→1.04
- Frame 130-150 : click — card devient teal `#087E7E`, check ✓ blanc apparaît
- Frame 150-180 : badge "NS3 sélectionnée" en bas, fade-out

## Composants Remotion à créer

```
remotion/src/v3/
├── MainVideo.tsx              — TransitionSeries 17 scènes
├── theme.ts                   — tokens palette claire + easings
├── components/
│   ├── PaperBackground.tsx    — fond crème + grain SVG subtil
│   ├── BigSerifWord.tsx       — type 280px, fade+blur reveal
│   ├── PageCapture.tsx        — wrapper image zoom+parallax
│   ├── UICursor.tsx           — curseur SVG doux animé
│   └── GradeCard.tsx          — card classe réutilisable
└── scenes/
    ├── 01-GoogleSearch.tsx
    ├── 02-Landing.tsx
    ├── 03-GradeSelection.tsx  ← NOUVEAU (7 classes)
    ├── 04-WordEcole.tsx
    ├── 05-Dashboard.tsx
    ├── 06-Matieres.tsx
    ├── 07-Lesson.tsx
    ├── 08-WordJude.tsx
    ├── 09-Jude.tsx
    ├── 10-Exams.tsx
    ├── 11-WordEnsemble.tsx
    ├── 12-Feed.tsx
    ├── 13-Messages.tsx
    ├── 14-QuizBattle.tsx
    ├── 15-ChessPassions.tsx
    ├── 16-Translate.tsx
    └── 17-Outro.tsx
```

## Livrables

- `/mnt/documents/edupreneurs-promo-v3.mp4` (1920×1080, H.264, muet, ~80s, viser <15MB)
- `public/edupreneurs-promo.mp4` mis à jour (route `/decouvrir`)
- `public/edupreneurs-promo-poster.jpg` régénéré (frame ~150 = scène classe)
- v1 et v2 conservées dans `/mnt/documents/` pour comparaison

## Hors périmètre

- Pas de voix off (peut être ajouté plus tard)
- Pas de musique (à ajouter en post)
- Aucun changement sur les vraies pages du site
- Pas de version courte réseaux sociaux

## Risques & mitigations

- **Puppeteer login** : auth bloque les pages privées → on s'appuie sur mockups TSX pour Dashboard/Jude/Feed/Messages, captures réelles seulement pour pages publiques.
- **Temps de rendu** : 80s @ 30fps avec images ≈ 6–8 min, OK sous la limite 10 min de `code--exec`.
- **Poids MP4** : CRF 22 pour rester <15MB, sinon CRF 24.
