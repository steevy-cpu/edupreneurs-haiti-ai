
# Fix Plan: Points Cles Speaker, Studygram Per-Node Buttons, and Error Toast

## Summary

Three issues to fix in two files. The root causes are:
1. Points Cles speaker buttons show error icons due to ElevenLabs failures (not wrong text)
2. Studygram has redundant per-node speaker buttons causing concurrent request floods
3. The error toast is caused by the JudeFeedback ref warning and concurrent ElevenLabs rate limits

## Fix 1 -- Points Cles Speaker Button (LessonPointsClesTab.tsx)

**Finding:** The `narrationText` construction (`card.title + '. ' + card.content`) and `storageKey` are both correct. The broken speaker icons (VolumeX) are caused by ElevenLabs API failures (401/429), not wrong text.

**Action:** Hide the speaker button entirely when `isError` is true instead of showing a broken/disabled icon. This is cleaner UX -- if voice service is down, don't show a broken control.

```text
Current (line 107-111):
  if (isError) return (
    <button className="opacity-40 cursor-not-allowed p-2" disabled>
      <VolumeX ... />
    </button>
  );

Changed to:
  if (isError) return null;
```

## Fix 2 -- Studygram: Remove Per-Node Speaker Buttons (LessonStudygramTab.tsx)

**Action:** In `MindMapSectionCluster`, remove all individual per-node `JudeSpeakerButton` instances from the A Retenir section. Keep ONLY the single header "read all" button.

Changes in `MindMapSectionCluster` (lines 212-228):
- Remove the `isRetenir` conditional branch that wraps each node in a flex row with a speaker button
- All nodes (including A Retenir) now render with the standard `BranchNode` component
- The header "read all" button (lines 204-208) stays unchanged

This also eliminates the concurrent ElevenLabs request flood (7+ nodes each firing `autoPreload`) that caused the 429 rate limit errors and the error toast.

## Fix 3 -- JudeFeedback Ref Warning (JudeFeedback.tsx)

**Finding:** The console warning "Function components cannot be given refs" comes from `JudeFeedback` being rendered inside a Radix Tabs `TabsContent` that uses `Presence`, which tries to attach a ref.

**Action:** Wrap `JudeFeedback` with `React.forwardRef()` so the Radix Presence component can attach its ref without warnings.

## Files Modified

| File | Change |
|------|--------|
| `src/features/matieres/components/tabs/LessonPointsClesTab.tsx` | Hide speaker button on error (return null) |
| `src/features/matieres/components/tabs/LessonStudygramTab.tsx` | Remove per-node speaker buttons, keep header "read all" only |
| `src/components/jude/JudeFeedback.tsx` | Wrap with React.forwardRef() |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality unchanged when ElevenLabs works? | Yes -- only error path changes |
| RLS / DB impact? | None |
| Bundle size? | No change (removing code) |
| 3G safe? | Yes -- fewer concurrent requests improves performance |
| Provider stack / AppShell? | Not affected |
| Backward compatibility? | Yes -- cached audio still plays |
