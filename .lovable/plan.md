# Vidéo Pitch Edupreneurs v2 — Fidèle, agressive, ancrée dans le vrai site

Remplacement de `public/edupreneurs-promo.mp4` par une nouvelle version qui **pitche le vrai site** : ouverture sur une recherche Google "mon-edupreneur.com", puis traversée des vraies pages avec la **vraie palette** et les **vraies fonctionnalités**, ton visuel **agressif** (cuts rapides, gros type, springs nerveux, glitch contrôlé), avec une **mise en valeur forte de la dimension communauté** (Feed + Messages).

## 1. Cartographie du site (réelle)

Pages identifiées dans `src/pages/` à pitcher fidèlement :

| Page réelle | Ce qu'on montre |
|---|---|
| Google search (intro) | Barre de recherche, frappe "mon-edupreneur.com", clic résultat |
| `Index` / landing | Logo + hero + grille brand |
| `Dashboard` | Streak, Gold, XP, niveau, progression |
| `Matieres` | Grille matières par grade (7AF→NS4) |
| `DynamicLessonPage` | Sections, KaTeX, bouton audio Eric, quiz |
| `BaccExamsHub` | Hub examens d'État (séries NS3/NS4) |
| Jude AI tutor | Chat streaming + avatar Jude |
| **`Feed` (Community)** | Posts, likes optimistes, commentaires, badges grade |
| **Messages / Conversations** | Liste convos + bulle chat temps réel + indicateur typing |
| `QuizBattleMultiplayer` | Duel quiz PvP |
| `ChessMultiplayerGame` | Échecs PvP + ELO |
| `PassionDiscovery` | Wizard découverte passion |
| `Leaderboard` | Classement Gold/XP |
| `Library` / `Templates` | Ressources + templates |
| `Translate` | Traducteur créole |
| Outro | mon-edupreneur.com + CTA |

## 2. Palette réelle (extraite de `src/index.css`)

- **Teal primary** `hsl(180 88% 27%)` ≈ `#087E7E`
- **Amber accent** `hsl(38 100% 50%)` ≈ `#FF9F00`
- **Violet secondary** `hsl(262 83% 58%)` ≈ `#7C3AED`
- **Success emerald** `hsl(160 84% 39%)`
- **Background** `#0A0B0D` / surfaces `#111316` / élévé `#16191D`
- **Typo** Inter 800/900 pour titres XXL (déjà chargée via `@remotion/google-fonts/Inter`)

## 3. Direction artistique — "Agressif"

- **Durée** ~78s = 2340 frames à 30fps
- **Pacing** coupes 1.5–3s, jamais > 5s
- **Motion** : spring snappy `{damping: 14, stiffness: 220}` par défaut ; accent punch `scale 0.7→1.05→1` + flash amber 2 frames
- **Transitions** : `wipe` agressif + cuts secs + 1 `flip` ponctuel — pas de fade lent
- **Motifs récurrents** :
  - Grille teal subtile en fond (parallax)
  - Curseur souris animé qui interagit avec les vraies UIs
  - HUD ticker amber bas d'écran ("STREAK +1 · GOLD +25 · NIVEAU 7 · 1.2K EN LIGNE")
  - Glitch RGB ponctuel 2-3 frames sur titres clés
- **Typo cinétique** : mots-clés énormes (200-300px) en trans-screen : "ÉCOLE.", "PASSION.", "EXAMENS.", "ENSEMBLE.", "RÉUSSIS."

## 4. Découpage 16 scènes (~78s / 2340 frames)

```
Frame      Durée  Scène
0-150      5s    INTRO GOOGLE : navigateur stylisé, barre de recherche,
                 typing "mon-edupreneur.com" caractère par caractère
                 (cursor blink, autocomplete suggéré), clic sur le 1er
                 résultat → wipe vers site
150-240    3s    Hook : logo Edupreneurs + tagline + flash
240-390    5s    Dashboard réel (Gold/Streak/XP) + curseur clic
390-510    4s    Matieres grid → zoom NS4
510-660    5s    Leçon dynamique : scroll + KaTeX + bouton audio Eric
660-780    4s    Jude AI réponse en streaming (texte qui se tape)
780-930    5s    Examens d'État NS4 (4 séries LLA/SES/SMP/SVT)
930-1110   6s    ★ FEED Community : 3 posts qui apparaissent en stagger,
                 like optimiste (+1 amber pop), commentaires, badge grade
1110-1290  6s    ★ MESSAGES : liste conversations + ouverture chat,
                 bulles qui apparaissent l'une après l'autre,
                 indicateur "...typing", message reçu, sons visuels
1290-1410  4s    Quiz Battle PvP — score temps réel
1410-1530  4s    Échecs multijoueur — ELO +24
1530-1680  5s    Passion Discovery — wizard étapes
1680-1770  3s    Leaderboard — montée au top
1770-1890  4s    Library / Templates — download
1890-2010  4s    Translate créole — démo
2010-2190  6s    Outro : URL géante "mon-edupreneur.com" + CTA
2190-2340  5s    Lockup final + fade
```

**Scène INTRO Google (détaillée)** :
- Fond blanc cassé Google (`#F8F9FA`)
- Barre URL Chrome stylisée en haut
- Logo "Google" multicolore centré
- Champ de recherche avec curseur clignotant
- Typing frame par frame : `m → mo → mon → mon- → ... → mon-edupreneur.com`
- Cadence : 3 frames par caractère = ~2s de typing
- Suggestions autocomplete qui apparaissent (mon-edupreneur.com en 1er, surligné)
- Curseur souris glisse + clique → wipe agressif vers le site

**Scène FEED (détaillée)** :
- Recréation fidèle de la card post : avatar rond, nom + badge grade (ex "NS4"), timestamp, contenu, ligne actions (❤ 💬 🔁)
- 3 posts qui s'empilent en stagger (springs)
- Sur le 2e post : curseur clique cœur → compteur passe de 23→24, cœur devient amber, micro-burst de particules
- Sur le 3e post : un commentaire s'écrit en typing dessous

**Scène MESSAGES (détaillée)** :
- Layout 2 colonnes : sidebar conversations (3 avatars + last message + unread badge amber) à gauche, chat ouvert à droite
- Bulles existantes au mount (3-4 bulles)
- Nouvelle bulle reçue qui slide-in depuis la gauche
- Indicateur "● ● ●" typing animé
- Réponse envoyée qui slide-in depuis la droite (teal)
- Petit son visuel (onde concentrique amber)

## 5. Détails techniques

- Réutiliser le scaffold `remotion/` (musl + ffmpeg symlinks OK, Inter chargée)
- Nouveaux composants dans `remotion/src/scenes/v2/` :
  - `SceneGoogleIntro.tsx`
  - `SceneHook.tsx` (réutiliser/adapter existant)
  - `SceneDashboard.tsx` (refonte fidèle)
  - `SceneMatieres.tsx`
  - `SceneLesson.tsx`
  - `SceneJude.tsx`
  - `SceneExams.tsx`
  - `SceneFeed.tsx` ★ nouveau
  - `SceneMessages.tsx` ★ nouveau
  - `SceneQuizBattle.tsx`
  - `SceneChess.tsx`
  - `ScenePassion.tsx`
  - `SceneLeaderboard.tsx`
  - `SceneLibrary.tsx`
  - `SceneTranslate.tsx`
  - `SceneOutro.tsx`
- Mockups en TSX/SVG pur reproduisant fidèlement les UIs (cartes, sidebars, modales) avec les tokens HSL réels
- Jude : forme abstraite teal+amber (pas le vrai 3D React Three Fiber, trop lourd au render headless)
- Composer dans `remotion/src/MainVideo.tsx` via `TransitionSeries` (durée recalculée pour absorber les overlaps de transition)
- Render : `node remotion/scripts/render-remotion.mjs` → `/mnt/documents/edupreneurs-promo-v2.mp4`
- 1920×1080, 30fps, H.264, muet (ajout musique en post si demandé)
- Côté app : remplacer `public/edupreneurs-promo.mp4` et `public/edupreneurs-promo-poster.jpg` par les nouveaux fichiers, sans toucher à `/decouvrir`

## 6. Bug runtime à corriger en passant

`Decouvrir is not defined` dans `src/App.tsx` → vérifier l'import lazy (probablement perdu). Fix discret pendant l'implémentation.

## 7. Hors scope

- Pas de voix off (musique + texte cinétique, comme convenu)
- Pas de vraies captures vidéo (reproductions fidèles en TSX)
- Pas de modification des pages live, juste swap MP4 + poster
- Pas de versions courtes réseaux sociaux

## 8. Livrables

- `/mnt/documents/edupreneurs-promo-v2.mp4` (HD, téléchargeable)
- `public/edupreneurs-promo.mp4` mis à jour pour `/decouvrir`
- `public/edupreneurs-promo-poster.jpg` régénéré
- Fix runtime `Decouvrir`
