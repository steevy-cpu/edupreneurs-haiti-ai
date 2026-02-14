

# Fix: Visitor Music Not Playing -- Provider Ordering Bug

## Root Cause

The `MusicPlayerProvider` sits **above** `VisitorProvider` in the component tree (`AppProviders.tsx`):

```text
MusicPlayerProvider  <-- calls useVisitor() here
  VisitorProvider    <-- but VisitorContext is provided here (below)
```

When `useVisitor()` is called inside `MusicPlayerProvider`, the `VisitorContext` doesn't exist yet. The hook returns safe defaults with `isVisitor: false`. So the condition `isAuthenticated || isVisitor` never becomes true for visitors, and `fetchPlaylistTracks()` never runs. Tracks stay empty. Music never plays.

## Fix

**Swap the provider order** in `src/providers/AppProviders.tsx` so that `VisitorProvider` wraps `MusicPlayerProvider`:

```text
VisitorProvider          <-- provides isVisitor context
  MusicPlayerProvider    <-- can now read isVisitor correctly
```

### Change in `src/providers/AppProviders.tsx` (FeatureProviders function)

Current order (lines 85-93):
```typescript
<PresenceProvider>
  <MusicPlayerProvider>
    <VisitorProvider>
      <FirstTimeUserProvider>
        {children}
      </FirstTimeUserProvider>
    </VisitorProvider>
  </MusicPlayerProvider>
</PresenceProvider>
```

New order:
```typescript
<PresenceProvider>
  <VisitorProvider>
    <MusicPlayerProvider>
      <FirstTimeUserProvider>
        {children}
      </FirstTimeUserProvider>
    </MusicPlayerProvider>
  </VisitorProvider>
</PresenceProvider>
```

This is the only file that needs to change. The RLS policy and the `useVisitor` import from the previous fix are already correct -- they just couldn't work because of this ordering issue.

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- VisitorProvider has no dependency on MusicPlayerProvider |
| Works with existing data? | Yes -- no data changes |
| Other consumers of useVisitor? | Unaffected -- they are all below VisitorProvider in the tree |
| Other consumers of useMusicPlayer? | Unaffected -- they are all below MusicPlayerProvider in the tree |
| 3G optimized? | Yes -- no additional network requests |
| Backward compatible? | Yes -- same providers, just reordered |

