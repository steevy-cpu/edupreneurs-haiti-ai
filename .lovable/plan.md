
# Fix Online Indicator - Presence Tracking Missing

## Problem Identified

The online indicator on the community page is not working because **user presence is never being tracked**.

### Current Flow (Broken)
1. `PresenceContext` tries to find an existing `online-users` channel created by "AppShell"
2. `AppShell.tsx` does NOT create this channel (only message/notification channels exist)
3. `PresenceContext` falls back to creating `presence-context-listener` - but this only LISTENS for presence, it doesn't TRACK the current user
4. Result: `onlineUserIds` only contains Jude's ID (hardcoded as always online)

### Evidence
- `PresenceContext.tsx` line 141-147: Tries to find `online-users` channel that doesn't exist
- `AppShell.tsx`: No `online-users` channel creation or `track()` call
- `PresenceContext.tsx` line 164: Falls back to listener-only channel

---

## Solution

Modify `PresenceProvider` to be **self-contained**:
1. Create the `online-users` presence channel directly (instead of searching for it)
2. Track the current user's presence when authenticated
3. Listen for join/leave/sync events to update online users list
4. Handle cleanup properly on unmount

---

## Implementation

### File: `src/contexts/PresenceContext.tsx`

**Changes:**

1. **Create channel directly** instead of searching for one:
```typescript
// Create the global presence channel
const channel = supabase.channel('online-users', {
  config: { presence: { key: userId } }
});
```

2. **Track current user** when authenticated:
```typescript
channel.subscribe(async (status) => {
  if (status === 'SUBSCRIBED' && user) {
    await channel.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
    });
  }
});
```

3. **Listen for presence events**:
```typescript
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    handleSync(state);
  })
  .on('presence', { event: 'join' }, ({ key }) => {
    handleUserOnline(key);
  })
  .on('presence', { event: 'leave' }, ({ key }) => {
    handleUserOffline(key);
  });
```

4. **Add user dependency** to useEffect to re-track when user changes (login/logout)

5. **Remove polling fallback** (no longer needed with direct channel ownership)

---

## Technical Details

### Before (Broken)
```text
PresenceProvider
    |
    | Searches for 'online-users' channel (NOT FOUND)
    v
Creates 'presence-context-listener' (LISTEN ONLY, NO TRACK)
    |
    v
onlineUserIds = { Jude } (only hardcoded value)
```

### After (Fixed)
```text
PresenceProvider
    |
    | Creates 'online-users' channel with presence key
    v
channel.track({ user_id, online_at })
    |
    | Listens for sync/join/leave events
    v
onlineUserIds = { Jude, user1, user2, ... } (real-time data)
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/contexts/PresenceContext.tsx` | Update to create and track presence directly |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - replaces broken passive listener with active tracker |
| Works with existing data? | N/A - no database changes |
| 3G optimized? | Yes - presence uses WebSocket, no polling needed |
| Backward compatible? | Yes - same hooks, same API |
| Edge cases handled? | Yes - visitor mode, auth changes, cleanup |

---

## Key Code Changes

### New useEffect in PresenceProvider:

```typescript
useEffect(() => {
  // Skip for visitors or unauthenticated users
  if (!user) return;
  
  const channel = supabase.channel('online-users', {
    config: { presence: { key: user.id } }
  });
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      handleSync(state);
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      if (key) handleUserOnline(key);
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      if (key) handleUserOffline(key);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        // Track current user's presence
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      } else if (status === 'CLOSED') {
        setIsConnected(false);
      }
    });
  
  channelRef.current = channel;
  
  return () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
}, [user?.id, handleSync, handleUserOnline, handleUserOffline]);
```

This makes the `PresenceProvider` self-contained and properly tracks all users' online status.
