

# Mode Lecture Immersive — Contenu & Exemples

Ajouter un mode d'affichage alternatif "Lecture Immersive" pour les sections Contenu et Exemples qui transforme le texte en une experience visuelle engageante, section par section, avec des effets de reveal progressif et une typographie soignee.

## Ce qui change pour l'etudiant

Au lieu d'un mur de texte, l'etudiant voit:
- Chaque section apparait avec une animation douce (fade-in + slide-up) quand elle est revelee
- Les titres (h3/h4) ont un effet de soulignement anime au moment de leur apparition
- Les "boxes" speciales (didYouKnowBox, importantBox, exerciseBox) ont un effet de glow pulse subtil a l'apparition
- Un toggle en haut permet de basculer entre "Mode classique" (actuel) et "Mode immersif"
- Sur connexion lente (2G/3G), le mode immersif se desactive automatiquement et le mode classique est utilise

## Fichiers a modifier

### 1. `src/components/lesson/ProgressiveContent.tsx` — Ajouter le toggle + mode immersif

Modifications:
- Ajouter une prop `enableImmersiveMode?: boolean` (defaut: `true`)
- Ajouter un state `isImmersive` avec un toggle bouton discret en haut a droite de la barre de progression
- En mode immersif, chaque section revelee utilise le nouveau composant `ImmersiveSection` au lieu du rendu brut
- Utiliser `useNetworkAwareLoading` pour desactiver automatiquement le mode immersif sur connexion lente

### 2. Nouveau: `src/components/lesson/ImmersiveSection.tsx` — Rendu anime d'une section

Ce composant wrap une section individuelle avec des effets visuels:
- **Animation d'entree**: fade-in + translateY(20px -> 0) avec `duration-700 ease-out` via Tailwind
- **Titres (heading)**: apres l'animation d'entree, un trait de soulignement s'anime de gauche a droite (CSS `scaleX(0) -> scaleX(1)` via une classe `animate-underline`)
- **Boxes speciales**: bordure gauche qui pulse doucement 2 fois a l'apparition (keyframe `boxHighlight`)
- **Paragraphes**: legere opacite progressive (`opacity 0.7 -> 1` sur 500ms) pour un effet de "materialisation"
- Utilise `IntersectionObserver` pour ne lancer l'animation que quand la section entre dans le viewport (pas au chargement)
- Prop `delay?: number` pour le stagger entre sections (0ms, 100ms, 200ms...)

### 3. `src/index.css` — Nouvelles animations CSS

Ajouter dans le bloc `@layer utilities`:

```css
/* Immersive reading mode animations */
@keyframes immersive-fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes underline-grow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes box-highlight {
  0%, 100% { border-left-color: hsl(var(--primary) / 0.3); }
  50% { border-left-color: hsl(var(--primary)); }
}

.animate-immersive-in {
  animation: immersive-fade-in 0.7s ease-out forwards;
  opacity: 0;
}

.animate-underline-grow {
  transform-origin: left;
  animation: underline-grow 0.5s ease-out 0.3s forwards;
  transform: scaleX(0);
}

.animate-box-highlight {
  animation: box-highlight 1.5s ease-in-out;
}
```

### 4. `src/features/matieres/components/tabs/LessonContenuTab.tsx` — Passer la prop

Passer `enableImmersiveMode={true}` aux deux `ProgressiveContent` (contenu et exemples).

## Details techniques

```text
+-----------------------------------------------+
|  Progression de lecture    2/8   [Immersif ON] |
|  ========------                                |
+-----------------------------------------------+
|                                                |
|  [Section 1 - visible, animation terminee]     |
|  Titre avec souligne anime ___________         |
|  Paragraphe materialise                        |
|                                                |
|  [Section 2 - vient d'apparaitre, en animation]|
|  Fade-in + slide-up en cours...                |
|                                                |
|  [Section 3 - blurred preview, pas encore]     |
|  "Continue a lire pour debloquer..."           |
|                                                |
+-----------------------------------------------+
```

## Architecture des props

```text
LessonContenuTab
  +-- ProgressiveContent (enableImmersiveMode=true)
        +-- [toggle: Mode classique / Immersif]
        +-- useNetworkAwareLoading() -> auto-disable on slow
        +-- sections.map()
              +-- ImmersiveSection (si immersif + revealed)
              |     +-- IntersectionObserver
              |     +-- animation CSS conditionnelle
              +-- div dangerouslySetInnerHTML (si classique)
```

## Regles reseau (3G-first)

- `useNetworkAwareLoading().shouldShowAnimations === false` -> mode immersif desactive, toggle cache
- `loadingStrategy === 'minimal'` -> aucune animation, rendu brut direct
- `loadingStrategy === 'reduced'` -> animations simplifiees (fade-in sans slide, pas de stagger)
- `loadingStrategy === 'full'` -> toutes les animations actives

## Safety Verification

| Check | Status |
|-------|--------|
| Fonctionnalite existante cassee? | Non — le mode classique reste le defaut, toggle optionnel |
| Provider stack / AppShell? | Pas touche |
| Nouvelles dependances? | Aucune — CSS + IntersectionObserver natif |
| Taille bundle | Minimal — 1 petit composant (~80 lignes) + CSS |
| Performance 3G | Auto-desactive sur connexion lente |
| Compatibilite | Mode classique inchange, immersif est additif |
| Dark mode | Utilise les CSS variables existantes |

