

# Content Editor UX / Layout Overhaul

## Problems Identified

| Issue | Current | Impact |
|-------|---------|--------|
| 7-column tabs on tablet | `grid-cols-7 lg:w-[1400px]` | Tabs are unreadable/cramped below 1400px |
| Single-column on tablet | Review grid only splits at `lg` (1024px) | Wastes horizontal space on 768-1024px tablets |
| Header card too tall | Full `CardHeader` with `p-6 md:p-8` | Pushes content below the fold |
| LessonBrowser rigid height | `h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]` | Doesn't adapt to tablet viewports |
| Action buttons cramped on tablet | Full text buttons in header row | Overflow/wrap on medium screens |

---

## Changes

### 1. Responsive Tab Navigation (ContentEditor.tsx)

Replace `grid-cols-7` with a scrollable horizontal tab list that works at any width:

- Remove `grid w-full grid-cols-7 lg:w-[1400px]` from TabsList
- Use `flex w-full overflow-x-auto` with `shrink-0` on triggers
- On mobile/tablet: hide text labels, show icon-only tabs
- On desktop (lg+): show icon + text

### 2. Compact Header (ContentEditor.tsx)

- Reduce the gradient hero card to a single-line header with inline title and description
- Merge the "Retour" button row and title into one sticky header bar
- Use `py-3 px-4` instead of `p-6 md:p-8`

### 3. Tablet-Responsive Review Grid (ContentEditor.tsx)

- Change from `grid-cols-1 lg:grid-cols-12` to `grid-cols-1 md:grid-cols-12`
- LessonBrowser: `md:col-span-5 lg:col-span-4` (slightly wider on tablet to fit batch tools)
- Content: `md:col-span-7 lg:col-span-8`

### 4. Flexible LessonBrowser Height (ContentEditor.tsx)

- Replace rigid `h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]`
- Use `h-[calc(100vh-200px)]` without max-h cap, so it fills available space on all viewports

### 5. Responsive Header Buttons (ContentEditor.tsx)

- On tablet: icon-only buttons for "Creer une matiere" and "Analytics IA"
- On desktop: full text + icon
- Use `<span className="hidden lg:inline">` for button labels

---

## Technical Details

### Tab Navigation Change

```tsx
// Before
<TabsList className="grid w-full grid-cols-7 lg:w-[1400px]">

// After
<TabsList className="flex w-full overflow-x-auto">
  <TabsTrigger value="review" className="flex-shrink-0 gap-1.5">
    <BookOpen className="h-4 w-4" />
    <span className="hidden md:inline text-xs">Revision</span>
  </TabsTrigger>
  ...
</TabsList>
```

### Compact Header

```tsx
// Replace big Card with a slim bar
<div className="flex items-center gap-3 py-3">
  <BookOpen className="text-primary h-6 w-6 shrink-0" />
  <div className="min-w-0">
    <h1 className="text-lg font-semibold truncate">Revision des Lecons</h1>
    <p className="text-xs text-muted-foreground hidden sm:block truncate">
      Revisez le contenu, ajoutez des videos YouTube et laissez des commentaires
    </p>
  </div>
</div>
```

### Review Grid Breakpoints

```tsx
// Before
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div className="lg:col-span-4 h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]">
  <div className="lg:col-span-8 space-y-4">

// After  
<div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
  <div className="md:col-span-5 lg:col-span-4 h-[calc(100vh-200px)]">
  <div className="md:col-span-7 lg:col-span-8 space-y-4">
```

### Responsive Action Buttons

```tsx
<Button onClick={() => setShowCreateMatiere(true)} size="sm">
  <Sparkles className="h-4 w-4 lg:mr-2" />
  <span className="hidden lg:inline">Creer une matiere (IA)</span>
</Button>
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ContentEditor.tsx` | Tab navigation, header, grid breakpoints, button labels, heights |

Only one file needs editing -- all layout issues are in ContentEditor.tsx.

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- purely CSS/layout changes |
| Works with existing data? | N/A |
| 3G performance impact? | None -- no new data or components |
| Backward compatible? | Yes -- same structure, better breakpoints |
| Edge cases? | Scrollable tabs handle any number of tabs gracefully |
