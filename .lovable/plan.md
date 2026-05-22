# Plan — Vidéo promo MP4 HD + page d'hébergement `/decouvrir`

## Tes choix
- **Livrable** : vidéo MP4 HD téléchargeable (focus principal)
- **Audio** : musique + texte cinétique
- **Périmètre** : nouvelle route publique `/decouvrir`

**Note technique importante** : le sandbox de rendu Remotion ne peut pas encoder l'audio (limitation `libfdk_aac` du ffmpeg local). Je rendrai donc la **vidéo silencieuse** côté sandbox, avec une bande-son texte/visuelle si forte qu'elle se passe de son. Si tu veux une vraie piste musicale, on l'ajoute en post (j'utiliserai `ffmpeg` direct pour muxer un MP3 libre de droits sur la MP4 — étape 2 facultative).

## Livrable 1 — Vidéo MP4 cinématique 75s

**Specs** : 1920×1080, 30 fps, H.264, ~30-50 Mo, `/mnt/documents/edupreneurs-promo-v1.mp4`

**Scènes (motion design pur, typo cinétique, mockups UI vectoriels)** :

| # | Durée | Contenu |
|---|---|---|
| 1 | 0-12s | Hook noir profond → fade typo massive : **"Propulsez vos études."** puis **"Cultivez vos passions."** — kerning serré, parallax discret |
| 2 | 12-27s | Mockup dashboard étudiant (progression scolaire, streak, passions) qui s'assemble carte par carte avec springs |
| 3 | 27-42s | Course viewer triptyque qui défile : **Espagnol A2** → **Python** → **HTML/CSS** — code qui se tape, badges de progression |
| 4 | 42-55s | Passion & Skills Tracker : icônes minimalistes (échecs ♟, origami, micro 🎤) avec barres de progression animées |
| 5 | 55-67s | Calendrier + routine quotidienne — grille qui se remplit de blocs colorés en stagger |
| 6 | 67-75s | Fade vers **"Un espace pour grandir, apprendre et s'épanouir au quotidien."** + logo Edupreneurs lockup + `mon-edupreneur.com` |

**Direction artistique** :
- Fond `#0A0B0D`, surfaces `#111316`, accents Teal `#087E7E` + Amber `#FF9F00`, texte `#F5F5F7`
- Typo : Inter (déjà installée), display tracking `-0.04em`, hiérarchie Apple-like
- Motion : springs Framer `{damping: 28, stiffness: 200}` partout, transitions de scène = wipe doux + fade overlap
- Aucune image générée par IA, aucun visage. Tout en SVG/CSS/JSX (mockups vectoriels haute fidélité)
- Transitions inter-scènes via `TransitionSeries` Remotion

**Stack technique** :
- Projet Remotion dans `remotion/` (hors `src/`, pas inclus dans le bundle Vite)
- Composants : `Root.tsx`, `MainVideo.tsx`, 6 scènes dans `scenes/`, mockups UI dans `components/`
- Rendu via script programmatique `scripts/render-remotion.mjs` (plus fiable que CLI dans sandbox)
- QA : `bunx remotion still` sur 5-6 frames clés avant rendu complet pour vérifier visuel

## Livrable 2 — Page `/decouvrir` (présentation + téléchargement)

Page **minimale** dont le seul rôle est de présenter et distribuer la MP4. Pas de tabs/explorateur/témoignages (puisque tu as choisi "vidéo uniquement").

```
/decouvrir
├── Header minimal (logo Edupreneurs → home)
├── Hero
│   ├── Eyebrow "Découvrir"
│   ├── H1 "Propulsez vos études. Cultivez vos passions."
│   └── Sous-titre court FR
├── Lecteur vidéo plein cadre (native <video>, contrôles, poster frame)
│   ├── MP4 hébergée dans bucket Supabase public `promo-videos`
│   └── Bouton "Télécharger en HD" (download attribute)
├── CTA "Commencer gratuitement" → /signup
└── Footer minimal
```

- Route publique, **hors AppShell**, lazy via `lazyWithRetry`
- Fichier : `src/pages/Decouvrir.tsx`
- Dark mode forcé, mêmes tokens brand
- SEO complet : title FR, meta description, OpenGraph avec poster, JSON-LD `VideoObject`
- Aucune requête DB, aucune edge function appelée
- Upload de la MP4 dans bucket Storage `promo-videos` (public, read-only) via `supabase--storage_upload` une fois rendue

## Étapes d'exécution

1. **Scaffold Remotion** (`remotion/` + `bun install` + fix compositeur)
2. **Construire les 6 scènes + mockups UI** en TSX
3. **Spot-check** : rendu de 5 stills aux frames clés, inspection visuelle
4. **Itérer** sur les scènes qui clochent (typo qui déborde, espacement, timing)
5. **Rendu final MP4** vers `/mnt/documents/edupreneurs-promo-v1.mp4`
6. **Upload** dans bucket Storage `promo-videos` (créer migration pour le bucket public)
7. **Page `/decouvrir`** : route + composant + intégration de l'URL Storage
8. **Vérification** : preview de la page, lecture vidéo, bouton télécharger
9. **Livraison** via `<presentation-artifact>` pour téléchargement direct + URL de la page

## Vérification sécurité

| Risque | Mitigation |
|---|---|
| Casser app existante | Route isolée, dossier `remotion/` exclu du build Vite |
| Bundle size | Remotion en devDependency, jamais bundlé front |
| RLS / data | Page statique, bucket Storage public read-only |
| 3G | Vidéo MP4 lazy `preload="metadata"` + poster léger, contrôle utilisateur explicite |
| Rendu qui échoue | Plan B : si Remotion casse en sandbox, je livre une version dégradée (page avec mockups React animés en attendant) |

## Hors scope (à demander si tu veux)

- Bande son musicale réelle (post-mux ffmpeg avec MP3 libre)
- Voix off ElevenLabs en français
- Tabs morphing / explorateur curriculum / témoignages (la version "landing complète")
- Versions courtes 15s / 30s pour réseaux sociaux

Valide ce plan et je lance la construction.