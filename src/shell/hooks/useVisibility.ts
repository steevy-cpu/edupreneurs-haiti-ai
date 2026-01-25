/**
 * Hook for checking UI component visibility based on current route.
 * Uses centralized visibility rules from visibility.ts.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { 
  shouldShowComponent, 
  createVisibilityChecker,
  type VisibilityOptions 
} from '../config/visibility';

export interface UseVisibilityResult {
  showJude: boolean;
  showMusicPlayer: boolean;
  showBottomNav: boolean;
  showQuickMessage: boolean;
  showSidebar: boolean;
  showNotificationBanner: boolean;
  showPWAPrompt: boolean;
  /** Check visibility for a specific component */
  isVisible: (componentKey: string) => boolean;
}

/**
 * Hook that provides visibility states for all floating/persistent UI components.
 * Automatically considers auth state and can be extended with keyboard state.
 * 
 * @example
 * const { showJude, showBottomNav } = useVisibility();
 * 
 * return (
 *   <>
 *     {showJude && <JudeChatbot />}
 *     {showBottomNav && <MobileBottomNav />}
 *   </>
 * );
 */
export function useVisibility(options: Partial<VisibilityOptions> = {}): UseVisibilityResult {
  const location = useLocation();
  const { isAuthenticated } = useSessionAuth();
  
  return useMemo(() => {
    const opts: VisibilityOptions = {
      isAuthenticated,
      keyboardOpen: options.keyboardOpen ?? false,
    };
    
    const visibility = createVisibilityChecker(location.pathname, opts);
    
    return {
      ...visibility,
      isVisible: (componentKey: string) => 
        shouldShowComponent(componentKey as any, location.pathname, opts),
    };
  }, [location.pathname, isAuthenticated, options.keyboardOpen]);
}

/**
 * Simpler hook for keyboard-aware visibility (e.g., MobileBottomNav).
 */
export function useKeyboardAwareVisibility(keyboardOpen: boolean): UseVisibilityResult {
  return useVisibility({ keyboardOpen });
}

export default useVisibility;
