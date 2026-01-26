

# Integrate Chat into Opponent Card

## Problem
There's a duplication issue: the opponent's avatar and name appear twice - once in the `FloatingMatchChat` component and once in the Opponent Info `Card`. This creates visual clutter.

## Solution
Remove the separate `FloatingMatchChat` toggle button and integrate the chat functionality directly into the existing opponent info card:
- Make the opponent section clickable to open chat
- Add a chat icon with unread badge next to the opponent's name
- Show last message preview below the opponent card when there are unread messages
- Keep the full-screen chat panel for when the user clicks

---

## Implementation

### File: `src/pages/ChessMultiplayerGame.tsx`

**Remove** the `FloatingMatchChat` component entirely from the layout (lines 595-604).

**Replace** the opponent info `Card` (lines 607-637) with an interactive version:

```tsx
{/* Opponent Info - Clickable to open chat */}
<Card 
  className="p-2 sm:p-3 cursor-pointer hover:bg-accent/50 transition-colors"
  onClick={() => setShowChat(true)}
>
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
        <AvatarImage src={getAvatarUrl(opponent?.avatar_url || null)} />
        <AvatarFallback className="text-sm">
          {opponent?.nickname?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-sm sm:text-base truncate">
            {opponent?.nickname || 'Adversaire'}
          </p>
          {/* Chat icon with unread badge */}
          <div className="relative shrink-0">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {myColor === 'w' ? 'Noirs' : 'Blancs'}
        </p>
      </div>
    </div>
    
    {/* Timer stays the same */}
    {match.time_control !== 'untimed' && (
      <div className={cn(...)}>
        {formatTime(...)}
      </div>
    )}
  </div>
  
  {/* Last message preview - appears when there are unread messages */}
  {unreadCount > 0 && lastOpponentMessage && (
    <div className="mt-2 pt-2 border-t">
      <p className="text-sm text-muted-foreground line-clamp-1">
        {lastOpponentMessage.message}
      </p>
    </div>
  )}
</Card>
```

**Add** the `lastOpponentMessage` variable (before the return statement):
```tsx
const lastOpponentMessage = chatMessages.filter(m => m.sender_id !== userId).slice(-1)[0];
```

**Keep** the expanded chat panel from `FloatingMatchChat` but move it inline (or create a simpler `ChatPanel` component):
```tsx
{/* Full-screen Chat Panel */}
{showChat && (
  <div className="fixed inset-4 sm:inset-8 z-50 bg-card/95 backdrop-blur-md border rounded-2xl shadow-xl flex flex-col animate-scale-in overflow-hidden">
    {/* ... same chat panel content as FloatingMatchChat ... */}
  </div>
)}
```

---

### File: `src/components/chess/FloatingMatchChat.tsx`

**Option A (Recommended)**: Refactor to only export the chat panel (without the toggle button):

```tsx
interface MatchChatPanelProps {
  messages: ChatMessage[];
  userId: string | null;
  opponent: PlayerInfo | null;
  userProfile: { nickname: string; avatar_url: string | null } | null;
  onSendMessage: (message: string) => Promise<void>;
  onClose: () => void;
}

// Rename component to MatchChatPanel
// Remove the toggle button code (lines 75-100)
// Remove the last message bubble code (lines 102-114)
// Keep only the expanded chat panel (lines 116-242)
// Replace onToggle with onClose
```

**Option B**: Keep the file as-is and just move the chat panel JSX inline in the game page (simpler, less abstraction).

---

## Updated Structure

| Before | After |
|--------|-------|
| FloatingMatchChat (avatar + name + icon) | Removed |
| Opponent Card (avatar + name + timer) | Opponent Card (avatar + name + chat icon + timer + message preview) |
| Separate chat toggle button | Click anywhere on opponent card to open chat |

---

## Visual Flow

```text
+------------------------------------------+
| [Avatar] Celestin  [💬 2]       [05:00]  |
|          Noirs                           |
| ---------------------------------------- |
| "Bien joué!" (last message preview)      |
+------------------------------------------+
           |
           | (click anywhere on card)
           v
+------------------------------------------+
|          FULL SCREEN CHAT PANEL          |
| [Avatar] Celestin        [X close]       |
| ---------------------------------------- |
| Messages...                              |
| Quick replies...                         |
| Input field...                           |
+------------------------------------------+
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/ChessMultiplayerGame.tsx` | Remove FloatingMatchChat usage, enhance opponent Card with chat integration |
| `src/components/chess/FloatingMatchChat.tsx` | Refactor to `MatchChatPanel` (panel-only) or delete if inlining |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - chat still works, just different trigger |
| Eliminates duplication? | Yes - single opponent info display |
| Mobile friendly? | Yes - card tap opens chat |
| Unread indicator visible? | Yes - badge on chat icon |
| Sound notification still works? | Yes - unchanged |

