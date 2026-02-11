

# Fix: Typewriter Animation Restarts on User Input

## Root Cause

In `TypewriterText` (line 47), the `useEffect` that drives the animation depends on `[text, speed, onComplete]`. The `onComplete` prop is an **inline arrow function** passed on line 208:

```tsx
onComplete={() => setTypingMessageIndex(null)}
```

Every keystroke in the input causes `HomeChatbot` to re-render (because `input` state changes), which creates a **new function reference** for `onComplete`. This triggers the `useEffect` cleanup and re-run, resetting `displayedText` back to `''` and restarting the animation from scratch.

## Fix

**File: `src/components/HomeChatbot.tsx`**

Store `onComplete` in a `useRef` inside `TypewriterText` so it never triggers the effect to re-run. Remove `onComplete` from the dependency array.

Changes to the `TypewriterText` component (lines 18-55):

```typescript
const TypewriterText = ({ text, speed = 15, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated without triggering effect
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
        onCompleteRef.current?.();  // Use ref instead of prop
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);  // onComplete removed from deps
  // ...
};
```

This is the same pattern already used in `MessageTypewriter.tsx` (lines 36-39), so it maintains consistency across the codebase.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- animation works the same, just doesn't restart |
| Works with existing data? | Yes -- no data changes |
| 3G optimized? | Yes -- actually fixes unnecessary re-processing |
| Edge cases handled? | Yes -- ref always stays current |
| Backward compatible? | Yes -- same API, same behavior once stable |

