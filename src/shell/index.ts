// Shell module exports - main components
export { AppShell } from './AppShell';
export { FloatingLayer } from './FloatingLayer';

// Shell component exports
export { AppSidebar } from './components/AppSidebar';
export { ShellMobileBottomNav } from './components/ShellMobileBottomNav';
export { SidebarNavLink } from './components/SidebarNavLink';

// Config exports
export { 
  getLayoutMode, 
  getLayoutConfig,
  LAYOUT_CONFIGS,
  ROUTE_LAYOUT_MAPPINGS,
  type LayoutMode,
  type LayoutConfig 
} from './config/layoutModes';

export { 
  shouldShowComponent,
  createVisibilityChecker,
  UI_VISIBILITY,
  type VisibilityConfig,
  type VisibilityOptions 
} from './config/visibility';

export { 
  SIDEBAR_NAVIGATION,
  MOBILE_NAVIGATION,
  getAllNavItems,
  getNavItemByPath,
  type NavItem,
  type NavSection,
  type MobileNavItem,
  type BadgeKey 
} from './config/navigation';

// Hook exports
export { useLayoutMode, type UseLayoutModeResult } from './hooks/useLayoutMode';
export { useVisibility, useKeyboardAwareVisibility, type UseVisibilityResult } from './hooks/useVisibility';

// Wrapper exports
export { NotificationBannerWrapper } from './wrappers/NotificationBannerWrapper';
export { PWAPromptWrapper } from './wrappers/PWAPromptWrapper';
