import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMessageSounds } from "@/hooks/useMessageSounds";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import {
  Menu,
  X,
  Home,
  BookOpen,
  BookMarked,
  FolderOpen,
  Users,
  Link as LinkIcon,
  Settings,
  LogOut,
  MessageSquare,
  Search,
  Bell,
  Trophy,
  ArrowLeft,
  Palette,
  Gamepad2,
  Lock,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { isFounder } from "@/lib/founderConstants";
import dashboardImage from "@/assets/dashboard00.png";

// Use public paths for WebP optimization
const edupreneursLogo = "/images/edupreneurs-new-logo.png";
const edupreneursLogoWebP = "/images/edupreneurs-new-logo.webp";

import { getAvatarUrl } from "@/lib/avatarMap";
import { MobileBottomNav, useMobileSwipeNavigation } from "@/components/MobileBottomNav";
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
} from "@/components/ui/alert-dialog";
import { useVisitor } from "@/contexts/VisitorContext";
import { JudeWelcomePopup } from "@/components/visitor";
import { GlobalSearch, QuickMessageFAB } from "@/components/shared";
import { QuizInvitationHandler } from "@/components/quiz-battle/QuizInvitationHandler";

interface LayoutProps {
  children: ReactNode;
}

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

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisitor, showWelcomePopup, completeWelcomePopup, exitVisitorMode } = useVisitor();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile overlay state
  const [sidebarCollapsed, setSidebarCollapsed] = useSidebarCollapsed(); // Desktop collapsed state
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [pendingFollowRequests, setPendingFollowRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadFeedPosts, setUnreadFeedPosts] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string>(dashboardImage);
  const [userNickname, setUserNickname] = useState<string>(isVisitor ? "Visiteur" : "Étudiant");
  const [userId, setUserId] = useState<string | null>(null);
  const presenceChannelRef = useState<{ current: any | null }>({ current: null })[0];
  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileSwipeNavigation();
  const { playReceiveSound } = useMessageSounds();
  const { playNotificationSound } = useNotificationSound();
  // Note: Music stop on visitor exit is handled by VisitorMusicSync in App.tsx

  useEffect(() => {
    // Skip data fetching for visitors
    if (isVisitor) return;
    
    checkAuth();
    fetchUnreadCount();
    fetchPendingFollowRequests();
    fetchUnreadNotifications();
    fetchUnreadFeedPosts();
    fetchUserAvatar();
    setupGlobalPresence();
    
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [isVisitor]);
  
  const fetchUserAvatar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Clear any stale visitor mode when authenticated user is detected
    if (isVisitor) {
      exitVisitorMode();
      return;
    }
    
    setUserId(user.id);
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("avatar_url, nickname")
      .eq("user_id", user.id)
      .single();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }
    
    if (profile?.avatar_url) {
      // Use getAvatarUrl to properly map avatar IDs to image paths
      const avatarUrl = getAvatarUrl(profile.avatar_url);
      if (avatarUrl) {
        setUserAvatar(avatarUrl);
      }
    }
    if (profile?.nickname) {
      setUserNickname(profile.nickname);
    }
  };

  useEffect(() => {
    // Skip for visitors
    if (isVisitor) return;
    
    fetchUnreadCount();
    fetchPendingFollowRequests();
    fetchUnreadNotifications();
    fetchUnreadFeedPosts();

    // Listen for feed visited event to clear badge immediately
    const handleFeedVisited = () => {
      setUnreadFeedPosts(0);
    };
    window.addEventListener('feed-visited', handleFeedVisited);

    const messagesChannel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("Message change detected:", payload);
          
          // Get current user to check if message is from someone else
          const { data: { user } } = await supabase.auth.getUser();
          
          // Only play sound if the message is from another user and not on community page
          if (user && payload.new && (payload.new as any).sender_id !== user.id) {
            // Check if user is part of this conversation
            const { data: participation } = await supabase
              .from("conversation_participants")
              .select("user_id")
              .eq("conversation_id", (payload.new as any).conversation_id)
              .eq("user_id", user.id)
              .maybeSingle();
            
            // Play sound only if not on community page (to avoid double sounds)
            if (participation && location.pathname !== '/community') {
              playReceiveSound();
            }
          }
          
          await fetchUnreadCount();
        }
      )
      .subscribe();

    const followsChannel = supabase
      .channel("follow-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
        },
        async (payload) => {
          await fetchPendingFollowRequests();
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel("notification-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          await fetchUnreadNotifications();
          
          // Show toast for new notifications
          if (payload.eventType === "INSERT" && payload.new) {
            const notification = payload.new as any;
            
            // Play notification sound (unless on notifications page)
            if (location.pathname !== '/notifications') {
              playNotificationSound();
            }
            
            // Fetch actor profile
            const { data: actorProfile } = await supabase
              .from("profiles")
              .select("nickname, full_name")
              .eq("user_id", notification.actor_id)
              .single();
            
            const actorName = actorProfile?.nickname || actorProfile?.full_name || "Quelqu'un";
            
            // Show different messages based on notification type
            let message = "";
            let actionPath = "/notifications";
            
            if (notification.type === "follow_request") {
              message = `${actorName} a demandé à vous suivre`;
            } else if (notification.type === "like") {
              message = `${actorName} a aimé votre publication`;
            } else if (notification.type === "comment") {
              message = `${actorName} a commenté votre publication`;
            } else if (notification.type === "share") {
              message = `${actorName} a partagé votre publication`;
            } else if (notification.type === "quiz_invite") {
              message = `${actorName} te défie en Quiz Battle!`;
              actionPath = `/quiz-battle/lobby?mode=friend&invitation=${notification.content}`;
            } else if (notification.type === "group_invitation") {
              message = `${actorName} t'a invité à rejoindre un groupe`;
            } else if (notification.type === "announcement") {
              message = notification.content || "Nouvelle annonce";
            } else {
              message = notification.content || "Nouvelle notification";
            }
            
            toast.info(message, {
              duration: 5000,
              action: {
                label: "Voir",
                onClick: () => navigate(actionPath),
              },
            });
          }
        }
      )
      .subscribe();

    const postsChannel = supabase
      .channel("sidebar-posts-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async () => {
          await fetchUnreadFeedPosts();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('feed-visited', handleFeedVisited);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(postsChannel);
    };
  }, []);

  const setupGlobalPresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('🌐 [Layout] Setting up global presence for user:', user.id);
    
    // Update last_seen in database when user comes online
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', user.id);
    
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Add event listeners first
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('🔄 [Layout] Presence synced');
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('👋 [Layout] User joined global presence:', key);
      })
      .on('presence', { event: 'leave' }, async ({ key }) => {
        console.log('👋 [Layout] User left global presence:', key);
        // Update last_seen when user leaves
        await supabase
          .from('profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('user_id', key);
      });

    // Then subscribe and track
    channel.subscribe(async (status) => {
      console.log('📡 [Layout] Channel status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [Layout] Broadcasting presence for user:', user.id);
        const trackStatus = await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
        console.log('📡 [Layout] Track status:', trackStatus);
      }
    });

    // Store in ref for cleanup
    presenceChannelRef.current = channel;
  };

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: unreadMessages } = await supabase
      .from("messages")
      .select("id, conversation_id")
      .eq("read", false)
      .neq("sender_id", user.id);

    if (unreadMessages) {
      setTotalUnreadMessages(unreadMessages.length);
    }
  };

  const fetchPendingFollowRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: pendingRequests, count } = await supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", user.id)
      .eq("status", "pending");

    setPendingFollowRequests(count || 0);
  };

  const fetchUnreadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setUnreadNotifications(count || 0);
  };

  const fetchUnreadFeedPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: count } = await supabase.rpc('get_new_feed_posts_count', { p_user_id: user.id });

    setUnreadFeedPosts(count || 0);
  };

  const checkAuth = async () => {
    // Skip auth check for visitors - they're allowed to browse
    if (isVisitor) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && location.pathname !== "/auth") {
      navigate("/auth");
      return;
    }
    
    // If user has a session, check if email is verified
    if (session?.user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_confirmed')
        .eq('user_id', session.user.id)
        .single();
      
      if (!error && profile && !profile.email_confirmed) {
        // User is logged in but email not verified - sign them out and redirect to auth
        await supabase.auth.signOut();
        toast.error("Veuillez vérifier votre email avant d'accéder à votre compte");
        navigate("/auth");
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  const handleMessagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/community");
    setSidebarOpen(false);
  };

  const handleNotificationsClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/notifications");
    setSidebarOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const isCommunityPage = location.pathname === "/community";
  const isUserSearchPage = location.pathname === "/user-search";
  const isLessonPage = location.pathname.startsWith("/math-lesson") || 
                       location.pathname.startsWith("/francais-lesson") ||
                       location.pathname.startsWith("/espagnol-lesson") ||
                       location.pathname.startsWith("/creole-lesson") ||
                       location.pathname.startsWith("/sciences-lesson") ||
                       location.pathname.startsWith("/sciences-sociales-lesson") ||
                       location.pathname.startsWith("/anglais-lesson");
  const isFeedPage = location.pathname === "/feed";
  const isChessPage = location.pathname === "/chess-game";
  
  // Pages that have their own header/navigation
  const hideLayoutNav = isCommunityPage || isLessonPage || isFeedPage || isUserSearchPage || isChessPage;

  return (
    <div className="min-h-screen bg-background">
      {/* Menu Button - Mobile only (hidden on lg+) */}
      {!hideLayoutNav && (
        <button
          data-tour="menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-[1001] lg:hidden bg-gradient-to-br from-primary to-success text-primary-foreground p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Menu"
        >
          {sidebarOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
        </button>
      )}

      {/* Sidebar Overlay - Mobile only */}
      {!hideLayoutNav && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Persistent on desktop, overlay on mobile */}
      {!hideLayoutNav && (
        <div
          data-tour="sidebar-content"
          className={`
            fixed top-0 left-0 h-screen bg-card border-r border-border shadow-lg z-[1000] 
            transition-all duration-300 overflow-y-auto pb-20 lg:pb-0
            ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
            ${sidebarOpen ? 'translate-x-0 w-[240px] sm:w-[260px]' : '-translate-x-full lg:translate-x-0'}
          `}
        >
        {/* Sidebar Header */}
        <div className={`bg-gradient-to-br from-primary to-success text-primary-foreground border-b border-border/10 flex items-center justify-center ${sidebarCollapsed ? 'p-2 lg:p-3' : 'p-3 sm:p-4 lg:p-5'}`}>
          {sidebarCollapsed ? (
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

        {/* User Profile Section */}
        <div className={`text-center border-b border-border bg-gradient-to-br from-muted/30 to-muted/10 ${sidebarCollapsed ? 'p-2 lg:p-3' : 'p-3 sm:p-4 lg:p-6'}`}>
          <div className={`mx-auto rounded-full overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] shadow-md animate-[gentle-bob_8s_ease-in-out_infinite] ${sidebarCollapsed ? 'w-10 h-10 lg:mb-0 mb-2' : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 lg:mb-4'}`}>
            <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
          {!sidebarCollapsed && (
            <div className="font-bold text-sm sm:text-base lg:text-lg text-foreground">{userNickname}</div>
          )}
        </div>

        {/* Global Search - Desktop only when not collapsed */}
        {!sidebarCollapsed && (
          <div className="hidden lg:block px-3 py-2 border-b border-border">
            <GlobalSearch />
          </div>
        )}

        {/* Navigation */}
        <nav className={`${sidebarCollapsed ? 'py-2 lg:py-3' : 'py-3 sm:py-4 lg:py-5'}`} data-tour="nav-section">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/dashboard") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Home size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Dashboard
          </Link>
          <Link 
            to="/matieres" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/matieres") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <BookOpen size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Matières
          </Link>
          <Link 
            to="/resources" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/resources") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <FolderOpen size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Ressources
          </Link>
          <Link 
            to="/feed" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/feed") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Users size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Fil d'actualité
            {unreadFeedPosts > 0 && (
              <span className="ml-auto flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
                {unreadFeedPosts > 99 ? "99+" : unreadFeedPosts}
              </span>
            )}
          </Link>
          <Link 
            to="/community" 
            onClick={handleMessagesClick}
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/community") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <MessageSquare size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Messages
            {totalUnreadMessages > 0 && (
              <span className="ml-auto flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
                {totalUnreadMessages}
              </span>
            )}
          </Link>
          <Link 
            to="/lecture" 
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/lecture")
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <BookMarked size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Lecture
            <span className="ml-auto rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Nouveau
            </span>
          </Link>
          <Link 
            to="/games" 
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/games") || isActive("/chess-game") || isActive("/quiz-battle")
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Gamepad2 size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Jeux
          </Link>
          <Link 
            to="/user-search"
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/user-search") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Search size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Rechercher
          </Link>
          <Link 
            to="/notifications" 
            onClick={handleNotificationsClick}
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/notifications") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Bell size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="ml-auto flex items-center justify-center h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
                {unreadNotifications}
              </span>
            )}
          </Link>
          <Link 
            to="/affiliations" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/affiliations") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Lock size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Affiliations
            <span className="ml-auto text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              Bientôt
            </span>
          </Link>
          <Link 
            to="/leaderboard" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/leaderboard") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Trophy size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Classement
          </Link>
          <Link 
            to="/passion-discovery" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/passion-discovery") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Palette size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Mes Passions
          </Link>
          <Link 
            to="/settings" 
            className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
              isActive("/settings") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Settings size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Paramètres
          </Link>
          
          {/* Founder-only Control Center link */}
          {userId && isFounder(userId) && (
            <Link 
              to="/control-center" 
              className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 my-0.5 sm:my-1 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                isActive("/control-center") 
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
                  : "text-amber-600 dark:text-amber-400 hover:bg-gradient-to-br hover:from-amber-500 hover:to-orange-500 hover:text-white hover:translate-x-1"
              }`}
            >
              <Shield size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
              Centre de Contrôle
            </Link>
          )}
          
          <hr className={`border-border ${sidebarCollapsed ? 'my-2 mx-1' : 'my-2 sm:my-3 lg:my-4 mx-2 sm:mx-2.5 lg:mx-3'}`} />
          
          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex items-center gap-2 px-3 py-2.5 mx-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Réduire</span>
              </>
            )}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl text-sm sm:text-base text-destructive font-medium hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 ${
                  sidebarCollapsed 
                    ? 'px-3 mx-1 lg:justify-center' 
                    : 'px-3 sm:px-4 lg:px-5 mx-2 sm:mx-2.5 lg:mx-3 w-[calc(100%-1rem)] sm:w-[calc(100%-1.25rem)] lg:w-[calc(100%-1.5rem)] hover:translate-x-1'
                }`}
                title={sidebarCollapsed ? "Déconnexion" : undefined}
              >
                <LogOut size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span>Déconnexion</span>}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Se déconnecter
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
        </div>
      )}

      {/* Main Content - Adjust margin for persistent sidebar on desktop */}
      <div 
        className={`transition-all duration-300 pb-20 lg:pb-0 ${
          !hideLayoutNav 
            ? sidebarCollapsed 
              ? 'lg:ml-[72px]' 
              : 'lg:ml-[260px]'
            : ''
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Quick Message FAB */}
      {!hideLayoutNav && <QuickMessageFAB isVisitor={isVisitor} />}

      {/* Quiz Invitation Handler - Global listener for incoming battle invitations */}
      {userId && !isVisitor && <QuizInvitationHandler userId={userId} />}

      {/* Jude Welcome Popup for Visitors */}
      <JudeWelcomePopup 
        isOpen={showWelcomePopup} 
        onComplete={completeWelcomePopup} 
      />

    </div>
  );
};
