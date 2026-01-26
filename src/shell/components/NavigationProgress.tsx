/**
 * NavigationProgress - Visual feedback for route transitions.
 * 
 * Shows a thin progress bar at the top of the viewport during navigation.
 * Essential for 3G users who may experience 2-4 second transition delays.
 * 
 * Features:
 * - Appears on route change start
 * - Animates quickly to 70%, then slows (perceived progress)
 * - Completes to 100% when new page renders
 * - Uses CSS transforms for smooth 60fps animation
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function NavigationProgress() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPathRef = useRef(location.pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip if same path (e.g., query param changes)
    if (previousPathRef.current === location.pathname) {
      return;
    }
    
    previousPathRef.current = location.pathname;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Start progress animation
    setIsNavigating(true);
    setProgress(0);
    
    // Quick jump to 70% (perceived fast start)
    requestAnimationFrame(() => {
      setProgress(70);
    });
    
    // Complete after a short delay (page should be rendered)
    timeoutRef.current = setTimeout(() => {
      setProgress(100);
      
      // Hide bar after completion animation
      timeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 150);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  if (!isNavigating) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] pointer-events-none"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Navigation en cours"
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-primary/10" />
      
      {/* Progress indicator */}
      <div 
        className={cn(
          "h-full bg-gradient-to-r from-primary via-primary to-primary/80",
          "transition-all duration-300 ease-out",
          "shadow-[0_0_10px_hsl(var(--primary)/0.5)]",
          progress === 100 && "opacity-0 transition-opacity duration-200"
        )}
        style={{ 
          width: `${progress}%`,
          transform: 'translateZ(0)', // GPU acceleration
        }}
      />
      
      {/* Animated shimmer effect */}
      <div 
        className={cn(
          "absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent",
          "animate-shimmer",
          progress === 100 && "opacity-0"
        )}
        style={{ 
          left: `${Math.min(progress - 10, 90)}%`,
        }}
      />
    </div>
  );
}

export default NavigationProgress;
