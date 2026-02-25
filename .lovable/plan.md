
# Fix: Voice Text Limit & RadialMindMapCluster Ref Warning

## Issue 1 — generate-jude-voice 400: text exceeds 500 chars

The "À Retenir" header speaker button joins all node texts with `.join('. ')`, which produces 600+ characters for this lesson. The edge function rejects anything over 500 chars with a 400 error.

**Fix:** Increase the max text length in `generate-jude-voice/index.ts` from 500 to 1000 characters. The "read all" button legitimately needs more than 500 chars for multi-node narration. ElevenLabs supports up to 5000 chars per request, so 1000 is safe.

**File:** `supabase/functions/generate-jude-voice/index.ts` (line 85)
- Change: `text.length > 500` to `text.length > 1000`
- Update error message accordingly

## Issue 2 — RadialMindMapCluster forwardRef warning

The `MathText` component (wrapped in `React.memo`) is rendered inside `RadialMindMapCluster`. The warning says "Check the render method of RadialMindMapCluster" -- but the actual problem is that `MindMapSectionCluster` and `RadialMindMapCluster` are plain function components rendered inside Radix `TabsContent` (which uses `Presence`). The `Presence` component tries to pass a ref down through the tree.

**Fix:** Wrap `RadialMindMapCluster` in `forwardRef` and attach `ref` to its root div.

**File:** `src/features/matieres/components/tabs/LessonStudygramTab.tsx` (lines 222-268)

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-jude-voice/index.ts` | Increase max text from 500 to 1000 chars |
| `src/features/matieres/components/tabs/LessonStudygramTab.tsx` | Wrap RadialMindMapCluster in forwardRef |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality unchanged? | Yes -- only raises a limit and adds ref forwarding |
| RLS / DB impact? | None |
| Bundle size? | No change |
| 3G safe? | Yes |
| Backward compatibility? | Yes |
