

# Fix: JudeChatbot Typewriter Animation Restarting on Keystroke

## Problem

Every time you type in the JudeChatbot input, the typewriter animation for Jude's response restarts from the beginning. This is the same bug that was previously fixed in the HomeChatbot.

## Root Cause

The `TypewriterText` component inside `JudeChatbot.tsx` (line 74) includes `onComplete` in its `useEffect` dependency array. Each keystroke triggers a re-render, creating a new `onComplete` function reference, which restarts the entire animation.

## Fix

Apply the same `useRef` pattern already used in `HomeChatbot.tsx`:

1. Store `onComplete` in a `useRef` so it doesn't trigger re-renders
2. Remove `onComplete` from the `useEffect` dependency array
3. Call `onCompleteRef.current?.()` instead of `onComplete?.()`

### File: `src/components/JudeChatbot.tsx`

**Before** (lines 44-82):
```typescript
const TypewriterText = ({ text, speed = 15, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        onComplete?.();          // <-- stale closure risk
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);  // <-- onComplete causes restart
  // ...
};
```

**After:**
```typescript
const TypewriterText = ({ text, speed = 15, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        onCompleteRef.current?.();  // <-- always fresh
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);  // <-- onComplete removed
  // ...
};
```

## Other Components Checked

| Component | File | Status |
|-----------|------|--------|
| HomeChatbot TypewriterText | `src/components/HomeChatbot.tsx` | Already fixed (uses `onCompleteRef`) |
| MessageTypewriter | `src/components/community/MessageTypewriter.tsx` | Already fixed (uses `onCompleteRef`) |
| SimpleTypewriter | `src/components/visitor/SimpleTypewriter.tsx` | No issue (no parent re-render during typing) |
| TypewriterText (auth) | `src/components/TypewriterText.tsx` | No issue (phrase cycler, no `onComplete`) |
| **JudeChatbot TypewriterText** | **`src/components/JudeChatbot.tsx`** | **BUG -- needs fix** |

Only the JudeChatbot has this issue. One file, one change.

## Safety

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- identical pattern to HomeChatbot fix |
| Backward compatible? | Yes -- same behavior, just stable refs |
| 3G optimized? | Yes -- no extra work, prevents wasted re-renders |
| Edge cases? | Handles unmount (clearInterval in cleanup) |

