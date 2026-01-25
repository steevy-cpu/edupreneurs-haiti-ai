import { useState, useEffect, useRef, type ReactNode } from 'react';

interface DeferredContentProps {
  children: ReactNode;
  /** Minimum height for reserved space (prevents CLS) */
  minHeight?: string;
  /** Timeout before forcing render (ms) */
  timeout?: number;
}

/**
 * Wrapper that defers rendering of children until browser is idle.
 * Uses requestIdleCallback with IntersectionObserver fallback.
 * 
 * Key behaviors:
 * - Reserves space immediately to prevent layout shift
 * - Renders children when browser is idle OR near viewport
 * - Falls back to setTimeout for browsers without requestIdleCallback
 * 
 * @example
 * <DeferredContent>
 *   <HeavySection />
 * </DeferredContent>
 */
export function DeferredContent({ 
  children, 
  minHeight = "200px",
  timeout = 2000 
}: DeferredContentProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Strategy 1: Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(
        () => setShouldRender(true),
        { timeout }
      );
      cleanup = () => window.cancelIdleCallback(idleId);
    } else {
      // Fallback: Use setTimeout with short delay
      const timer = setTimeout(() => setShouldRender(true), 100);
      cleanup = () => clearTimeout(timer);
    }

    // Strategy 2: Also observe intersection for immediate visibility
    if (containerRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setShouldRender(true);
            observer.disconnect();
          }
        },
        { 
          rootMargin: '200px', // Start loading slightly before visible
          threshold: 0 
        }
      );
      
      observer.observe(containerRef.current);
      
      const originalCleanup = cleanup;
      cleanup = () => {
        originalCleanup?.();
        observer.disconnect();
      };
    }

    return cleanup;
  }, [timeout]);

  // Reserve space even before content renders (prevents CLS)
  if (!shouldRender) {
    return (
      <div 
        ref={containerRef} 
        style={{ minHeight }}
        aria-hidden="true"
        className="bg-transparent"
      />
    );
  }

  return <>{children}</>;
}

export default DeferredContent;
