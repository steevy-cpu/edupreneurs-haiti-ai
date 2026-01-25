import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Rss, Bell, MessageSquare, Gamepad2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSidebarBadges } from "@/hooks/useSidebarBadges";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";

interface NavItem {
  icon: React.ElementType;
  path: string;
  badge?: number;
  prefetchKey?: string[];
}

// Navigation paths for swipe gestures
const NAV_PATHS = ["/dashboard", "/matieres", "/lecture", "/feed", "/community", "/notifications", "/settings"];

export const useMobileSwipeNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentIndex = NAV_PATHS.indexOf(location.pathname);
  const minSwipeDistance = 80;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (currentIndex === -1) return;

    if (isLeftSwipe && currentIndex < NAV_PATHS.length - 1) {
      navigate(NAV_PATHS[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      navigate(NAV_PATHS[currentIndex - 1]);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, navigate]);

  return { onTouchStart, onTouchMove, onTouchEnd };
};

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
  // Use cached profile and badges from React Query hooks
  const { profile } = useUserProfile();
  const { badges } = useSidebarBadges(profile.userId);
  
  // Tour highlight state for mobile navigation
  const { tourActive, tourCompleted, currentTourNavPath, isLoading: tourLoading } = useFirstTimeUser();
  // Guard against loading state to prevent hook mismatches during navigation transitions
  const tourHighlightPath = !tourLoading && tourActive && !tourCompleted ? currentTourNavPath : null;

  // Track keyboard visibility using visualViewport
  useEffect(() => {
    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      // Robust keyboard offset calculation (handles iOS offsetTop)
      const kbHeight = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));

      // Lower threshold (80px) for faster keyboard detection
      setKeyboardOpen(kbHeight > 80);
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const navItems: NavItem[] = [
    { icon: Home, path: "/dashboard" },
    { icon: BookOpen, path: "/matieres" },
    { icon: Rss, path: "/feed", badge: badges.unreadFeedPosts > 0 ? badges.unreadFeedPosts : undefined, prefetchKey: ["feed-posts"] },
    { icon: MessageSquare, path: "/community", badge: badges.unreadMessages > 0 ? badges.unreadMessages : undefined, prefetchKey: ["conversations"] },
    { icon: Bell, path: "/notifications", badge: badges.unreadNotifications > 0 ? badges.unreadNotifications : undefined, prefetchKey: ["notifications"] },
    { icon: Gamepad2, path: "/games" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Prefetch data when touching/hovering a nav item
  const handlePrefetch = (prefetchKey?: string[]) => {
    if (prefetchKey) {
      // Trigger a refetch if data is stale, otherwise use cached
      queryClient.invalidateQueries({ queryKey: prefetchKey, refetchType: 'none' });
    }
  };

  // Hide on certain pages or when keyboard is open on community
  const hiddenPaths = ["/onboarding", "/chess-game", "/quiz-battle/solo"];
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLessonPage = location.pathname.includes("-lesson/");
  const isQuizBattlePage = location.pathname.startsWith("/quiz-battle");
  
  // Hide on certain pages, during lessons, OR when ANY keyboard is open
  // This prevents overlap with JudeChatbot and provides more screen space for input
  if (hiddenPaths.includes(location.pathname) || isAuthPage || isLessonPage || keyboardOpen) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[1000] bg-card/95 backdrop-blur-lg border-t border-border lg:hidden tap-highlight-none transition-transform duration-100 ease-out"
      style={{ 
        position: 'fixed',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isHighlighted = tourHighlightPath === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onTouchStart={() => handlePrefetch(item.prefetchKey)}
              onMouseEnter={() => handlePrefetch(item.prefetchKey)}
              className={`relative flex items-center justify-center flex-1 h-full touch-target tap-highlight-none active:bg-muted/50 transition-colors duration-150 ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              } ${isHighlighted ? 'z-[1005]' : ''}`}
            >
              <div className={`relative transition-transform duration-150 ${active ? '' : 'active:scale-90'}`}>
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? "scale-110" : ""}
                />
                
                {/* Tour highlight ring - pulsing effect on mobile */}
                {isHighlighted && (
                  <div className="absolute inset-[-10px] rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
                )}
                
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
