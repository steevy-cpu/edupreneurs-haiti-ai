import { useState, useEffect, useCallback } from 'react';
import { addMediaQueryListener, addConnectionListener } from '@/lib/eventListeners';

export type AnimationLevel = 'full' | 'reduced' | 'minimal';

interface NetworkAwareAnimations {
  animationLevel: AnimationLevel;
  shouldAnimate: boolean;
  shouldShowFloatingReactions: boolean;
  shouldShowRipples: boolean;
  shouldStaggerMessages: boolean;
  shouldShowGlow: boolean;
}

/**
 * Hook that detects connection speed and user preferences to provide
 * appropriate animation settings. Adapts to network conditions in real-time.
 */
export function useNetworkAwareAnimations(): NetworkAwareAnimations {
  const [animationLevel, setAnimationLevel] = useState<AnimationLevel>('full');

  const updateLevel = useCallback(() => {
    // Check for reduced motion preference first (accessibility)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReduced) {
      setAnimationLevel('minimal');
      return;
    }

    // Check network conditions
    const connection = (navigator as any).connection;
    
    if (connection) {
      const { effectiveType, saveData } = connection;
      
      // Save data mode = minimal animations
      if (saveData) {
        setAnimationLevel('minimal');
        return;
      }
      
      // Slow connections = minimal or reduced
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setAnimationLevel('minimal');
        return;
      }
      
      if (effectiveType === '3g') {
        setAnimationLevel('reduced');
        return;
      }
    }
    
    // Default to full animations
    setAnimationLevel('full');
  }, []);

  useEffect(() => {
    // Initial check
    updateLevel();
    
    // Listen for network changes using cross-browser compatible helper
    const connection = (navigator as any).connection;
    const cleanupConnection = addConnectionListener(connection, updateLevel);
    
    // Listen for reduced motion preference changes using cross-browser compatible helper
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cleanupMediaQuery = addMediaQueryListener(mediaQuery, updateLevel);
    
    return () => {
      cleanupConnection();
      cleanupMediaQuery();
    };
  }, [updateLevel]);

  return {
    animationLevel,
    shouldAnimate: animationLevel !== 'minimal',
    shouldShowFloatingReactions: animationLevel === 'full',
    shouldShowRipples: animationLevel !== 'minimal',
    shouldStaggerMessages: animationLevel === 'full',
    shouldShowGlow: animationLevel !== 'minimal',
  };
}
