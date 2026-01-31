
# Expand Content Editor to Include Civique and Personnel Video Management

## Overview

This plan creates a **robust, matching architecture** for Civique and Personnel categories that mirrors the existing Passion structure exactly. The goal is a unified, maintainable system where all three content types share the same patterns.

---

## Current Architecture Analysis

| Component | Passion | Civique | Personnel |
|-----------|---------|---------|-----------|
| Activity Data File | `passionActivities.ts` | None (fallback) | None (fallback) |
| Categories | 4 (music, arts, chess, literature) | 3 (rights, citizenship, peace) | 1 (personal) |
| Modules per Category | 4 | 4 | 4 |
| Activities per Module | 4 (video, reading, quiz, game) | Generated fallback | Generated fallback |
| Video Management | Full support | None | None |

**After Implementation:**

| Component | Passion | Civique | Personnel |
|-----------|---------|---------|-----------|
| Activity Data File | `passionActivities.ts` | `civicActivities.ts` | `personalActivities.ts` |
| Categories | 4 | 3 | 1 |
| Modules per Category | 4 | 4 | 4 |
| Activities per Module | 4 | 4 | 4 |
| Video Management | Full support | Full support | Full support |

---

## Files to Create

### 1. `src/data/civicActivities.ts`

Structure matching `passionActivities.ts`:

```
civicActivities.ts
├── Exports:
│   ├── rightsActivities: CategoryContent
│   ├── citizenshipActivities: CategoryContent
│   └── peaceActivities: CategoryContent
│
├── rightsActivities (Droits Fondamentaux):
│   ├── education (Droit a l'Education)
│   │   ├── education-video
│   │   ├── education-reading
│   │   ├── education-quiz
│   │   └── education-game
│   ├── health (Droit a la Sante)
│   ├── expression-civic (Liberte d'Expression)
│   └── duties (Devoirs du Citoyen)
│
├── citizenshipActivities (Citoyennete Active):
│   ├── democracy (Principes de la Democratie)
│   ├── participation (Participation Civique)
│   ├── laws (Respect des Lois)
│   └── civic-role (Role du Citoyen)
│
└── peaceActivities (Culture de la Paix):
    ├── tolerance (Tolerance & Diversite)
    ├── solidarity (Solidarite & Entraide)
    ├── justice (Justice Sociale)
    └── conflict (Resolution de Conflits)

Total: 3 categories x 4 modules x 4 activities = 48 activities (12 videos)
```

### 2. `src/data/personalActivities.ts`

```
personalActivities.ts
├── Exports:
│   └── personalActivities: CategoryContent
│
└── personalActivities (Croissance Personnelle):
    ├── time-management (Gestion du Temps)
    │   ├── time-management-video
    │   ├── time-management-reading
    │   ├── time-management-quiz
    │   └── time-management-game
    ├── confidence (Confiance en Soi)
    ├── emotions (Intelligence Emotionnelle)
    └── communication (Communication)

Total: 1 category x 4 modules x 4 activities = 16 activities (4 videos)
```

---

## Files to Modify

### 3. `src/data/passionActivities.ts`

**Update `getActivitiesForModule` function to handle all 8 categories:**

```typescript
// Add imports at top (after we create the files)
import { rightsActivities, citizenshipActivities, peaceActivities } from './civicActivities';
import { personalActivities } from './personalActivities';

export const getActivitiesForModule = (categoryId: string, moduleId: string): ActivityContent[] | null => {
  let categoryData: CategoryContent | undefined;
  
  switch (categoryId) {
    // Passion categories
    case "music":
      categoryData = musicActivities;
      break;
    case "arts":
      categoryData = artsActivities;
      break;
    case "chess":
      categoryData = chessActivities;
      break;
    case "literature":
      categoryData = literatureActivities;
      break;
    // Civic categories (NEW)
    case "rights":
      categoryData = rightsActivities;
      break;
    case "citizenship":
      categoryData = citizenshipActivities;
      break;
    case "peace":
      categoryData = peaceActivities;
      break;
    // Personal category (NEW)
    case "personal":
      categoryData = personalActivities;
      break;
    default:
      return null;
  }
  
  const module = categoryData[moduleId];
  return module?.activities || null;
};

// Update helper function
export const getCategoriesWithActivities = (): string[] => {
  return [
    "music", "arts", "chess", "literature",  // Passion
    "rights", "citizenship", "peace",         // Civic
    "personal"                                 // Personal
  ];
};
```

---

### 4. `src/components/content-editor/PassionVideoManager.tsx`

**Add content type selector at the top level:**

Current structure:
```
PassionVideoManager
└── passionCategories (4 categories)
    └── Accordion with modules and activities
```

New structure:
```
PassionVideoManager
├── Content Type Selector: [Passions] [Civique] [Personnel]
└── currentCategories (switches based on selection)
    └── Same Accordion structure
```

**Key changes:**

```typescript
// Add new imports
import { 
  rightsActivities, 
  citizenshipActivities, 
  peaceActivities 
} from "@/data/civicActivities";
import { personalActivities } from "@/data/personalActivities";
import { Award, Users, Heart, Lightbulb } from "lucide-react";

// Add new category arrays
const civicCategories = [
  { id: 'rights', title: 'Droits Fondamentaux', icon: Award, emoji: '🏛️', activities: rightsActivities },
  { id: 'citizenship', title: 'Citoyenneté Active', icon: Users, emoji: '🗳️', activities: citizenshipActivities },
  { id: 'peace', title: 'Culture de la Paix', icon: Heart, emoji: '☮️', activities: peaceActivities },
];

const personalCategories = [
  { id: 'personal', title: 'Croissance Personnelle', icon: Lightbulb, emoji: '🌱', activities: personalActivities },
];

// Add content type state
const [contentType, setContentType] = useState<'passion' | 'civic' | 'personal'>('passion');

// Dynamic category selection
const currentCategories = useMemo(() => {
  switch (contentType) {
    case 'civic': return civicCategories;
    case 'personal': return personalCategories;
    default: return passionCategories;
  }
}, [contentType]);

// Update all usages of passionCategories to use currentCategories
```

**Add content type UI before the main tabs:**

```tsx
{/* Content Type Selector */}
<Card className="border-2 border-primary/20 mb-4">
  <CardContent className="p-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <span className="text-sm font-medium whitespace-nowrap">Type de contenu:</span>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={contentType === 'passion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setContentType('passion');
            setSelectedCategory('');
            setSelectedModule('');
          }}
        >
          <Music className="h-4 w-4 mr-2" />
          Passions (4)
        </Button>
        <Button
          variant={contentType === 'civic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setContentType('civic');
            setSelectedCategory('');
            setSelectedModule('');
          }}
        >
          <Award className="h-4 w-4 mr-2" />
          Civique (3)
        </Button>
        <Button
          variant={contentType === 'personal' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setContentType('personal');
            setSelectedCategory('');
            setSelectedModule('');
          }}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Personnel (1)
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Activity Content Structure (Matching Passion Pattern)

Each activity follows this exact structure from `passionActivities.ts`:

```typescript
{
  id: "module-video",
  type: "video",
  title: "Video Title",
  description: "Short description",
  duration: "X min",
  content: { videoQuery: "YouTube search query" }
},
{
  id: "module-reading",
  type: "reading",
  title: "Reading Title",
  description: "Description",
  duration: "X min",
  content: {
    readingContent: `<h3>...</h3><p>...</p>`
  }
},
{
  id: "module-quiz",
  type: "quiz",
  title: "Quiz Title",
  description: "Description",
  duration: "X min",
  content: {
    quizQuestions: [
      {
        question: "Question text?",
        options: ["A", "B", "C", "D"],
        correctIndex: 1,
        explanation: "Explanation..."
      }
    ]
  }
},
{
  id: "module-game",
  type: "game",
  title: "Game Title",
  description: "Description",
  duration: "X min",
  content: {
    gameDescription: "Activity instructions..."
  }
}
```

---

## Video Activity Count Summary

| Type | Categories | Modules | Video Activities | Configured Videos |
|------|------------|---------|------------------|-------------------|
| Passion | 4 | 16 | 16 | Tracked in DB |
| Civique | 3 | 12 | 12 | To be added |
| Personnel | 1 | 4 | 4 | To be added |
| **Total** | **8** | **32** | **32** | - |

---

## Database Compatibility

No database changes needed. The existing `passion_activity_videos` table already supports any `category_id`:

```sql
-- Current schema supports all category types
passion_activity_videos (
  category_id TEXT,  -- "rights", "citizenship", "peace", "personal" all work
  module_id TEXT,
  activity_id TEXT,
  youtube_url TEXT,
  ...
)
```

---

## Implementation Order

1. **Create `civicActivities.ts`** - Full content for 12 modules (48 activities)
2. **Create `personalActivities.ts`** - Full content for 4 modules (16 activities)
3. **Update `passionActivities.ts`** - Extend `getActivitiesForModule` to handle all 8 categories
4. **Update `PassionVideoManager.tsx`** - Add content type selector and dynamic category switching

---

## Content Examples

### Civic - Rights Category - Education Module

```typescript
education: {
  id: "education",
  title: "Droit a l'Education",
  description: "Comprends ton droit fondamental a l'education",
  duration: "15 min",
  activities: [
    {
      id: "education-video",
      type: "video",
      title: "Le droit a l'education explique",
      description: "Decouvre pourquoi l'education est un droit universel",
      duration: "5 min",
      content: { videoQuery: "droit education enfants francais explique" }
    },
    {
      id: "education-reading",
      type: "reading",
      title: "L'education: un droit universel",
      description: "Comprends l'importance de ce droit fondamental",
      duration: "5 min",
      content: {
        readingContent: `
          <h3>Qu'est-ce que le droit a l'education?</h3>
          <p>Le droit a l'education est un droit humain fondamental...</p>
          <h4>En Haiti</h4>
          <p>La Constitution haitienne garantit le droit a l'education...</p>
        `
      }
    },
    // ... quiz and game activities
  ]
}
```

### Personal - Time Management Module

```typescript
"time-management": {
  id: "time-management",
  title: "Gestion du Temps",
  description: "Apprends a organiser ton temps efficacement",
  duration: "15 min",
  activities: [
    {
      id: "time-management-video",
      type: "video",
      title: "Les secrets de la gestion du temps",
      description: "Decouvre comment organiser tes journees",
      duration: "5 min",
      content: { videoQuery: "gestion temps etudiant conseils francais" }
    },
    // ... other activities
  ]
}
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adds new content, existing passion management unchanged |
| Database changes needed? | No | Uses existing table with flexible category_id |
| Works with existing data? | Yes | 16 existing passion videos remain unchanged |
| Backward compatible? | Yes | PassionDiscovery already has civic/personal tabs with fallback |
| 3G optimized? | Yes | Same lazy loading pattern, no additional network requests |
| Student page impact? | Positive | Real content replaces generated fallbacks |
| Matches passion structure? | Exactly | Same interfaces, same patterns, same activity types |

---

## UI Preview - Content Editor

```
+------------------------------------------------------------------+
| Video Passion - Vue d'ensemble                                    |
+------------------------------------------------------------------+
| Type de contenu:                                                  |
| [Passions (4)] [Civique (3)] [Personnel (1)]                     |
+------------------------------------------------------------------+
|                                                                   |
| [Videos d'Activites] [Videos Recommandees] [Videos Bannies]      |
|                                                                   |
| Structure des Civique:                                            |
| Vue hierarchique: Categorie -> Module -> Activites video          |
|                                                                   |
| > Droits Fondamentaux                           [ 4/4 videos ]   |
|   > Droit a l'Education                                           |
|     - education-video                           [Configurer]      |
|   > Droit a la Sante                                              |
|     - health-video                              [Configurer]      |
|   ...                                                             |
|                                                                   |
| > Citoyennete Active                            [ 0/4 videos ]   |
| > Culture de la Paix                            [ 0/4 videos ]   |
+------------------------------------------------------------------+
```

---

## Technical Notes

1. **Type Safety**: All new files use the same `ActivityContent`, `ModuleContent`, and `CategoryContent` interfaces from `passionActivities.ts`

2. **Import Strategy**: The new files are imported into `passionActivities.ts` which re-exports the combined `getActivitiesForModule` function - this maintains a single source of truth

3. **State Reset**: When switching content type, the selected category and module are reset to avoid stale selections

4. **Query Key Separation**: React Query hooks continue to work correctly since they key on `category_id` which now includes civic and personal IDs
