/**
 * AppShell - The ONE persistent shell after login.
 * 
 * This is the backbone of the post-login experience.
 * Pages swap inside the shell, but the shell itself never unmounts.
 * 
 * Features:
 * - Persistent sidebar (desktop) and bottom nav (mobile)
 * - Centralized floating layer (Jude, music player, FABs)
 * - Layout mode awareness for visibility control
 * - Auth gating with skeleton fallback
 */

import { useState, useEffect, ReactNode, memo, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Contexts
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useVisitor } from '@/contexts/VisitorContext';

// Hooks
import { useLayoutMode } from './hooks/useLayoutMode';
import { useVisibility } from './hooks/useVisibility';
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';
import { useMessageSounds } from '@/hooks/useMessageSounds';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useUserProfile } from '@/hooks/useUserProfile';

// Components
import { AppSidebar } from './components/AppSidebar';
import { ShellMobileBottomNav } from './components/ShellMobileBottomNav';
import { FloatingLayer } from './FloatingLayer';
import { VisitorBanner, JudeWelcomePopup } from '@/components/visitor';
import { QuizInvitationHandler } from '@/components/quiz-battle/QuizInvitationHandler';
import { ScrollToTop } from '@/components/ScrollToTop';
import { NavigationProgress } from './components/NavigationProgress';
import { SubscriptionGate } from '@/components/SubscriptionGate';

interface AppShellProps {
  /** Optional children - if not provided, uses <Outlet /> */
  children?: ReactNode;
}

/**
 * The persistent app shell for authenticated users.
 * Wraps all post-login routes with consistent navigation and floating UI.
 */
export const AppShell = memo(function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth state
  const { session, user: authUser, isAuthenticated, isLoading: authLoading } = useSessionAuth();
  const { isVisitor, showWelcomePopup, completeWelcomePopup, exitVisitorMode } = useVisitor();
  
  // Layout mode
  const { mode, showSidebar, isPublic, isFullscreen } = useLayoutMode();
  const keyboardOpen = useKeyboardOpen();
  const visibility = useVisibility({ keyboardOpen });
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Profile for realtime subscriptions
  const { profile } = useUserProfile();
  const userId = profile.userId;
  
  // Sound hooks
  const { playReceiveSound } = useMessageSounds();
  const { playNotificationSound } = useNotificationSound();
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  // Clear stale visitor mode when authenticated
  useEffect(() => {
    if (isAuthenticated && isVisitor) {
      exitVisitorMode();
    }
  }, [isAuthenticated, isVisitor, exitVisitorMode]);
  
  // Non-blocking auth redirect (only if not visitor and not loading)
  useEffect(() => {
    if (authLoading || isVisitor) return;
    
    if (!session && !location.pathname.startsWith('/auth')) {
      navigate('/auth/login', { state: { returnTo: location.pathname } });
    }
  }, [session, authLoading, isVisitor, location.pathname, navigate]);
  
  // Realtime subscriptions for toast notifications
  useEffect(() => {
    if (isVisitor || !userId) return;

    const messagesChannel = supabase
      .channel('shell-message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          if (payload.new && (payload.new as any).sender_id !== userId) {
            const { data: participation } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', (payload.new as any).conversation_id)
              .eq('user_id', userId)
              .maybeSingle();
            
            if (participation && location.pathname !== '/community') {
              playReceiveSound();
            }
          }
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('shell-notification-toasts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async (payload) => {
          const notification = payload.new as any;
          
          if (location.pathname !== '/notifications') {
            playNotificationSound();
          }
          
          const { data: actorProfile } = await supabase
            .from('profiles')
            .select('nickname, full_name')
            .eq('user_id', notification.actor_id)
            .single();
          
          const actorName = actorProfile?.nickname || actorProfile?.full_name || 'Quelqu\'un';
          
          let message = '';
          let actionPath = '/notifications';
          
          if (notification.type === 'follow_request') {
            message = `${actorName} a demandé à vous suivre`;
          } else if (notification.type === 'like') {
            message = `${actorName} a aimé votre publication`;
          } else if (notification.type === 'comment') {
            message = `${actorName} a commenté votre publication`;
          } else if (notification.type === 'share') {
            message = `${actorName} a partagé votre publication`;
          } else if (notification.type === 'quiz_invite') {
            message = `${actorName} te défie en Quiz Battle!`;
            actionPath = `/quiz-battle/lobby?mode=friend&invitation=${notification.content}`;
          } else if (notification.type === 'group_invitation') {
            message = `${actorName} t'a invité à rejoindre un groupe`;
          } else if (notification.type === 'announcement') {
            message = notification.content || 'Nouvelle annonce';
          } else {
            message = notification.content || 'Nouvelle notification';
          }
          
          toast.info(message, {
            duration: 5000,
            action: {
              label: 'Voir',
              onClick: () => navigate(actionPath),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [userId, isVisitor, location.pathname, playReceiveSound, playNotificationSound, navigate]);
  
  // For public routes, just render children
  if (isPublic) {
    return <>{children || <Outlet />}</>;
  }
  
  // Determine if we should hide navigation (fullscreen mode or specific pages)
  const hideNav = isFullscreen || !showSidebar;
  
  return (
    <>
      {/* Navigation progress bar for slow connections */}
      <NavigationProgress />
      
      {/* Scroll restoration */}
      <ScrollToTop />
      
      {/* Visitor banner - shows at top for visitor mode */}
      <VisitorBanner />
      
      <div className="min-h-screen bg-background">
        {/* Mobile Menu Button */}
        {!hideNav && (
          <button
            data-tour="menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'fixed top-3 left-3 z-[1001] lg:hidden',
              'bg-gradient-to-br from-primary to-success text-primary-foreground',
              'p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-md',
              'hover:shadow-lg transition-all duration-300 hover:scale-105'
            )}
            aria-label="Menu"
          >
            {sidebarOpen ? (
              <X size={20} className="sm:w-5 sm:h-5" />
            ) : (
              <Menu size={20} className="sm:w-5 sm:h-5" />
            )}
          </button>
        )}

        {/* Sidebar - persistent on desktop, overlay on mobile */}
        {!hideNav && (
          <AppSidebar 
            mobileOpen={sidebarOpen} 
            onMobileClose={() => setSidebarOpen(false)} 
          />
        )}

        {/* Main Content */}
        <main 
          className={cn(
            'min-h-screen transition-all duration-300',
            // Desktop sidebar offset
            !hideNav && 'lg:ml-[260px]',
            // Bottom padding for mobile nav
            visibility.showBottomNav && 'pb-16 lg:pb-0'
          )}
        >
          <SubscriptionGate>
            {children || <Outlet />}
          </SubscriptionGate>
        </main>

        {/* Mobile Bottom Navigation */}
        {visibility.showBottomNav && <ShellMobileBottomNav />}

        {/* Floating Layer - Jude, Music Player, FABs, etc. */}
        <FloatingLayer />

        {/* Quiz Invitation Handler - needs userId */}
        {userId && <QuizInvitationHandler userId={userId} />}

        {/* Visitor Welcome Popup */}
        {showWelcomePopup && (
          <JudeWelcomePopup 
            isOpen={showWelcomePopup} 
            onComplete={completeWelcomePopup} 
          />
        )}
      </div>
    </>
  );
});

export default AppShell;
