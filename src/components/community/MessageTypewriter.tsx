import { useState, useEffect, useRef } from "react";
import { ChatMessageRenderer } from "@/components/ChatMessageRenderer";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

interface MessageTypewriterProps {
  content: string;
  /** Characters per tick (default: 2) */
  charsPerTick?: number;
  /** Milliseconds between ticks (default: network-aware) */
  speed?: number;
  /** Callback when typing completes */
  onComplete?: () => void;
  className?: string;
}

/**
 * Typewriter effect for message content.
 * - Shows characters progressively with blinking cursor
 * - Network-aware speed (faster on slow connections to reduce perceived latency)
 * - Uses ChatMessageRenderer after completion for proper markdown/KaTeX rendering
 */
export function MessageTypewriter({
  content,
  charsPerTick = 2,
  speed,
  onComplete,
  className,
}: MessageTypewriterProps) {
  const { isSlowConnection } = useNetworkAwareLoading();
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  
  // Update ref when callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Network-aware default speed: faster on slow connections
  const effectiveSpeed = speed ?? (isSlowConnection ? 5 : 15);

  useEffect(() => {
    if (displayedLength >= content.length) {
      setIsComplete(true);
      onCompleteRef.current?.();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + charsPerTick, content.length));
    }, effectiveSpeed);

    return () => clearTimeout(timer);
  }, [displayedLength, content.length, charsPerTick, effectiveSpeed]);

  // Reset when content changes (new message)
  useEffect(() => {
    setDisplayedLength(0);
    setIsComplete(false);
  }, [content]);

  // Once complete, render with full ChatMessageRenderer for markdown/KaTeX support
  if (isComplete) {
    return <ChatMessageRenderer content={content} className={className} />;
  }

  // During typing: show raw text with blinking cursor
  const displayedText = content.slice(0, displayedLength);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse ml-0.5 text-primary">|</span>
    </span>
  );
}
