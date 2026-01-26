/**
 * AppSidebar - Data-driven sidebar using navigation config.
 * 
 * Features:
 * - Data-driven navigation from navigation.ts
 * - Collapsible state persisted to localStorage
 * - Route preloading for faster 3G navigation
 * - Badge support for notifications/messages
 */

import { useState, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hooks
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';
import { useRoutePreloader } from '../hooks/useRoutePreloader';
import { isFounder } from '@/lib/founderConstants';

// Config
import { SIDEBAR_NAVIGATION, type BadgeKey } from '../config/navigation';

// Components
import { SidebarNavLink } from './SidebarNavLink';
import { GlobalSearch } from '@/components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Logo paths
const edupreneursLogo = '/images/edupreneurs-new-logo.png';

// Hook to persist sidebar collapsed state
const useSidebarCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed');
      return stored === 'true';
    }
    return false;
  });

  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  };

  return [isCollapsed, setCollapsed] as const;
};

interface AppSidebarProps {
  /** Is mobile overlay open */
  mobileOpen?: boolean;
  /** Close mobile overlay */
  onMobileClose?: () => void;
}

/**
 * Desktop sidebar with collapsible state.
 * Mobile overlay is controlled by parent.
 */
export const AppSidebar = memo(function AppSidebar({ 
  mobileOpen = false, 
  onMobileClose 
}: AppSidebarProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const { preloadRoute } = useRoutePreloader();
  
  // Auth and profile data
  const { profile } = useUserProfile();
  const { badges } = useSidebarBadges(profile.userId);
  
  const userAvatar = profile.avatarUrl;
  const userNickname = profile.nickname;
  const userId = profile.userId;
  const isUserFounder = userId ? isFounder(userId) : false;
  
  // Badge mapping
  const getBadgeCount = (badgeKey?: BadgeKey): number | undefined => {
    if (!badgeKey) return undefined;
    return badges[badgeKey] || 0;
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Déconnexion réussie');
    navigate('/auth/login');
  };
  
  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };
  
  const handleLinkHover = (path: string) => {
    preloadRoute(path);
  };
  
  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[999] lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        data-tour="sidebar-content"
        className={cn(
          'fixed top-0 left-0 h-screen bg-card border-r border-border shadow-lg z-[1000]',
          'transition-all duration-300 overflow-y-auto pb-20 lg:pb-0 flex flex-col',
          // Desktop width
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile state
          mobileOpen ? 'translate-x-0 w-[240px] sm:w-[260px]' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header with Logo */}
        <div className={cn(
          'bg-gradient-to-br from-primary to-success text-primary-foreground border-b border-border/10 flex items-center justify-center flex-shrink-0',
          collapsed ? 'p-2 lg:p-3' : 'p-3 sm:p-4 lg:p-5'
        )}>
          {collapsed ? (
            <div className="hidden lg:flex w-10 h-10 rounded-full bg-white/20 items-center justify-center text-white font-bold text-lg">
              E
            </div>
          ) : (
            <img 
              src={edupreneursLogo} 
              alt="EDUPRENEURS" 
              className="h-12 sm:h-14 w-auto object-contain logo-no-filter"
              loading="eager"
              decoding="async"
            />
          )}
        </div>

        {/* Expand button - Only visible when collapsed (desktop) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="hidden lg:flex items-center justify-center w-10 h-10 mx-auto mt-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 group flex-shrink-0"
            title="Agrandir la barre latérale"
          >
            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* User Profile Section */}
        <div className={cn(
          'text-center border-b border-border bg-gradient-to-br from-muted/30 to-muted/10 flex-shrink-0',
          collapsed ? 'p-2 lg:p-3' : 'p-3 sm:p-4 lg:p-6'
        )}>
          <div className={cn(
            'mx-auto rounded-full overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] shadow-md animate-[gentle-bob_8s_ease-in-out_infinite]',
            collapsed ? 'w-10 h-10 lg:mb-0 mb-2' : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 lg:mb-4'
          )}>
            <img 
              src={userAvatar} 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              loading="lazy" 
              decoding="async" 
            />
          </div>
          {!collapsed && (
            <div className="font-bold text-sm sm:text-base lg:text-lg text-foreground truncate">
              {userNickname}
            </div>
          )}
        </div>

        {/* Global Search - Desktop only when not collapsed */}
        {!collapsed && (
          <div className="hidden lg:block px-3 py-2 border-b border-border flex-shrink-0">
            <GlobalSearch />
          </div>
        )}

        {/* Navigation - DATA DRIVEN */}
        <nav className={cn('flex-1 overflow-y-auto', collapsed ? 'py-2 lg:py-3' : 'py-3 sm:py-4 lg:py-5')} data-tour="nav-section">
          {SIDEBAR_NAVIGATION.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section title (if present and not collapsed) */}
              {section.title && !collapsed && (
                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              
              {/* Section items */}
              {section.items
                .filter(item => !item.founderOnly || isUserFounder)
                .map(item => (
                  <SidebarNavLink
                    key={item.to}
                    to={item.to}
                    icon={<item.icon size={16} />}
                    label={item.label}
                    badge={getBadgeCount(item.badgeKey)}
                    badgeLabel={item.badge === 'new' ? 'Nouveau' : item.badge === 'soon' ? 'Bientôt' : undefined}
                    badgeVariant={item.badge}
                    variant={item.variant}
                    collapsed={collapsed}
                    onClick={handleLinkClick}
                    onPreload={() => handleLinkHover(item.to)}
                    activeOnPaths={
                      item.to === '/games' ? ['/chess-game', '/quiz-battle'] : undefined
                    }
                  />
                ))}
            </div>
          ))}
          
          <hr className={cn(
            'border-border',
            collapsed ? 'my-2 mx-1' : 'my-2 sm:my-3 lg:my-4 mx-2 sm:mx-2.5 lg:mx-3'
          )} />
          
          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden lg:flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-300',
              collapsed 
                ? 'justify-center text-muted-foreground hover:text-foreground hover:bg-muted'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Réduire</span>
              </>
            )}
          </button>
          
          {/* Logout Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-2 sm:gap-2.5 lg:gap-3',
                  'px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5',
                  'mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1',
                  'rounded-lg sm:rounded-xl text-sm sm:text-base font-medium',
                  'text-destructive hover:bg-destructive/10 transition-all duration-300',
                  collapsed && 'justify-center lg:px-2'
                )}
              >
                <LogOut size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
                {!collapsed && 'Déconnexion'}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Se déconnecter?</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir vous déconnecter de votre compte?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Déconnexion
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
      </aside>
    </>
  );
});

export default AppSidebar;
