

# Ajouter un nouvel onglet "Studygram" (fiche visuelle)

L'onglet "Points Cles" existant reste intact. On ajoute un **7e onglet** "Studygram" qui affiche une fiche de revision visuelle style carte mentale, avec des sections colorees et des boites thematiques (comme sur l'image de reference).

## Ce qui change pour l'utilisateur

- Un nouvel onglet **"Studygram"** (desktop) / **"Study"** (mobile) apparait entre "Points Cles" et "Activites"
- En cliquant dessus, l'IA genere une fiche visuelle structuree en sections colorees avec des noeuds de texte
- Le contenu est cache en localStorage pendant 7 jours (meme logique que Points Cles)
- L'onglet "Points Cles" existant ne change pas du tout

## Fichiers a creer (3 nouveaux)

### 1. Edge function: `supabase/functions/generate-studygram-visual/index.ts`
- Copie la structure de `generate-studygram` (rate limiting, auth, validation, AI gateway)
- Prompt AI modifie pour generer un format **sections + nodes** au lieu de flashcards simples :

```text
{
  "title": "La conscience",
  "subtitle": "Philo - Terminale",
  "sections": [
    {
      "heading": "Qu'est-ce que la conscience ?",
      "color": "blue",
      "emoji": "?",
      "nodes": [
        { "text": "La conscience morale...", "style": "highlight" },
        { "text": "3 realites distinctes", "style": "outline" }
      ]
    }
  ]
}
```

- Validation Zod stricte : 3-5 sections, 2-5 nodes par section
- Couleurs limitees a : blue, pink, green, purple, amber, rose
- Styles de nodes : highlight, outline, plain, quote

### 2. Hook: `src/features/matieres/hooks/useStudygramVisual.ts`
- Meme pattern que `usePointsClesCards.ts` : cache localStorage, lazy generation, abort controller
- Cache key: `ai_studygram_visual_${lessonId}_v1`
- Appelle l'edge function `generate-studygram-visual`
- Exporte les types `StudygramSection`, `StudygramNode`, `StudygramData`

### 3. Composant: `src/features/matieres/components/tabs/LessonStudygramTab.tsx`
- Affiche la fiche visuelle en grille responsive
- Layout : titre central + sections colorees en grid 2 colonnes (desktop) / 1 colonne (mobile)
- Chaque section : heading colore sur fond pastel + liste de nodes avec styles varies
- Mapping couleurs light/dark adaptes :

| Couleur | Light | Dark |
|---------|-------|------|
| blue | bg-blue-50 border-blue-200 | dark:bg-blue-950/40 dark:border-blue-800 |
| pink | bg-pink-50 border-pink-200 | dark:bg-pink-950/40 dark:border-pink-800 |
| green | bg-emerald-50 border-emerald-200 | dark:bg-emerald-950/40 dark:border-emerald-800 |
| purple | bg-purple-50 border-purple-200 | dark:bg-purple-950/40 dark:border-purple-800 |
| amber | bg-amber-50 border-amber-200 | dark:bg-amber-950/40 dark:border-amber-800 |
| rose | bg-rose-50 border-rose-200 | dark:bg-rose-950/40 dark:border-rose-800 |

- Etats : loading skeleton, erreur, vide, stale banner, bouton regenerer
- Pas de carousel / embla — tout en CSS grid + Tailwind

## Fichiers a modifier (2 existants)

### 4. `src/features/matieres/components/tabs/index.ts`
- Ajouter l'export `LessonStudygramTab`

### 5. `src/components/LessonPageTemplate.tsx`
- Importer `LessonStudygramTab` et l'icone `Layers` de lucide-react
- Ajouter le 7e TabsTrigger (value="studygram", label "Studygram" / "Study")
- Ajouter le 7e TabsContent avec les memes props que Points Cles
- Ajuster la grille des onglets : `grid-cols-4 md:grid-cols-7` pour accommoder 7 onglets
- Ajouter `getTabStatus('studygram')` (suit la meme logique "viewed")

## Rendu visuel du Studygram

```text
+-----------------------------------------------+
|     [emoji] Titre de la lecon                  |
|     Matiere - Niveau                           |
+-------------------+---------------------------+
| [emoji] Section 1 | [emoji] Section 2         |
| bg-blue-50        | bg-pink-50                |
|  * node highlight |  * node outline           |
|  * node outline   |  * node highlight         |
|  * node plain     |  * node quote             |
+-------------------+---------------------------+
| [emoji] Section 3                             |
| bg-green-50                                   |
|  * node highlight  * node plain               |
+-----------------------------------------------+
|              [Regenerer]                       |
+-----------------------------------------------+
```

## Ce qui ne change PAS

- L'onglet "Points Cles" (flashcards carousel) reste identique
- L'edge function `generate-studygram` existante n'est pas modifiee
- Aucune modification de base de donnees
- Aucune nouvelle dependance npm

## Verification securite

| Check | Resultat |
|-------|----------|
| Fonctionnalite existante cassee? | Non — ajout uniquement |
| Provider stack / AppShell? | Pas touche |
| Nouvelles dependances npm? | Non |
| Bundle size | Leger ajout (1 composant + 1 hook) |
| Performance 3G | OK — lazy generation, cache localStorage 7j |
| Edge function cold start | Gere — skeleton loading pendant generation |
| RLS / securite | Rate limiting + auth sur la nouvelle edge function |
