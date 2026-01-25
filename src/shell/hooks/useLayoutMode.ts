/**
 * Hook for accessing layout mode and configuration.
 * Provides reactive updates when the route changes.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  getLayoutMode, 
  getLayoutConfig, 
  type LayoutMode, 
  type LayoutConfig 
} from '../config/layoutModes';

export interface UseLayoutModeResult {
  /** Current layout mode */
  mode: LayoutMode;
  /** Full configuration for current mode */
  config: LayoutConfig;
  /** Quick checks for common UI visibility */
  showSidebar: boolean;
  showMobileNav: boolean;
  showJude: boolean;
  showMusicPlayer: boolean;
  showQuickMessage: boolean;
  /** Whether this is a public (no-shell) route */
  isPublic: boolean;
  /** Whether this is a fullscreen (zero-chrome) route */
  isFullscreen: boolean;
  /** Whether this is a learning (focus mode) route */
  isLearning: boolean;
}

/**
 * Get the current layout mode and configuration based on the route.
 * 
 * @example
 * const { mode, config, showSidebar } = useLayoutMode();
 * 
 * return (
 *   <div>
 *     {config.showSidebar && <Sidebar />}
 *     <main>{children}</main>
 *   </div>
 * );
 */
export function useLayoutMode(): UseLayoutModeResult {
  const location = useLocation();
  
  return useMemo(() => {
    const mode = getLayoutMode(location.pathname);
    const config = getLayoutConfig(location.pathname);
    
    return {
      mode,
      config,
      showSidebar: config.showSidebar,
      showMobileNav: config.showMobileNav,
      showJude: config.showJude,
      showMusicPlayer: config.showMusicPlayer,
      showQuickMessage: config.showQuickMessage,
      isPublic: mode === 'public',
      isFullscreen: mode === 'fullscreen',
      isLearning: mode === 'learning',
    };
  }, [location.pathname]);
}

export default useLayoutMode;
