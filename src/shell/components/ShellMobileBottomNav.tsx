/**
 * ShellMobileBottomNav - Mobile bottom navigation using centralized config.
 * 
 * Uses the shell visibility system and navigation config.
 * Includes route preloading for faster 3G navigation.
 */

import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useVisibility } from '../hooks/useVisibility';
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRoutePreloader } from '../hooks/useRoutePreloader';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { isPushHintVisible } from '../hooks/usePushHintVisible';
import { MOBILE_NAVIGATION, type BadgeKey } from '../config/navigation';

/**
 * Mobile bottom navigation bar with badge support and route preloading.
 * Visibility controlled by centralized visibility system.
 */
export const ShellMobileBottomNav = memo(function ShellMobileBottomNav() {
  const location = useLocation();
  const keyboardOpen = useKeyboardOpen();
  const { showBottomNav } = useVisibility({ keyboardOpen });
  const { preloadRoute } = useRoutePreloader();
  
  // Badge data
  const { profile } = useUserProfile();
  const { badges } = useSidebarBadges(profile.userId);
  
  // Tour highlighting for first-time users
  const { tourActive, tourCompleted, currentTourNavPath, isLoading: tourLoading } = useFirstTimeUser();
  const tourHighlightPath = !tourLoading && tourActive && !tourCompleted ? currentTourNavPath : null;
  
  // Push permission hint — amber dot on notification bell (Plan C)
  const showPushHint = isPushHintVisible();
  
  // Theme toggle for compact icon button
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  // Don't render if hidden by visibility rules or keyboard is open
  if (!showBottomNav) {
    return null;
  }
  
  const getBadgeCount = (badgeKey?: BadgeKey): number => {
    if (!badgeKey) return 0;
    return badges[badgeKey] || 0;
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
        'bg-card/95 backdrop-blur-lg border-t border-border shadow-lg',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="flex items-center justify-around h-14">
        {MOBILE_NAVIGATION.map((item) => {
          const active = isActive(item.to);
          const badgeCount = getBadgeCount(item.badgeKey);
          const isHighlighted = tourHighlightPath === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              onMouseEnter={() => preloadRoute(item.to)}
              onTouchStart={() => preloadRoute(item.to)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                'transition-colors duration-200',
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground',
                isHighlighted && 'z-[1005]'
              )}
            >
              {/* Tour highlight ring */}
              {isHighlighted && (
                <div className="absolute inset-[-10px] rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
              )}
              
              {/* Icon with badge */}
              <div className="relative">
                <item.icon 
                  size={22} 
                  className={cn(
                    'transition-transform duration-200',
                    active && 'scale-110'
                  )} 
                />
                {/* Push hint amber dot — Plan C */}
                {item.to === '/notifications' && showPushHint && badgeCount === 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-[10px] mt-0.5 font-medium',
                active && 'font-semibold'
              )}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
        
        {/* Compact theme toggle — not a nav item, avoids crowding */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="flex flex-col items-center justify-center w-10 h-full text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-[10px] mt-0.5 font-medium">Thème</span>
        </button>
      </div>
    </nav>
  );
});

export default ShellMobileBottomNav;
