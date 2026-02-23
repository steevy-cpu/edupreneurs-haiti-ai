

# Realtime Plan B — Global 3G Reconnection UI and Auto-Recovery

## Overview
Four changes to give Haitian students on unstable 3G connections visible feedback when realtime drops and automatic recovery when it comes back.

---

## Fix 1 — Create `src/hooks/useRealtimeConnection.ts`

New hook that monitors the Supabase realtime WebSocket transport state.

**Approach:** Use `supabase.realtime` to listen for transport-level connection/disconnection events. Supabase's `RealtimeClient` exposes `onOpen`, `onClose`, and `onError` callbacks on the underlying transport, but a simpler approach is to poll `supabase.realtime.connectionState()` (returns `'connecting'`, `'open'`, `'closing'`, `'closed'`) on a short interval (~2s), since the Supabase JS client doesn't expose a clean event emitter for global connection changes.

**State machine:**
- `connected` — `connectionState() === 'open'`
- `disconnected` — `connectionState()` is `'closed'` or `'closing'` AND grace period (3s) has elapsed
- `reconnecting` — `connectionState() === 'connecting'` after having been disconnected

**Grace period logic:**
- On detecting non-`open` state: start a 3-second timer before transitioning to `disconnected`
- If connection returns to `open` within 3s: cancel timer, stay `connected`
- On reconnect (back to `open` after `disconnected`): set state to `connected`, auto-hide after 2s

**Exports:** `{ connectionState, isDisconnected, isReconnecting }`

**Polling interval:** 2000ms — lightweight (no network calls, just reading local WebSocket readyState)

---

## Fix 2 — Create `src/components/shared/ConnectionStatusBanner.tsx`

New component rendering a fixed-position banner at the bottom of the viewport.

**Behavior:**
- Only renders when `connectionState` is `disconnected` or `reconnecting`
- Shows briefly in `connected` state after recovering (2s green flash)
- Positioned `fixed bottom-16 lg:bottom-0` to sit above mobile bottom nav
- z-index below modals but above page content (`z-[999]`)

**Visual states:**
| State | Background | Icon | Text |
|-------|-----------|------|------|
| `disconnected` | `bg-amber-500` | `WifiOff` | "Connexion perdue. Reconnexion en cours..." + spinner |
| `reconnecting` | `bg-amber-500` | `WifiOff` | "Connexion perdue. Reconnexion en cours..." + spinner |
| `connected` (recovering) | `bg-green-500` | `CheckCircle` | "Connexion rétablie!" |

**Animation:** Framer Motion `AnimatePresence` with slide-up/down (`y: 100` to `y: 0`).

**Size:** Compact `py-2 px-4`, white text, does not push content — pure overlay.

---

## Fix 3 — Mount in AppShell

In `src/shell/AppShell.tsx`, add `<ConnectionStatusBanner />` after `<FloatingLayer />` (line 269), inside the `<div className="min-h-screen">` block. Single import + single JSX line.

---

## Fix 4 — PresenceContext retry on CHANNEL_ERROR

In `src/contexts/PresenceContext.tsx`, enhance the `CHANNEL_ERROR` handler at line 196-198.

**Current behavior:**
```typescript
} else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
  setIsConnected(false);
}
```

**New behavior:**
- Add a `retryCountRef = useRef(0)` and `retryTimerRef = useRef<NodeJS.Timeout>(null)`
- On `CHANNEL_ERROR`: set `isConnected = false`, then schedule a retry
- Retry logic: remove old channel, create + subscribe a new one
- Backoff: attempt 1 after 2s, attempt 2 after 4s, attempt 3 after 8s
- After 3 failed attempts: stop retrying, leave `isConnected = false`
- On `SUBSCRIBED`: reset `retryCountRef` to 0
- Cleanup: clear `retryTimerRef` in the useEffect cleanup function
- `CLOSED` status does NOT retry (that's intentional cleanup)

**Implementation detail:** Extract the channel creation + subscription into a `setupChannel()` function inside the useEffect, so it can be called both on initial mount and on retry. The retry calls `supabase.removeChannel(channelRef.current)` before creating a new channel.

---

## Files Modified

| File | Type | Change |
|------|------|--------|
| `src/hooks/useRealtimeConnection.ts` | New | Connection state hook polling `supabase.realtime` |
| `src/components/shared/ConnectionStatusBanner.tsx` | New | Fixed-position reconnection banner |
| `src/shell/AppShell.tsx` | Edit | Import + render `ConnectionStatusBanner` (2 lines) |
| `src/contexts/PresenceContext.tsx` | Edit | Add retry logic to `CHANNEL_ERROR` handler |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality preserved | Yes — only adds new behavior on error path |
| Provider stack order unchanged | Yes |
| No schema changes | Correct |
| No new dependencies | Correct — uses existing Framer Motion + Lucide icons |
| Works on 3G | Yes — this IS the 3G fix |
| Bundle impact | Minimal — two small new files |
| Cleanup logic correct | Yes — timers and channels cleaned up on unmount |
| Backward compatible | Yes |

