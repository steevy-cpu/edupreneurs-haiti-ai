import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Menu,
  X,
  Home,
  BookOpen,
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
} from "lucide-react";
import dashboardImage from "@/assets/dashboard00.png";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { EricChatbot } from "@/components/EricChatbot";
import { getAvatarUrl } from "@/lib/avatarMap";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [pendingFollowRequests, setPendingFollowRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string>(dashboardImage);
  const [userNickname, setUserNickname] = useState<string>("Étudiant");
  const presenceChannelRef = useState<{ current: any | null }>({ current: null })[0];

  useEffect(() => {
    checkAuth();
    fetchUnreadCount();
    fetchPendingFollowRequests();
    fetchUnreadNotifications();
    fetchUserAvatar();
    setupGlobalPresence();
    
    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);
  
  const fetchUserAvatar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
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
    fetchUnreadCount();
    fetchPendingFollowRequests();
    fetchUnreadNotifications();

    const messagesChannel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("Message change detected:", payload);
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
            
            // Fetch actor profile
            const { data: actorProfile } = await supabase
              .from("profiles")
              .select("nickname, full_name")
              .eq("user_id", notification.actor_id)
              .single();
            
            const actorName = actorProfile?.nickname || actorProfile?.full_name || "Quelqu'un";
            
            // Show different messages based on notification type
            let message = "";
            if (notification.type === "follow_request") {
              message = `${actorName} a demandé à vous suivre`;
            } else if (notification.type === "like") {
              message = `${actorName} a aimé votre publication`;
            } else if (notification.type === "comment") {
              message = `${actorName} a commenté votre publication`;
            } else if (notification.type === "share") {
              message = `${actorName} a partagé votre publication`;
            } else {
              message = notification.content || "Nouvelle notification";
            }
            
            toast.info(message, {
              duration: 5000,
              action: {
                label: "Voir",
                onClick: () => navigate("/notifications"),
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const setupGlobalPresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('🌐 [Layout] Setting up global presence for user:', user.id);
    
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
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('👋 [Layout] User left global presence:', key);
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

  const checkAuth = async () => {
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
  const isLessonPage = location.pathname.startsWith("/math-lesson") || 
                       location.pathname.startsWith("/francais-lesson") ||
                       location.pathname.startsWith("/espagnol-lesson") ||
                       location.pathname.startsWith("/creole-lesson") ||
                       location.pathname.startsWith("/sciences-lesson") ||
                       location.pathname.startsWith("/sciences-sociales-lesson") ||
                       location.pathname.startsWith("/anglais-lesson");
  const isFeedPage = location.pathname === "/feed";

  return (
    <div className="min-h-screen bg-background">
      {/* Menu Button */}
      {!isCommunityPage && !isLessonPage && !isFeedPage && (
        <button
          data-tour="menu-button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-[1001] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Menu"
        >
          {sidebarOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
        </button>
      )}

      {/* Sidebar Overlay */}
      {!isCommunityPage && !isLessonPage && !isFeedPage && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isCommunityPage && !isLessonPage && !isFeedPage && (
        <div
          data-tour="sidebar-content"
          className={`fixed top-0 left-0 h-screen w-[240px] sm:w-[260px] lg:w-[280px] bg-card border-r border-border shadow-lg z-[1000] transition-transform duration-300 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-3 sm:p-4 lg:p-5 border-b border-white/10 flex items-center justify-center">
          <img 
            src={edupreneursLogo} 
            alt="EDUPRENEURS" 
            className="h-12 sm:h-14 w-auto object-contain logo-no-filter"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* User Profile Section */}
        <div className="p-3 sm:p-4 lg:p-6 text-center border-b border-border bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] shadow-md animate-[gentle-bob_8s_ease-in-out_infinite]">
            <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
          <div className="font-bold text-sm sm:text-base lg:text-lg text-foreground">{userNickname}</div>
        </div>

        {/* Navigation */}
        <nav className="py-3 sm:py-4 lg:py-5" data-tour="nav-section">
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
            <LinkIcon size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Affiliations
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
          <hr className="border-border my-2 sm:my-3 lg:my-4 mx-2 sm:mx-2.5 lg:mx-3" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 mx-2 sm:mx-2.5 lg:mx-3 rounded-lg sm:rounded-xl text-sm sm:text-base text-destructive font-medium hover:bg-destructive hover:text-white hover:translate-x-1 transition-all duration-300 w-[calc(100%-1rem)] sm:w-[calc(100%-1.25rem)] lg:w-[calc(100%-1.5rem)]"
          >
            <LogOut size={16} className="sm:w-[17px] sm:h-[17px] lg:w-[18px] lg:h-[18px]" />
            Déconnexion
          </button>
        </nav>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${!isCommunityPage && sidebarOpen ? "lg:ml-[240px] xl:ml-[260px] 2xl:ml-[280px]" : ""}`}>
        {children}
      </div>

      {/* Eric Chatbot - Hidden on Community page */}
      {location.pathname !== "/community" && <EricChatbot />}
    </div>
  );
};
