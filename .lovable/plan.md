## Constat

La v4 reste monotone et trop "abstraite" : palette paper/teal partout, mockups stylisés qui ne ressemblent pas à mon-edupreneur.com, et zéro argument de conversion. On va corriger les deux en même temps : **fidélité visuelle au site réel** + **structure persuasive qui pousse à s'inscrire**.

---

## 1. Fidélité au vrai site

Capture screenshots réels des pages clés via Puppeteer sur `https://mon-edupreneur.com` (login automatique avec compte démo si nécessaire — sinon pages publiques) :

- Landing (hero + sections)
- Dashboard (vrai layout : sidebar teal, cards gold/streak, graphes)
- Matières (vraies cards SVT/Math/Français avec vraies couleurs)
- Leçon (vrai header, vrai contenu KaTeX, vrais boutons)
- Jude AI (vraie bulle de chat, vrai avatar)
- Feed / Messages / Quiz Battle / Leaderboard / Translate

Ces screenshots deviennent des **assets PNG** importés dans les scènes — plus de mockups inventés. On garde les animations Remotion (entrées, zooms, pans) mais sur des **images réelles du produit**.

Avantage : le viewer reconnaît immédiatement le site → confiance + envie d'essayer.

Fallback si Puppeteer/login bloque : on **rebuild des mockups pixel-perfect** en lisant les composants réels (`src/pages/Dashboard.tsx`, `src/shell/AppShell.tsx`, etc.) — vraie sidebar teal `#087E7E`, vrais tokens Tailwind, vrais composants shadcn.

---

## 2. Variété visuelle (sortir du monotone)

Adopter le **vrai design system du site** au lieu du paper/teal uniforme :

```text
Fond app                → blanc/dark selon thème (#FFFFFF / #0A0B0D)
Sidebar                 → teal #087E7E (vraie sidebar)
Accents                 → amber #FF9F00 (gold, streak, CTA)
Violet                  → #7C3AED (Jude AI, badges premium)
Cards                   → blanc + ombres subtiles + bordures hairline
```

**6 ambiances de scène** mixées :
1. **Mode jour** (Landing, Dashboard, Matières) → fond clair, sidebar teal
2. **Mode sombre** (Leçon nuit, Jude) → fond `#0A0B0D`, glow teal
3. **Mockup mobile** (Feed, Messages, Quiz) → frame iPhone, fond noir autour
4. **Plein écran teal** (big words ÉCOLE/JUDE/ENSEMBLE) → rupture cinéma
5. **Split-screen témoignage** (nouveau) → photo élève + citation + nom/grade
6. **Stats fullscreen** (nouveau) → chiffres énormes amber sur fond sombre

---

## 3. Structure persuasive (nouvelle narration en 6 actes)

L'actuelle est descriptive ("voici les features"). La nouvelle est **vendeuse** :

```text
ACTE 1 — PROBLÈME (3s)
  "Étudier en Haïti, c'est dur." (texte sur fond sombre + bruit léger)
  Sous-texte: "Pannes. Pas de prof. Manuels chers."

ACTE 2 — PROMESSE (2s)
  Big word: "ÇA CHANGE." (fond teal, type énorme)

ACTE 3 — SOLUTION EN ACTION (35s) ← cœur, fidèle au site
  Dashboard réel → Matières → Leçon (KaTeX) → Jude répond → Quiz Battle gagné
  Voice-over visuel (sous-titres kinétiques) :
  "Tout le programme MENFP. Jude, ton tuteur IA. Quiz multijoueur. Gratuit pour commencer."

ACTE 4 — PREUVE SOCIALE (8s) ← nouveau
  3 témoignages courts :
  • "+2 moyennes en Math" — Marvens, NS3
  • "Jude répond à 2h du matin" — Wideline, NS4
  • "1ère du classement de ma classe" — Sara, 9AF
  Format split-screen photo + citation amber

ACTE 5 — CHIFFRES (5s) ← nouveau
  Stats fullscreen avec compteurs animés :
  "1200+ leçons · 50 000+ questions · 24/7 Jude · 100% MENFP"

ACTE 6 — CTA URGENT (5s)
  Big word ENSEMBLE → URL géante mon-edupreneur.com
  "Crée ton compte. 2 minutes. Gratuit."
  Petit badge: "Conçu en Haïti 🇭🇹"
```

Total ~58s (vs 78s actuel) — plus punchy, conversion-driven.

---

## 4. Techniques de persuasion

- **Hook problème → solution** dans les 5 premières secondes (sinon le viewer scroll)
- **Témoignages réels** = preuve sociale (le levier #1 en marketing edu)
- **Chiffres énormes** = autorité + crédibilité
- **Urgence douce** = "2 minutes" + "gratuit" répétés
- **Mascotte Jude** visible 3x minimum (ancrage brand)
- **Logo + URL** visible en watermark discret 100% du temps (coin bas-droite)
- **Couleur amber sur tous les CTA** = cohérence avec les boutons réels du site

---

## 5. Fichiers touchés

- `remotion/src/v5/MainVideoV5.tsx` (nouveau) — narration 6 actes
- `remotion/src/v5/scenes/` (nouveau) — 1 fichier par scène
- `remotion/src/v5/assets/` — screenshots réels PNG (capturés via script)
- `remotion/scripts/capture-site-screenshots.mjs` (nouveau) — Puppeteer sur prod
- `remotion/src/Root.tsx` — registrer composition v5
- `remotion/scripts/render-remotion.mjs` — pointer v5
- `public/edupreneurs-promo.mp4` + `-poster.jpg` — remplacement final

v1-v4 préservées intactes dans `/mnt/documents/`.

---

## 6. Hors périmètre

- Pas de voix off (muet, sous-titres kinétiques visibles)
- Pas de musique (le silence force la lecture du texte)
- Pas de nouvelles fonctionnalités du site

---

## Questions avant exécution

1. **Témoignages** : j'utilise des **prénoms + photos AI génériques** (cohérent identité haïtienne) ou tu as des **vrais témoignages clients** à me fournir (texte + prénom + grade) ?
2. **Captures réelles vs mockups pixel-perfect** : je tente d'abord Puppeteer sur la prod (risque de login bloquant) puis fallback mockup, OU je vais direct en mockup pixel-perfect basé sur le code source (plus rapide, plus contrôlé) ?
3. **Durée cible** : 58s (recommandé pour réseaux sociaux) ou tu veux garder ~78s ?
