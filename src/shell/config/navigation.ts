/**
 * Data-Driven Sidebar Navigation Configuration
 * 
 * REPLACES inline links with repeated styles in Layout.tsx (~300 lines).
 * All navigation is defined here and rendered declaratively.
 */

import { 
  Home, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Bell, 
  Gamepad2, 
  Trophy, 
  Settings, 
  Shield, 
  BookMarked,
  FolderOpen, 
  Search, 
  Palette, 
  Lock,
  BarChart3,
  type LucideIcon
} from "lucide-react";

/**
 * Badge keys that can be populated from real-time data.
 * These correspond to notification counts from various features.
 */
export type BadgeKey = 
  | 'unreadMessages' 
  | 'unreadNotifications' 
  | 'unreadFeedPosts' 
  | 'pendingFollowRequests';

/**
 * Static badge labels for new/upcoming features.
 */
export type StaticBadge = 'new' | 'soon';

export interface NavItem {
  /** Route path */
  to: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Dynamic badge from real-time data */
  badgeKey?: BadgeKey;
  /** Static badge for feature announcements */
  badge?: StaticBadge;
  /** Only show for founder users */
  founderOnly?: boolean;
  /** Visual variant */
  variant?: 'default' | 'founder';
}

export interface NavSection {
  /** Section title (optional for first section) */
  title?: string;
  /** Items in this section */
  items: NavItem[];
}

/**
 * Complete sidebar navigation structure.
 * Rendered by AppSidebar using SidebarNavLink components.
 */
export const SIDEBAR_NAVIGATION: NavSection[] = [
  {
    // Main section - no title
    items: [
      { to: '/dashboard', icon: Home, label: 'Dashboard' },
      { to: '/matieres', icon: BookOpen, label: 'Matières' },
      { to: '/resources', icon: FolderOpen, label: 'Ressources' },
    ]
  },
  {
    title: 'Social',
    items: [
      { to: '/feed', icon: Users, label: "Fil d'actualité", badgeKey: 'unreadFeedPosts' },
      { to: '/community', icon: MessageSquare, label: 'Messages', badgeKey: 'unreadMessages' },
      { to: '/notifications', icon: Bell, label: 'Notifications', badgeKey: 'unreadNotifications' },
    ]
  },
  {
    title: 'Découverte',
    items: [
      { to: '/lecture', icon: BookMarked, label: 'Lecture', badge: 'new' },
      { to: '/games', icon: Gamepad2, label: 'Jeux' },
      { to: '/user-search', icon: Search, label: 'Rechercher' },
    ]
  },
  {
    title: 'Profil',
    items: [
      { to: '/leaderboard', icon: Trophy, label: 'Classement' },
      { to: '/affiliations', icon: Lock, label: 'Affiliations', badge: 'soon' },
      { to: '/passion-discovery', icon: Palette, label: 'Mes Passions' },
      { to: '/settings', icon: Settings, label: 'Paramètres' },
    ]
  },
  {
    title: 'Admin',
    items: [
      { 
        to: '/control-center', 
        icon: Shield, 
        label: 'Centre de Contrôle', 
        founderOnly: true, 
        variant: 'founder' 
      },
      { 
        to: '/analytics', 
        icon: BarChart3, 
        label: 'Analytiques', 
        founderOnly: true, 
        variant: 'founder' 
      },
    ]
  },
];

/**
 * Mobile bottom navigation items.
 * Subset of sidebar items for quick access on mobile.
 */
export interface MobileNavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badgeKey?: BadgeKey;
}

export const MOBILE_NAVIGATION: MobileNavItem[] = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/matieres', icon: BookOpen, label: 'Cours' },
  { to: '/games', icon: Gamepad2, label: 'Jeux' },
  { to: '/community', icon: MessageSquare, label: 'Chat', badgeKey: 'unreadMessages' },
  { to: '/notifications', icon: Bell, label: 'Notifs', badgeKey: 'unreadNotifications' },
  { to: '/settings', icon: Settings, label: 'Plus' },
];

/**
 * Get all navigation items flattened (for search, etc.)
 */
export function getAllNavItems(): NavItem[] {
  return SIDEBAR_NAVIGATION.flatMap(section => section.items);
}

/**
 * Find a navigation item by path
 */
export function getNavItemByPath(path: string): NavItem | undefined {
  return getAllNavItems().find(item => item.to === path);
}
