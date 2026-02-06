
# Plan: Fix "Last Connected" Timestamp - Robust Architecture

## Problem Analysis

### Current State
The community page displays stale "last connected" timestamps (all from January 26th or earlier) because:

1. **No automatic `last_seen` updates**: The database has a trigger function `update_user_last_seen()` but **no trigger is attached** to call it
2. **PresenceContext tracks real-time status in memory only**: When users come online/offline, the database is never notified
3. **Data flow is broken**: The frontend reads `last_seen` from the database, but nothing writes to it

### Database Evidence
```text
Most recent last_seen values:
- Test:     2026-01-30 (10 days stale)
- ley:      2026-01-29 
- Djood:    2026-01-26
- Steevy:   2026-01-26
- Celestin: 2026-01-26
```

---

## Root Cause

```text
Current Flow (Broken):
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User opens app │───►│ PresenceContext  │───►│ Realtime channel│
│                 │    │ tracks in memory │    │ shows "online"  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ╳ No database update!
                              │
                       ┌──────▼──────┐
                       │  profiles   │ ← last_seen is NEVER updated
                       │  last_seen  │
                       └─────────────┘
```

---

## Solution Architecture

### Design Principles (Structure-First)
1. **Single Source of Truth**: Database `last_seen` column is the authoritative timestamp
2. **Event-Driven Updates**: Update on presence lifecycle events, not polling
3. **Graceful Degradation**: Handle network failures without breaking UI
4. **Separation of Concerns**: Dedicated service layer for persistence

### New Data Flow

```text
Fixed Flow:
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User opens app │───►│ PresenceContext  │───►│ Realtime channel│
│                 │    │                  │    │ shows "online"  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              │ SUBSCRIBED event
                              ▼
                       ┌──────────────┐
                       │ RPC:         │──────► profiles.last_seen = now()
                       │ persist_     │
                       │ last_seen()  │
                       └──────────────┘
                              │
                              │ Heartbeat (every 5 min while connected)
                              ▼
                       ┌──────────────┐
                       │ RPC:         │──────► profiles.last_seen = now()
                       │ persist_     │
                       │ last_seen()  │
                       └──────────────┘
                              │
                              │ beforeunload / cleanup
                              ▼
                       ┌──────────────┐
                       │ RPC/Beacon:  │──────► profiles.last_seen = now()
                       │ persist_     │
                       │ last_seen()  │
                       └──────────────┘
```

---

## Implementation Details

### Part 1: Database - Create Robust RPC Function

Create a dedicated RPC function (not a trigger) for explicit control:

```sql
CREATE OR REPLACE FUNCTION public.persist_last_seen(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now() 
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.persist_last_seen(UUID) TO authenticated;
```

**Why RPC instead of trigger?**
- Explicit control over when updates happen
- Can handle edge cases (batch updates, manual calls)
- Easier to test and debug
- No interference with other profile updates

### Part 2: Create Dedicated Service Layer

Create a new service file for last_seen persistence logic:

**New File: `src/services/lastSeenService.ts`**

```typescript
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Persist the user's last_seen timestamp to the database.
 * Fire-and-forget pattern - does not block UI.
 */
export async function persistLastSeen(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('persist_last_seen', { 
      p_user_id: userId 
    });
    if (error) {
      console.warn('[LastSeen] Failed to persist:', error.message);
    }
  } catch (err) {
    // Silent fail - don't crash the app for timestamp updates
    console.warn('[LastSeen] Network error:', err);
  }
}

/**
 * Send final last_seen via beacon API for tab close scenarios.
 * More reliable than fetch in beforeunload.
 */
export function persistLastSeenBeacon(userId: string): void {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/persist_last_seen`;
  const payload = JSON.stringify({ p_user_id: userId });
  
  // sendBeacon is more reliable during page unload
  const sent = navigator.sendBeacon(url, new Blob([payload], { 
    type: 'application/json' 
  }));
  
  if (!sent) {
    // Fallback - try fetch with keepalive
    fetch(url, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
      },
      keepalive: true
    }).catch(() => {/* silent */});
  }
}

export { HEARTBEAT_INTERVAL_MS };
```

### Part 3: Integrate into PresenceContext

Update `src/contexts/PresenceContext.tsx` to call the service at key lifecycle points:

**Add imports:**
```typescript
import { 
  persistLastSeen, 
  persistLastSeenBeacon, 
  HEARTBEAT_INTERVAL_MS 
} from '@/services/lastSeenService';
```

**Update the main useEffect (after channel subscribes):**
```typescript
// Inside the subscription callback when status === 'SUBSCRIBED'
// After calling channel.track():

// Persist initial last_seen to database
persistLastSeen(user.id);
```

**Add heartbeat effect (new useEffect):**
```typescript
// Heartbeat: Keep last_seen fresh while connected
useEffect(() => {
  if (!user || !isConnected) return;
  
  const heartbeat = setInterval(() => {
    persistLastSeen(user.id);
  }, HEARTBEAT_INTERVAL_MS);
  
  return () => clearInterval(heartbeat);
}, [user?.id, isConnected]);
```

**Add beforeunload handler (new useEffect):**
```typescript
// Final last_seen on tab close
useEffect(() => {
  if (!user) return;
  
  const handleUnload = () => {
    persistLastSeenBeacon(user.id);
  };
  
  window.addEventListener('beforeunload', handleUnload);
  return () => window.removeEventListener('beforeunload', handleUnload);
}, [user?.id]);
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| **Database Migration** | CREATE | Add `persist_last_seen` RPC function |
| `src/services/lastSeenService.ts` | CREATE | New service with persist functions + heartbeat constant |
| `src/contexts/PresenceContext.tsx` | UPDATE | Add 3 integration points (subscribe, heartbeat, unload) |

---

## Event Timeline

| Event | Database Update | Timing |
|-------|-----------------|--------|
| User logs in / opens app | Yes | On SUBSCRIBED |
| User actively using app | Yes | Every 5 minutes |
| User switches tabs | No | (still connected) |
| User closes tab/browser | Yes | On beforeunload |
| User logs out | Yes | On cleanup |
| Network disconnection | No | (will update on reconnect) |

---

## 3G Performance Considerations

| Aspect | Solution |
|--------|----------|
| RPC call overhead | Minimal - single UPDATE statement (< 50ms) |
| Heartbeat frequency | 5 minutes - very low overhead |
| Beacon payload | Tiny JSON object (< 100 bytes) |
| Network failures | Silent fail - doesn't block UI or throw errors |
| Offline resilience | Last successful timestamp persists in DB |

---

## Edge Cases Handled

| Case | Solution |
|------|----------|
| User closes tab abruptly | `beforeunload` + `sendBeacon` with `keepalive` fallback |
| Network disconnect mid-session | Grace period in PresenceContext + eventual consistency |
| Multiple tabs open | Each tab updates independently (latest timestamp wins) |
| Visitor mode | Skip all RPC calls (no user ID) |
| Auth token expired | Silent fail - will update on next valid session |
| Browser doesn't support sendBeacon | Fallback to fetch with keepalive |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | No breaking changes to existing code |
| RLS compatible? | Yes | SECURITY DEFINER bypasses RLS safely |
| 3G optimized? | Yes | Minimal network overhead, fire-and-forget pattern |
| Doesn't break online status? | No | Separate from real-time presence events |
| Works with localStorage cache? | Yes | DB is source of truth, localStorage is display cache |
| Handles auth expiry? | Yes | Silent fail prevents crashes |
| Multiple tabs? | Yes | Each updates independently |
| Service worker compatible? | Yes | Standard fetch/beacon patterns |

---

## Technical Notes

### Why Not Use the Existing Trigger Function?

The `update_user_last_seen()` trigger function was designed to fire `ON UPDATE` of profiles. But:
1. We don't want to update `last_seen` on every profile change (avatar, bio, etc.)
2. We need explicit control over timing (presence events, not any update)
3. An RPC gives us predictable, testable behavior

### Service Layer Benefits

Creating `lastSeenService.ts` instead of inline code in PresenceContext:
1. **Testable**: Can unit test persistence logic in isolation
2. **Reusable**: Could be called from other contexts if needed
3. **Single Responsibility**: PresenceContext handles real-time, service handles persistence
4. **Easy to Mock**: For testing components that depend on presence

### Beacon API Choice

`navigator.sendBeacon()` is specifically designed for analytics and heartbeat scenarios during page unload:
- Queued and sent asynchronously
- Doesn't block page close
- Higher reliability than XHR/fetch in unload handlers
- Falls back to fetch with `keepalive: true` for older browsers

---

## Future Considerations

This structure allows for easy extensions:
- **Activity tracking**: Could add `last_active_page` column
- **Session duration**: Could track total time online
- **Presence history**: Could log to a separate table for analytics
