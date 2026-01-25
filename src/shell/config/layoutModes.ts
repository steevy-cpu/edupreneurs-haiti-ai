/**
 * Layout Mode System - Declarative layout configurations for the app shell.
 * 
 * Each route declares its mode, and the shell automatically configures UI visibility.
 * This replaces scattered route checks across 5+ files with a single source of truth.
 */

export type LayoutMode =
  | 'dashboard'    // Full chrome: sidebar, bottom nav, floating tools
  | 'learning'     // Minimal: no sidebar, focus mode for lessons
  | 'social'       // Full chrome with custom headers (feed, community)
  | 'games'        // Immersive: optional chrome based on game type
  | 'admin'        // Full chrome with founder badge
  | 'fullscreen'   // Zero chrome: quiz battles, chess games
  | 'public';      // Landing, auth, blog - separate shell entirely

export interface LayoutConfig {
  showSidebar: boolean;
  showMobileNav: boolean;
  showJude: boolean;
  showMusicPlayer: boolean;
  showQuickMessage: boolean;
  showNotificationBanner: boolean;
  showPWAPrompt: boolean;
}

/**
 * Layout configurations for each mode.
 * Components read from this instead of checking routes individually.
 */
export const LAYOUT_CONFIGS: Record<LayoutMode, LayoutConfig> = {
  dashboard: {
    showSidebar: true,
    showMobileNav: true,
    showJude: true,
    showMusicPlayer: true,
    showQuickMessage: true,
    showNotificationBanner: true,
    showPWAPrompt: true,
  },
  learning: {
    showSidebar: false,
    showMobileNav: false,
    showJude: false,
    showMusicPlayer: true,
    showQuickMessage: false,
    showNotificationBanner: false,
    showPWAPrompt: false,
  },
  social: {
    showSidebar: false,
    showMobileNav: true,
    showJude: false,
    showMusicPlayer: true,
    showQuickMessage: false, // Has its own messaging UI
    showNotificationBanner: true,
    showPWAPrompt: true,
  },
  games: {
    showSidebar: true,
    showMobileNav: true,
    showJude: true,
    showMusicPlayer: true,
    showQuickMessage: true,
    showNotificationBanner: true,
    showPWAPrompt: true,
  },
  admin: {
    showSidebar: true,
    showMobileNav: true,
    showJude: true,
    showMusicPlayer: true,
    showQuickMessage: true,
    showNotificationBanner: true,
    showPWAPrompt: false,
  },
  fullscreen: {
    showSidebar: false,
    showMobileNav: false,
    showJude: false,
    showMusicPlayer: false,
    showQuickMessage: false,
    showNotificationBanner: false,
    showPWAPrompt: false,
  },
  public: {
    showSidebar: false,
    showMobileNav: false,
    showJude: false,
    showMusicPlayer: false,
    showQuickMessage: false,
    showNotificationBanner: false,
    showPWAPrompt: false,
  },
};

/**
 * Route to layout mode mapping.
 * Patterns are matched in order - first match wins.
 * More specific patterns should come before general ones.
 */
export interface RouteLayoutMapping {
  pattern: string | RegExp;
  mode: LayoutMode;
}

export const ROUTE_LAYOUT_MAPPINGS: RouteLayoutMapping[] = [
  // Public routes - no shell
  { pattern: '/', mode: 'public' },
  { pattern: /^\/auth/, mode: 'public' },
  { pattern: /^\/blog/, mode: 'public' },
  { pattern: '/privacy-policy', mode: 'public' },
  { pattern: '/terms', mode: 'public' },
  
  // Fullscreen - zero chrome for immersive experiences
  { pattern: '/onboarding', mode: 'fullscreen' },
  { pattern: '/quiz-battle/solo', mode: 'fullscreen' },
  { pattern: /^\/quiz-battle\/multiplayer\//, mode: 'fullscreen' },
  { pattern: '/chess-game', mode: 'fullscreen' },
  { pattern: /^\/chess-multiplayer\/game\//, mode: 'fullscreen' },
  
  // Learning - focus mode for lessons
  { pattern: /^\/course\/[^/]+\/[^/]+/, mode: 'learning' }, // /course/:slug/:lessonSlug
  { pattern: /-lesson\//, mode: 'learning' }, // Legacy lesson routes
  { pattern: /^\/lecture\//, mode: 'learning' },
  
  // Social - custom headers
  { pattern: '/feed', mode: 'social' },
  { pattern: '/community', mode: 'social' },
  { pattern: '/user-search', mode: 'social' },
  { pattern: /^\/profile\//, mode: 'social' },
  
  // Admin
  { pattern: '/control-center', mode: 'admin' },
  
  // Games hub
  { pattern: '/games', mode: 'games' },
  { pattern: '/quiz-battle', mode: 'games' },
  { pattern: '/passion-discovery', mode: 'games' },
  
  // Default - dashboard mode for everything else
];

/**
 * Get the layout mode for a given pathname.
 * Falls back to 'dashboard' if no pattern matches.
 */
export function getLayoutMode(pathname: string): LayoutMode {
  for (const mapping of ROUTE_LAYOUT_MAPPINGS) {
    if (typeof mapping.pattern === 'string') {
      if (pathname === mapping.pattern) {
        return mapping.mode;
      }
    } else {
      if (mapping.pattern.test(pathname)) {
        return mapping.mode;
      }
    }
  }
  return 'dashboard';
}

/**
 * Get the layout configuration for a given pathname.
 */
export function getLayoutConfig(pathname: string): LayoutConfig {
  const mode = getLayoutMode(pathname);
  return LAYOUT_CONFIGS[mode];
}
