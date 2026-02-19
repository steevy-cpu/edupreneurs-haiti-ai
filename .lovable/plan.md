
## Révision Plan A — Wiring the Three Dead Components

### What This Plan Touches

Three files are modified. Nothing else is touched.

| File | Change |
|---|---|
| `src/components/content-editor/VersionHistory.tsx` | Fix compareVersions crash + add restore disclosure note |
| `src/components/content-editor/WorkflowManagement.tsx` | Add `rejected` step to timeline |
| `src/pages/ContentEditor.tsx` | Import all three components + render revision panel in the right column |

No DB migrations. No edge function changes. No other component files touched.

---

### Fix 1 — VersionHistory.tsx: compareVersions crash + disclosure note

**The crash (line 110–132):**

The current guard at line 110 is:
```tsx
{index < versions.length - 1 && (
```

This hides the "Voir les changements" button for the **oldest** version (last in the DESC-ordered array, `index === versions.length - 1`). But the **newest** version (`index === 0`) has no guard, and `versions[index - 1]` = `versions[-1]` = `undefined`. Clicking "Voir les changements" at index 0 calls `compareVersions(version, undefined)` which crashes on `undefined.title`.

**The fix:** Change the guard from `index < versions.length - 1` to `index > 0 && index < versions.length - 1`. This means the "Voir les changements" button only appears for versions that have both a newer version above them (index > 0) and an older version to compare against (index < versions.length - 1).

Wait — re-examining the logic. Versions are DESC. `versions[0]` is the newest (`is_current = true`). `versions[index - 1]` is the version NEWER than the current row. The button label says "Différences avec la version {version.version_number + 1}" — comparing to the next-newer version. So the comparison is: current card's version vs. the card one step newer (lower index). For `index === 0` there is no newer version — `versions[-1]` is `undefined`. For `index === versions.length - 1` (the oldest) there is a newer version at `index - 1`. The existing guard `index < versions.length - 1` is WRONG — it should be `index > 0` (show button for all versions except the newest, since only the newest has no version above it to compare to). The label is also consistent: `version.version_number + 1` is the newer version number.

Correct guard: `{index > 0 && (` — show "Voir les changements" for every version except the newest (index 0), since every other version has a version above it to compare against.

**The disclosure note:** Add below the Restaurer button (inside `{!version.is_current && (...)}`), after the button closing tag. It uses a `<p>` with `text-xs text-muted-foreground mt-1` to keep it visually subordinate:

```tsx
<p className="text-xs text-muted-foreground mt-1 leading-snug">
  La restauration remet en place le titre, l'objectif, l'introduction, le contenu et les exemples. Le quiz, les activités, et le statut de publication ne sont pas affectés.
</p>
```

**Exact change in VersionHistory.tsx:**

Line 84–93 (the Restaurer button block):
```tsx
{!version.is_current && (
  <div className="flex flex-col gap-1">
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleRestore(version.id)}
    >
      <RotateCcw className="mr-2 h-3 w-3" />
      Restaurer
    </Button>
    {/* Partial-restore disclosure — version snapshot only covers text fields */}
    <p className="text-xs text-muted-foreground leading-snug">
      La restauration remet en place le titre, l'objectif, l'introduction, le contenu et les exemples. Le quiz, les activités, et le statut de publication ne sont pas affectés.
    </p>
  </div>
)}
```

Line 110: change `index < versions.length - 1` → `index > 0`.

---

### Fix 2 — WorkflowManagement.tsx: Add `rejected` step to timeline

**The current timeline (lines 237–254):** Four dots — Brouillon, En révision, Approuvé, Publié. No `rejected` step. A lesson with `workflow_status = 'rejected'` falls through all conditions and all four dots show `bg-muted`. The user sees a blank timeline with no highlighted dot.

**The fix:** Add a `rejected` step between En révision and Approuvé. Style it distinctly: when `currentStatus === 'rejected'`, use `bg-destructive` (red) for this dot and dim all other dots. The label should say "Rejeté" in `text-destructive` when active to make clear it is not a progression step.

**Exact replacement for the timeline section (lines 237–254):**

```tsx
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${currentStatus === 'draft' ? 'bg-primary' : 'bg-muted'}`} />
    <span className="text-sm">Brouillon</span>
  </div>
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${currentStatus === 'in_review' ? 'bg-primary' : 'bg-muted'}`} />
    <span className="text-sm">En révision</span>
  </div>
  {/* Rejected is a dead-end state — shown in red, not a normal progression step */}
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${currentStatus === 'rejected' ? 'bg-destructive' : 'bg-muted'}`} />
    <span className={`text-sm ${currentStatus === 'rejected' ? 'text-destructive font-medium' : ''}`}>
      Rejeté
    </span>
  </div>
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${currentStatus === 'approved' ? 'bg-primary' : 'bg-muted'}`} />
    <span className="text-sm">Approuvé</span>
  </div>
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${currentStatus === 'published' ? 'bg-primary' : 'bg-muted'}`} />
    <span className="text-sm">Publié</span>
  </div>
</div>
```

For a published lesson (the current state of all 2,832 lessons), the "Publié" dot is `bg-primary`, "Rejeté" is `bg-muted` — clean and correct.

---

### Fix 3 — ContentEditor.tsx: Import and render the revision panel

**Three imports to add** at the top of `ContentEditor.tsx` (after the existing content-editor imports, lines 10–27):

```tsx
import { WorkflowManagement } from "@/components/content-editor/WorkflowManagement";
import { VersionHistory } from "@/components/content-editor/VersionHistory";
import { ChangeLog } from "@/components/content-editor/ChangeLog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
```

`GitBranch`, `History` icons are already in their respective component files — not needed in ContentEditor.

**The revision panel — where it goes:**

Inside the right column of TabsContent[review] (lines 341–410), after the `LessonComments` block (after line 408, before the closing `</div>` of the right column at line 410):

```tsx
{/* Revision Panel — shown only when a lesson is selected */}
{selectedLesson && (
  <Accordion type="multiple" defaultValue={["workflow"]} className="space-y-0">
    {/* Workflow section — open by default, most actionable */}
    <AccordionItem value="workflow" className="border rounded-lg px-0 mb-2">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <span className="flex items-center gap-2 font-semibold text-sm">
          Workflow
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <WorkflowManagement
          selectedLesson={selectedLesson}
          onUpdate={refreshLesson}
        />
      </AccordionContent>
    </AccordionItem>

    {/* Version history section */}
    <AccordionItem value="versions" className="border rounded-lg px-0 mb-2">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <span className="flex items-center gap-2 font-semibold text-sm">
          Historique des versions
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <VersionHistory
          selectedLesson={selectedLesson}
          onRestore={refreshLesson}
        />
      </AccordionContent>
    </AccordionItem>

    {/* Change log section */}
    <AccordionItem value="changelog" className="border rounded-lg px-0">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <span className="flex items-center gap-2 font-semibold text-sm">
          Journal des modifications
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <ChangeLog selectedLesson={selectedLesson} />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)}
```

**Key decisions:**
- `type="multiple"` — all three sections can be expanded simultaneously and independently.
- `defaultValue={["workflow"]}` — Workflow is open by default; the other two are collapsed.
- The entire `Accordion` block is gated with `{selectedLesson && ...}` — nothing renders when no lesson is selected.
- `onUpdate={refreshLesson}` passed to `WorkflowManagement` — when an admin changes workflow state, `refreshLesson` re-fetches the lesson from the DB and calls `setSelectedLesson(data)`, which updates all components receiving `selectedLesson` as a prop.
- `onRestore={refreshLesson}` passed to `VersionHistory` — same pattern; after a restore the lesson state in DB has changed, `refreshLesson` syncs it.
- `WorkflowManagement` already has a `!selectedLesson` guard at line 112 that renders a placeholder card — but since the panel itself is already gated on `selectedLesson`, this guard is never reached from inside the panel. It remains as defensive code.
- `ChangeLog` and `VersionHistory` have similar guards — also never reached in this context but harmless.

**Prop compatibility check:**
- `WorkflowManagement`: expects `{ selectedLesson: any; onUpdate: () => void }` — `refreshLesson` is `() => Promise<void>` which is assignable to `() => void`. ✓
- `VersionHistory`: expects `{ selectedLesson: any; onRestore: () => void }` — same. ✓
- `ChangeLog`: expects `{ selectedLesson: any }` — direct pass. ✓

**ScrollArea heights inside collapsed accordion:** Both `VersionHistory` and `ChangeLog` render a `ScrollArea` with `h-[600px]`. Inside a collapsed `AccordionContent` these don't exist in the DOM (Radix animates out but the content is still rendered hidden). When expanded, the full 600px ScrollArea appears. This is the correct UX — the accordion collapse gives the user control over vertical space. No height adjustment needed.

---

### What the user sees after this plan

**Before selecting a lesson:** The right column shows only the existing tools (CurriculumAnalyzer, SingleLessonGenerator, LessonValidationPanel, LessonImageManager, LessonPreview, YouTubeManager, LessonComments). No revision panel.

**After selecting a lesson:** Below LessonComments, a three-section Accordion appears:
- "Workflow" — expanded by default, shows WorkflowManagement card with current status badge, review notes textarea, action buttons (role-gated), and the five-dot timeline (Brouillon → En révision → Rejeté → Approuvé → Publié).
- "Historique des versions" — collapsed by default, click to expand VersionHistory with its ScrollArea of version cards and "Restaurer" buttons with disclosure note.
- "Journal des modifications" — collapsed by default, click to expand ChangeLog with its realtime-subscribed change list.

**For all 2,832 existing lessons (workflow_status = 'published'):** WorkflowManagement renders correctly — "Publié" badge, no action buttons (no transitions from published are defined), five-dot timeline with the rightmost dot highlighted. No broken UI.

---

### Safety Verification

| Check | Status |
|---|---|
| Revision panel only appears when a lesson is selected | Yes — the entire `{selectedLesson && <Accordion ...>}` block is conditional. When `selectedLesson` is null the panel does not render. |
| compareVersions crash is fixed | Yes — guard changed from `index < versions.length - 1` to `index > 0`. The "Voir les changements" button no longer renders for `index === 0` (the newest version), which was the only path to `versions[-1]` being `undefined`. |
| Existing lessons (all `published`) show correctly in the workflow timeline | Yes — `currentStatus === 'published'` matches the last dot (`bg-primary`). All other four dots including "Rejeté" are `bg-muted`. No action buttons render for `published` status. |
| `rejected` status has visible, distinct representation | Yes — the new "Rejeté" dot uses `bg-destructive` (red) and its label gets `text-destructive font-medium` when `currentStatus === 'rejected'`. For all other statuses the dot is `bg-muted` and the label is unstyled. |
| Three components render without errors when a lesson is selected | Yes — all three receive the correct `selectedLesson` object (the full lesson row with joined subjects from the DB fetch in `onSelectLesson`). `refreshLesson` is a stable function reference (defined at module level in ContentEditor, not inside a render). |
| WorkflowManagement `onUpdate` triggers correct lesson refresh | Yes — `onUpdate={refreshLesson}` calls `refreshLesson` which re-fetches `lessons.*, subjects(id, name)` from the DB and calls `setSelectedLesson(data)`. All components receiving `selectedLesson` as a prop re-render with the updated data. |
| VersionHistory `onRestore` triggers correct lesson refresh | Yes — same `refreshLesson`. After a restore the DB content for `title`, `objectif`, `introduction`, `contenu`, `exemples_exercices` changes, and `refreshLesson` syncs those back to `selectedLesson` state. |
| Accordion `defaultValue={["workflow"]}` is correct for `type="multiple"` | Yes — Radix Accordion `type="multiple"` accepts `defaultValue` as a `string[]`. Passing `["workflow"]` opens only the Workflow item on first render. ✓ |
| Accordion `type="multiple"` allows independent expand/collapse of all three sections | Yes — this is exactly the behavior of `type="multiple"` vs `type="single"`. Users can have all three open, all closed, or any combination. |
| No new dependencies added | Yes — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` are imported from `@/components/ui/accordion` which already exists and uses `@radix-ui/react-accordion` (already installed). |
| AppShell, Provider Stack, other tabs unaffected | Yes — all changes are scoped to three files. No global context, no routes, no other tabs modified. |
