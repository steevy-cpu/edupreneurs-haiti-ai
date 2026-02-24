

# Polish Points Cles — Visual Design + AI Prompt

## Perimetre

**2 fichiers modifies :**
1. `src/features/matieres/components/tabs/LessonPointsClesTab.tsx` (renderer)
2. `supabase/functions/generate-studygram/index.ts` (AI prompt + Zod schema)

Aucun autre fichier touche. Hook, data structure, et edge function logic inchanges.

## Changements detailles

### Fichier 1 : LessonPointsClesTab.tsx

#### 1a. Icones par type de carte

Ajout d'un mapping `TYPE_ICONS` utilisant des icones Lucide existantes (deja dans le bundle) :

| Type | Icone | Import |
|---|---|---|
| concept | BookOpen | lucide-react |
| example | Lightbulb | lucide-react |
| formula | Calculator | lucide-react |
| tip | Sparkles | deja importe |
| remember | Star | lucide-react |

L'icone s'affiche a cote de l'emoji dans le header de chaque carte. La carte `remember` recoit une bordure supplementaire `ring-2 ring-white/30`.

#### 1b. Layouts specifiques par type

- **formula** : le contenu est affiche dans un bloc monospace (`bg-white/10 rounded-lg p-3 font-mono text-sm`)
- **example** : le contenu est precede d'un label "Par exemple :" en italique
- **remember** : texte legerement plus grand (`text-base sm:text-lg`), decoration etoile pulsante dans le coin superieur droit
- **concept** et **tip** : layout centre actuel conserve

#### 1c. Progress dots externalises

- Suppression du composant `ProgressDots` a l'interieur de `PointsClesCardSlide` (lignes 67-69)
- Ajout d'indicateurs externes sous le carousel, colores selon le type de la carte active
- Style : cercle rempli pour actif, cercle transparent pour inactif

#### 1d. Carousel ameliore

- `max-w-lg` (ligne 213) remplace par `max-w-2xl` pour utiliser plus d'espace sur desktop
- Suppression de l'etat `api` (ligne 138) — jamais lu apres `setApi`, code mort
- Ajout d'un `useEffect` pour navigation clavier (fleches gauche/droite) via `emblaApi.scrollPrev()`/`scrollNext()`
- Fleches prev/next : `hidden sm:flex` (lignes 223-224) remplace par `flex` — visibles sur mobile aussi
- Boutons fleches plus grands avec fond semi-transparent

### Fichier 2 : generate-studygram/index.ts

#### 2a. Prompt systeme ameliore

Remplacement du prompt systeme (lignes 100-112) par une version enrichie avec :

- Role plus precis : "expert pedagogique haitien specialise en memorisation active"
- Distribution des types obligatoire : au moins 1 carte de chaque type parmi concept, example, formula/tip, remember
- Descriptions du role de chaque type (concept = definir, example = illustrer, formula = memoriser, tip = astuce, remember = critique)
- Titres limites a 8 mots (au lieu de 10) — formules comme affirmations claires
- Adaptation explicite par niveau : primaire = simple, secondaire = plus detaille

#### 2b. Schema Zod aligne

Ligne 49 : `z.array(cardSchema).min(3).max(10)` devient `z.array(cardSchema).min(5).max(8)` pour correspondre exactement au prompt.

## Recapitulatif des changements par ligne

**LessonPointsClesTab.tsx :**
- Ligne 13 : ajout imports BookOpen, Lightbulb, Calculator, Star
- Lignes 27-33 : conserve CARD_GRADIENTS
- Apres ligne 42 : ajout TYPE_ICONS mapping
- Lignes 44-58 : suppression ProgressDots (remplace par dots externes)
- Lignes 60-97 : refonte PointsClesCardSlide avec layouts par type, icone, ring pour remember
- Ligne 138 : suppression `const [api, setApi]`
- Ligne 141-147 : refonte onApiChange sans setApi, ajout useEffect keyboard nav
- Ligne 213 : max-w-lg → max-w-2xl
- Lignes 223-224 : hidden sm:flex → flex + style agrandi
- Apres ligne 225 : ajout dots externes colores

**generate-studygram/index.ts :**
- Ligne 49 : min(3).max(10) → min(5).max(8)
- Lignes 100-112 : remplacement prompt systeme complet

## Verification securite

| Check | Resultat |
|---|---|
| Fonctionnalite cassee? | Non — meme data, nouveau rendu |
| Hook modifie? | Non |
| Nouvelles dependances? | Non — icones Lucide deja dans le bundle |
| Bundle size | Identique |
| Performance 3G | Identique — meme volume DOM |
| Cache existant | Compatible — meme structure de donnees |
| Dark mode | Compatible — gradients inchanges |
| Edge function logic | Inchangee — seul le prompt et la validation Zod changent |
| Rate limiting | Inchange |

