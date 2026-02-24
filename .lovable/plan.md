

# Transformer le Studygram en fiche de revision structuree

## Ce qui change

Le Studygram passe d'un format libre (3-5 sections thematiques quelconques) a une **structure pedagogique fixe en 4 blocs** :

1. **Bloc explicatif synthetique** (bleu) -- Definition principale + 3-5 idees cles + exemple concret
2. **Approfondissement** (violet) -- Theories/formules/dates/auteurs + schema/carte mentale + comparaisons
3. **A retenir** (vert) -- 5 points essentiels + formule/citation cle + astuce de memorisation
4. **Resume visuel** (rose) -- Carte mentale automatique sous forme de noeuds relies

## Fichiers a modifier (3 fichiers, 0 nouveau)

### 1. Edge function : `supabase/functions/generate-studygram-visual/index.ts`

**Changement du prompt AI :**
- Le prompt demandera exactement **4 sections fixes** avec des roles precis au lieu de sections libres
- Chaque section a un `type` obligatoire : `"explicatif"`, `"approfondissement"`, `"a_retenir"`, `"resume_visuel"`
- Le schema Zod sera mis a jour : sections passe de `min(3).max(5)` a `length(4)` avec le champ `type`
- Les nodes de la section "resume_visuel" auront un style special `"mindmap"` pour les relier visuellement
- Le prompt s'adaptera a la matiere (formules pour maths/physique, dates pour histoire, auteurs pour philo/francais)

**Nouveau schema de section :**
```text
{
  "type": "explicatif",
  "heading": "Bloc Explicatif",
  "color": "blue",
  "emoji": "📖",
  "nodes": [
    { "text": "Definition: ...", "style": "highlight" },
    { "text": "Idee cle 1", "style": "outline" },
    { "text": "Exemple: ...", "style": "quote" }
  ]
}
```

**Nouveau style de node ajoute :** `"mindmap"` -- pour les noeuds de la section resume visuel (connectes visuellement)

### 2. Hook : `src/features/matieres/hooks/useStudygramVisual.ts`

- Ajouter le type `"mindmap"` aux styles possibles de `StudygramNode`
- Ajouter le champ `type` a l'interface `StudygramSection`
- Bump du cache key a `v2` car la structure change (l'ancien cache `v1` sera ignore)

### 3. Composant : `src/features/matieres/components/tabs/LessonStudygramTab.tsx`

- Nouveau rendu pour le style `"mindmap"` : noeud central avec fleches/lignes vers les sous-noeuds (en CSS pur, pas de librairie)
- La section "A retenir" aura un encadre special avec une bordure plus epaisse et une icone etoile
- La section "Approfondissement" affichera les formules en gras et les comparaisons dans un layout side-by-side si detectees
- Layout reste en grid 2 colonnes desktop / 1 colonne mobile
- Les 4 sections auront des couleurs fixes (bleu, violet, vert, rose) au lieu de couleurs aleatoires

## Rendu visuel attendu

```text
+-----------------------------------------------+
|           Titre de la lecon                    |
|           Matiere - Niveau                     |
+------------------------+----------------------+
| [book] Bloc Explicatif | [search] Approfondir |
| bg-blue-50             | bg-purple-50         |
|  Definition principale |  Formule / Theorie   |
|  * Idee cle 1          |  * Auteur / Date     |
|  * Idee cle 2          |  * Comparaison A/B   |
|  * Idee cle 3          |  * Detail technique  |
|  Exemple concret       |                      |
+------------------------+----------------------+
| [star] A Retenir       | [brain] Resume       |
| bg-emerald-50          | bg-rose-50           |
| bordure epaisse        |                      |
|  1. Point essentiel    |    [concept central] |
|  2. Point essentiel    |    /    |    \        |
|  3. Point essentiel    |  [A]  [B]  [C]       |
|  Citation / Formule    |                      |
|  Astuce memorisation   |                      |
+------------------------+----------------------+
|           [Regenerer le studygram]             |
+-----------------------------------------------+
```

## Verification securite

| Check | Resultat |
|-------|----------|
| Fonctionnalite existante cassee? | Non -- meme composant, nouvelle structure |
| Provider stack / AppShell? | Pas touche |
| Nouvelles dependances? | Non -- tout en CSS/Tailwind |
| Bundle size | Identique |
| Performance 3G | Identique -- cache localStorage 7j |
| Cache ancien | Ignore naturellement (cache key v1 vs v2) |
| Edge function cold start | Gere -- skeleton loading |
| RLS / securite | Inchange -- meme rate limiting + auth |

## Details techniques

### Nouveau schema Zod (edge function)

Le champ `type` est ajoute au schema de section :
- `z.enum(["explicatif", "approfondissement", "a_retenir", "resume_visuel"])`
- Les sections sont validees a exactement 4 elements
- Le style `"mindmap"` est ajoute aux styles de nodes possibles

### Rendu CSS du mindmap (composant)

La section "resume visuel" utilise un layout flex avec des lignes CSS (`border` + `::before`/`::after` pseudo-elements) pour connecter visuellement le noeud central aux sous-noeuds. Pas de librairie de graphe -- tout en Tailwind + CSS natif.

### Adaptation par matiere (prompt AI)

Le prompt inclura une instruction conditionnelle selon la matiere :
- Maths/Physique/Chimie : formules, unites, schemas
- Histoire/Geographie : dates, lieux, evenements
- Philosophie/Francais : auteurs, citations, courants
- Langues : regles grammaticales, vocabulaire, exemples d'usage
