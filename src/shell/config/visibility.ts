/**
 * Centralized UI Visibility Rules
 * 
 * REPLACES scattered hiddenPaths arrays in:
 * - MobileBottomNav.tsx
 * - GlobalMusicPlayer.tsx
 * - QuickMessageFAB.tsx
 * - Layout.tsx
 * - App.tsx (EricChatbotWrapper)
 * - JudeChatbot.tsx
 * 
 * Single source of truth for all visibility decisions.
 */

export interface VisibilityConfig {
  /** Exact paths where component should be hidden */
  hideOn: string[];
  /** Regex patterns for hiding (e.g., /^\/auth/ for all auth routes) */
  hideOnPatterns: RegExp[];
  /** Only show for authenticated users */
  requiresAuth?: boolean;
  /** Allow for visitor mode even if requiresAuth is true */
  allowForVisitors?: boolean;
  /** Hide when virtual keyboard is open (mobile) */
  hideWhenKeyboardOpen?: boolean;
}

/**
 * Master visibility configuration for all floating/persistent UI components.
 * Components should call shouldShowComponent() instead of local route checks.
 */
export const UI_VISIBILITY: Record<string, VisibilityConfig> = {
  jude: {
    hideOn: [
      '/community',
      '/feed',
      '/passion-discovery',
      '/quiz-battle/lobby',
      '/quiz-battle/solo',
      '/blog',
      '/onboarding',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /^\/quiz-battle\/multiplayer\//,
      /^\/chess-multiplayer\/game\//,
      /^\/blog\//,
      /^\/course\/[^/]+\/[^/]+/, // Lesson pages
      /^\/lecture\//,
      /-lesson\//,
    ],
    requiresAuth: true,
    allowForVisitors: true, // Show for visitor tour/welcome
  },
  
  musicPlayer: {
    hideOn: [
      '/',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /^\/blog/,
    ],
    requiresAuth: true,
    allowForVisitors: true, // Music plays during visitor tour
  },
  
  bottomNav: {
    hideOn: [
      '/onboarding',
      '/chess-game',
      '/quiz-battle/solo',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /-lesson\//,
      /^\/quiz-battle\/multiplayer\//,
      /^\/course\/[^/]+\/[^/]+/,
    ],
    hideWhenKeyboardOpen: true,
  },
  
  quickMessage: {
    hideOn: [
      '/community',
      '/passion-discovery',
    ],
    hideOnPatterns: [
      /^\/quiz-battle/,
      /^\/auth/,
    ],
    requiresAuth: true,
  },
  
  sidebar: {
    hideOn: [
      '/community',
      '/user-search',
      '/feed',
      '/chess-game',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /-lesson\//,
      /^\/course\/[^/]+\/[^/]+/,
      /^\/quiz-battle\//,
    ],
  },
  
  notificationBanner: {
    hideOn: [
      '/onboarding',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /-lesson\//,
      /^\/quiz-battle\//,
    ],
    requiresAuth: true,
  },
  
  pwaPrompt: {
    hideOn: [
      '/onboarding',
    ],
    hideOnPatterns: [
      /^\/auth/,
      /-lesson\//,
      /^\/quiz-battle\//,
    ],
  },
};

export interface VisibilityOptions {
  isAuthenticated?: boolean;
  isVisitor?: boolean;
  keyboardOpen?: boolean;
}

/**
 * Check if a UI component should be shown for the given path.
 * 
 * @param componentKey - Key from UI_VISIBILITY (e.g., 'jude', 'bottomNav')
 * @param pathname - Current route pathname
 * @param options - Additional context like auth state and keyboard state
 * @returns true if component should be shown
 * 
 * @example
 * const showJude = shouldShowComponent('jude', location.pathname, { isAuthenticated: true });
 */
export function shouldShowComponent(
  componentKey: keyof typeof UI_VISIBILITY,
  pathname: string,
  options: VisibilityOptions = {}
): boolean {
  const config = UI_VISIBILITY[componentKey];
  if (!config) {
    console.warn(`Unknown visibility key: ${componentKey}`);
    return true;
  }
  
  const { isAuthenticated = true, isVisitor = false, keyboardOpen = false } = options;
  
  // Check auth requirement - allow visitors if specified
  if (config.requiresAuth && !isAuthenticated) {
    if (!config.allowForVisitors || !isVisitor) {
      return false;
    }
  }
  
  // Check keyboard state
  if (config.hideWhenKeyboardOpen && keyboardOpen) {
    return false;
  }
  
  // Check exact path matches
  if (config.hideOn.includes(pathname)) {
    return false;
  }
  
  // Check pattern matches
  for (const pattern of config.hideOnPatterns) {
    if (pattern.test(pathname)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Hook-friendly wrapper that can be used with React Router's useLocation
 */
export function createVisibilityChecker(pathname: string, options: VisibilityOptions = {}) {
  return {
    showJude: shouldShowComponent('jude', pathname, options),
    showMusicPlayer: shouldShowComponent('musicPlayer', pathname, options),
    showBottomNav: shouldShowComponent('bottomNav', pathname, options),
    showQuickMessage: shouldShowComponent('quickMessage', pathname, options),
    showSidebar: shouldShowComponent('sidebar', pathname, options),
    showNotificationBanner: shouldShowComponent('notificationBanner', pathname, options),
    showPWAPrompt: shouldShowComponent('pwaPrompt', pathname, options),
  };
}
