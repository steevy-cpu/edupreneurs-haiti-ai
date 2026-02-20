/**
 * SidebarNavLink - Reusable navigation link component for the sidebar.
 * 
 * REPLACES repeated inline link styles in Layout.tsx (~300 lines saved).
 * Supports badges, active states, and founder variants.
 */

import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SidebarNavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  /** Dynamic badge count from notifications/messages */
  badge?: number;
  /** Static badge label (e.g., "Nouveau", "Bientôt") */
  badgeLabel?: string;
  /** Badge variant for static badges */
  badgeVariant?: 'new' | 'soon' | 'default';
  /** Visual variant */
  variant?: 'default' | 'founder';
  /** Is sidebar collapsed (desktop) */
  collapsed?: boolean;
  /** Callback when link is clicked */
  onClick?: () => void;
  /** Callback for preloading on hover/touch */
  onPreload?: () => void;
  /** Additional paths to consider as "active" */
  activeOnPaths?: string[];
  /** Show a pulsing amber dot hint (e.g. push permission not yet granted) */
  showPulsingDot?: boolean;
}

/**
 * Navigation link with consistent styling, active state detection, and badge support.
 */
export function SidebarNavLink({
  to,
  icon,
  label,
  badge,
  badgeLabel,
  badgeVariant = 'default',
  variant = 'default',
  collapsed = false,
  onClick,
  onPreload,
  activeOnPaths = [],
  showPulsingDot = false,
}: SidebarNavLinkProps) {
  const location = useLocation();
  
  // Check if this link is active
  const isActive = location.pathname === to || activeOnPaths.some(path => 
    path.includes('*') 
      ? location.pathname.startsWith(path.replace('*', ''))
      : location.pathname === path
  );
  
  // Base styles
  const baseStyles = cn(
    'flex items-center gap-2 sm:gap-2.5 lg:gap-3',
    'px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5',
    'mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1',
    'rounded-lg sm:rounded-xl text-sm sm:text-base font-medium',
    'transition-all duration-300',
    collapsed && 'justify-center lg:px-2'
  );
  
  // Variant-specific active/inactive styles
  const variantStyles = {
    default: {
      active: 'bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white',
      inactive: 'text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1',
    },
    founder: {
      active: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
      inactive: 'text-amber-600 dark:text-amber-400 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-500 hover:text-white hover:translate-x-1',
    },
  };
  
  const styles = variantStyles[variant];
  
  // Badge styles
  const getBadgeLabelStyles = () => {
    switch (badgeVariant) {
      case 'new':
        return 'bg-emerald-500 text-white';
      case 'soon':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <Link
      to={to}
      onClick={onClick}
      onMouseEnter={onPreload}
      onTouchStart={onPreload}
      className={cn(
        baseStyles,
        isActive ? styles.active : styles.inactive
      )}
      title={collapsed ? label : undefined}
    >
      {/* Icon with optional pulsing dot hint */}
      <span className="relative flex-shrink-0 w-4 h-4 sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]">
        {icon}
        {showPulsingDot && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        )}
      </span>
      
      {/* Label - hidden when collapsed */}
      {!collapsed && <span className="truncate">{label}</span>}
      
      {/* Dynamic badge (count) */}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="ml-auto flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      
      {/* Static badge (label) */}
      {!collapsed && badgeLabel && (
        <span className={cn(
          'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
          getBadgeLabelStyles()
        )}>
          {badgeLabel}
        </span>
      )}
    </Link>
  );
}

export default SidebarNavLink;
