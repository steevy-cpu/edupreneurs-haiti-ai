

# Chess Mode Selection Dialog

## Problem
When users click "Jouer" on the chess game card in the Games Hub, they go directly to the AI game (`/chess-game`). To play multiplayer, they must first load the solo page and then switch tabs. This creates an extra step and can be confusing.

## Solution
Create a **modal dialog** that intercepts the "Jouer" click for chess and asks users to choose:
1. **Jouer avec Jude** (Solo AI) - navigates to `/chess-game`
2. **Défier un ami** (Multiplayer) - navigates to `/chess-multiplayer`

This follows the existing pattern used in `VisitorTypeSelector` and `BattleModeSelector`.

---

## Implementation

### 1. Create New Component: `ChessModeSelector.tsx`

**File:** `src/components/chess/ChessModeSelector.tsx`

A dialog component that shows two options:

```text
+------------------------------------------------+
|                  Jouer aux Échecs              |
|  Comment veux-tu jouer ?                       |
+------------------------------------------------+
|                                                |
|  +------------------+  +------------------+    |
|  | [Jude Avatar]    |  | [Users Icon]     |    |
|  | Jouer avec Jude  |  | Défier un ami    |    |
|  | Partie contre    |  | Invite un ami    |    |
|  | l'IA coach       |  | ou trouve un     |    |
|  |                  |  | adversaire       |    |
|  +------------------+  +------------------+    |
|                                                |
+------------------------------------------------+
```

**Key Features:**
- Uses the existing `Dialog` component from `@/components/ui/dialog`
- Two clickable cards with icons and descriptions
- Visual feedback on hover (like `BattleModeSelector` pattern)
- Closes on selection and navigates to the appropriate route

---

### 2. Modify `GamesHub.tsx`

**File:** `src/pages/GamesHub.tsx`

**Changes:**
1. Add state for dialog open/close: `const [showChessModeDialog, setShowChessModeDialog] = useState(false)`
2. Modify `handlePlay` to check if the game is chess and has multiple modes - if so, show the dialog instead of navigating directly
3. Import and render `ChessModeSelector` component

```typescript
// Modified handlePlay
const handlePlay = useCallback((game: Game) => {
  if (game.id === 'chess' && game.modes.length > 1) {
    setShowChessModeDialog(true);
    return;
  }
  navigate(game.path);
}, [navigate]);
```

---

### 3. Component Structure

**`ChessModeSelector.tsx` Details:**

```tsx
interface ChessModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSolo: () => void;
  onSelectMultiplayer: () => void;
}

const ChessModeSelector = ({ isOpen, onClose, onSelectSolo, onSelectMultiplayer }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Jouer aux Échecs</DialogTitle>
          <DialogDescription>Comment veux-tu jouer ?</DialogDescription>
        </DialogHeader>
        
        {/* Two selection cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Jude (Solo) Card */}
          <button onClick={onSelectSolo} className="...">
            <Crown icon />
            <h4>Jouer avec Jude</h4>
            <p>Partie contre l'IA coach</p>
          </button>
          
          {/* Multiplayer Card */}
          <button onClick={onSelectMultiplayer} className="...">
            <Users icon />
            <h4>Défier un ami</h4>
            <p>Invite ou trouve un adversaire</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/chess/ChessModeSelector.tsx` | Create new dialog component |
| `src/pages/GamesHub.tsx` | Add dialog state and conditional logic for chess |

---

## User Flow After Implementation

```text
Games Hub
    |
    | Click "Jouer" on Chess card
    v
+--------------------+
| Mode Selection     |
| Dialog             |
+--------------------+
    |         |
    |         |
    v         v
/chess-game   /chess-multiplayer
(Jude AI)     (Lobby)
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - just adds an intermediary step |
| Works with existing data? | N/A - no database changes |
| 3G optimized? | Yes - dialog is lightweight, no additional network calls |
| Backward compatible? | Yes - other games still navigate directly |
| Mobile friendly? | Yes - dialog adapts to screen size |

---

## Technical Notes

- The dialog uses the existing `Dialog` component already imported in the codebase
- Visual styling follows the `BattleModeSelector` pattern for consistency
- The `gamesConfig.ts` already defines `modes: ['solo', 'multiplayer']` for chess, which we use to determine if the dialog should appear
- For visitors, the multiplayer option can show a lock icon or redirect to login (following existing patterns in `ChessGame.tsx`)

