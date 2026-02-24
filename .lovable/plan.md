
# Renommer "Studygram" en "Points Clés"

Renommage purement cosmétique — aucun changement fonctionnel, aucune nouvelle dépendance.

## Ce qui change pour l'utilisateur

- L'onglet affiche **"Points Clés"** (desktop) et **"Clés"** (mobile) au lieu de "Studygram" / "Study"
- L'icône passe de `Layers` à `Lightbulb` (plus évocateur)
- Tout le reste fonctionne exactement pareil

## Fichiers concernés (4 fichiers)

### 1. Nouveau fichier: `src/features/matieres/components/tabs/LessonPointsClesTab.tsx`
- Copie de `LessonStudygramTab.tsx` avec renommages internes:
  - `LessonStudygramTabProps` → `LessonPointsClesTabProps`
  - `StudygramCardSlide` → `PointsClesCardSlide`
  - `StudygramSkeleton` → `PointsClesSkeleton`
  - Export: `LessonPointsClesTab`
- Import du hook renommé `usePointsClesCards`
- L'ancien fichier `LessonStudygramTab.tsx` sera supprimé

### 2. Nouveau fichier: `src/features/matieres/hooks/usePointsClesCards.ts`
- Copie de `useStudygramCards.ts` avec renommages:
  - `StudygramCard` → `PointsClesCard`
  - `useStudygramCards` → `usePointsClesCards`
  - Logs console: `[PointsCles]` au lieu de `[Studygram]`
- La clé localStorage **reste identique** (`ai_studygram_{id}_v1`) pour préserver le cache existant
- L'appel edge function **reste identique** (`generate-studygram`) — pas de redéploiement backend
- L'ancien fichier `useStudygramCards.ts` sera supprimé

### 3. Modifier: `src/features/matieres/components/tabs/index.ts`
- Export `LessonPointsClesTab` depuis `./LessonPointsClesTab` (remplace l'ancien export)

### 4. Modifier: `src/components/LessonPageTemplate.tsx`
- Import: `LessonPointsClesTab` au lieu de `LessonStudygramTab`
- Import: `Lightbulb` au lieu de `Layers`
- Tab value: `studygram` → `points-cles`
- Labels: "Points Clés" (desktop), "Clés" (mobile)
- TabErrorBoundary tabName: "Points Clés"
- getTabStatus: `points-cles`

## Ce qui ne change PAS
- Clé de cache localStorage (compatibilité arrière)
- Edge function `generate-studygram` (pas de redéploiement)
- Aucune logique, aucun style, aucune fonctionnalité

## Vérification sécurité

| Check | Résultat |
|-------|----------|
| Fonctionnalité cassée? | Non — renommage uniquement |
| Provider stack / AppShell? | Pas touché |
| Nouvelles dépendances? | Non |
| Bundle size | Identique |
| Performance 3G | Identique |
| Cache utilisateurs | Préservé (même clé localStorage) |
