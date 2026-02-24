

# Redesign du renderer Studygram — Style Mind Map visuel

## Perimetre

**Un seul fichier modifie :** `src/features/matieres/components/tabs/LessonStudygramTab.tsx`

Aucune modification de : edge function, hook, types, data structure, LessonPageTemplate, ni aucun autre fichier.

## Ce qui change visuellement

Le rendu actuel (cartes plates en grille) est remplace par un vrai style "fiche de revision visuelle" :

```text
+--------------------------------------------------+
|  .............. graph paper bg .................. |
|                                                    |
|        [ Titre de la lecon ]  <-- pill gradient    |
|          Matiere - Niveau                          |
|                    |                               |
|         -----------+-----------                    |
|         |                     |                    |
|  +------+------+    +--------+------+              |
|  | Explicatif  |    | Approfondir   |              |
|  | (bleu)      |    | (violet)      |              |
|  |  |-- node   |    |  |-- node     |              |
|  |  |-- node   |    |  |-- node     |              |
|  |  '-- node   |    |  '-- node     |              |
|  +-------------+    +---------------+              |
|         |                     |                    |
|  +------+------+    +--------+------+              |
|  | A Retenir   |    | Resume visuel |              |
|  | (vert)      |    | (ambre)       |              |
|  |  |-- node   |    |  [central]    |              |
|  |  |-- node   |    |  / | \        |              |
|  |  '-- node   |    | [A][B][C]     |              |
|  +-------------+    +---------------+              |
|                                                    |
|            [Regenerer le studygram]                 |
+--------------------------------------------------+
```

## Details techniques

### 1. Fond graph paper (grille subtile)

Un `repeating-linear-gradient` CSS applique au conteneur principal pour simuler du papier quadrille :

- Lignes fines (`1px`) en `border/10` opacite
- Espacement de `20px` entre les lignes
- Compatible dark mode via `dark:` variants

### 2. Titre central — pill avec gradient

- Pill arrondi (`rounded-full`) avec gradient `from-purple-600 to-indigo-600`
- Texte blanc, gras, taille `lg`/`xl`
- Sous-titre en `text-muted-foreground` en dessous
- Ligne verticale CSS (`border-l-2 border-dashed`) descendant du titre vers la grille de sections

### 3. Mapping section type vers couleur (fixe)

| Section type | Couleur | Header bg | Border |
|---|---|---|---|
| `explicatif` | Bleu | `bg-blue-500` text blanc | `border-blue-300` |
| `approfondissement` | Violet/Pink | `bg-purple-500` text blanc | `border-purple-300` |
| `a_retenir` | Vert | `bg-emerald-500` text blanc | `border-emerald-300` |
| `resume_visuel` | Ambre | `bg-amber-500` text blanc | `border-amber-300` |

Les headers de section passent de pastels legers a des **couleurs saturees avec texte blanc** pour un contraste de type "bulle de mind map".

### 4. Section cluster — header bulle + noeuds branches

Chaque section est un cluster :

- **Header bulle** : `rounded-full px-5 py-2` avec couleur saturee + emoji + heading en blanc gras
- **Ligne verticale** : `border-l-2` dashed partant du header vers les noeuds
- **Noeuds branches** : chaque noeud a une barre horizontale (`border-t-2`) qui part de la ligne verticale, creant un arbre en L

```text
  [Section Header]
       |
       |--- [Node 1 highlight - pill shape]
       |
       |--- [Node 2 outline - rectangle]
       |
       '--- [Node 3 quote - italic card]
```

### 5. Formes de noeuds mixtes

| Style | Forme | Rendu |
|---|---|---|
| `highlight` | Pill (`rounded-full`) | Fond colore sature, texte blanc, gras |
| `outline` | Rectangle arrondi (`rounded-lg`) | Bordure coloree, fond transparent |
| `quote` | Rectangle avec barre laterale | Italique, guillemets francais |
| `plain` | Rectangle simple | Texte avec bullet point |
| `mindmap` | Pill/ovale (`rounded-full`) | Fond pastel, texte colore, ombre legere |

### 6. Section "Resume visuel" — mind map radial

Pour le type `resume_visuel`, le rendu reste specifique :
- Noeud central en pill large
- Ligne verticale dashed du centre vers une barre horizontale
- Noeuds enfants en pills connectes via la barre horizontale

### 7. Section "A retenir" — bordure epaisse + etoile

- `border-2` au lieu de `border`
- Icone etoile dans le header
- Fond legerement plus sature pour l'emphase

### 8. Responsive

- **Desktop** : `grid-cols-2` — 4 sections en 2x2
- **Mobile** : `grid-cols-1` — empilement vertical
- Ligne verticale centrale masquee sur mobile
- Gap entre sections : `gap-6`

### 9. Dark mode

- Graph paper : lignes en `border/5` en dark
- Headers : memes couleurs saturees (pas de changement)
- Noeuds : fonds `dark:bg-{color}-950/40`, bordures `dark:border-{color}-800`
- Titre pill : meme gradient, pas de changement

### 10. Composants remplaces

Les composants suivants sont supprimes et remplaces par un seul `MindMapRenderer` :

- `StudygramNodeItem` → remplace par `MindMapNode`
- `MindmapSection` → integre dans `MindMapSectionCluster`
- `ARetenirSection` → integre dans `MindMapSectionCluster` (avec variante etoile)
- `StandardSectionCard` → integre dans `MindMapSectionCluster`
- `StudygramSectionCard` → remplace par `MindMapSectionCluster`

Les composants conserves tels quels :
- `StudygramSkeleton` (loading state)
- `LessonStudygramTab` (export principal — seul le JSX du rendu principal change)

## Verification securite

| Check | Resultat |
|---|---|
| Fonctionnalite cassee? | Non — rendu visuel uniquement |
| Hook/edge function modifie? | Non |
| Data structure modifiee? | Non |
| Nouvelle dependance? | Non — CSS/Tailwind pur |
| Performance 3G | Identique — meme volume de DOM |
| Dark mode | Compatible via Tailwind dark: |
| Mobile responsive | Oui — grid-cols-1 sur mobile |

