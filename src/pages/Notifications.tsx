import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, UserPlus, Check, X, FileText, MoreVertical, Trash2, Settings, AtSign, UserCheck, Loader2, Megaphone, Swords, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarMap";
import { PageHeader } from "@/components/shared/PageHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotificationSync } from "@/hooks/useNotificationSync";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { EmptyState } from "@/components/shared/EmptyState";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

// Lazy load heavy dialog components
const AlertDialog = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialog })));
const AlertDialogAction = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogAction })));
const AlertDialogCancel = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogCancel })));
const AlertDialogContent = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogContent })));
const AlertDialogDescription = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogDescription })));
const AlertDialogFooter = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogFooter })));
const AlertDialogHeader = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogHeader })));
const AlertDialogTitle = lazy(() => import("@/components/ui/alert-dialog").then(m => ({ default: m.AlertDialogTitle })));


interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  full_name: string;
  avatar_url: string | null;
  affiliation_points: number;
  academic_grade: string;
}

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  post_id: string | null;
  type: "like" | "comment" | "share" | "follow_request" | "follow_accepted" | "new_post" | "group_invitation" | "group_deleted" | "lesson_comment" | "mention" | "announcement" | "quiz_invite" | "subscription_renewed" | "gift_payment";
  content: string | null;
  read: boolean;
  created_at: string;
  actorProfile: Profile;
  followRequestPending?: boolean;
}

const PAGE_SIZE = 20;

// Skeleton component optimized for network conditions
const NotificationSkeleton = ({ count = 5 }: { count?: number }) => {
  const { isSlowConnection } = useNetworkAwareLoading();
  const itemCount = isSlowConnection ? Math.min(count, 3) : count;
  
  return (
    <div className="space-y-2">
      {Array.from({ length: itemCount }).map((_, i) => (
        <Card key={i} className="p-3 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { playNotificationSound } = useNotificationSound();
  const { isSlowConnection, shouldLoadFullQuality } = useNetworkAwareLoading();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  // Use notification sync hook for cross-tab synchronization
  useNotificationSync(() => {
    resetAndFetch();
  });

  const resetAndFetch = useCallback(() => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchNotifications(true);
  }, []);

  useEffect(() => {
    checkAuth();
    fetchNotifications(true);
    
    let cleanup: (() => void) | undefined;
    subscribeToNotifications().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || isLoading || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchNotifications(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, hasMore]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth/login");
    } else {
      setCurrentUserId(user.id);
    }
  };

  const fetchNotifications = async (isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
        offsetRef.current = 0;
      } else {
        setIsLoadingMore(true);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("❌ No user found - redirecting to auth");
        navigate("/auth/login");
        setIsLoading(false);
        return;
      }

      console.log(`✅ Fetching notifications for user: ${user.id} (offset: ${offsetRef.current})`);

      // Paginated query
      const { data: notificationsData, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offsetRef.current, offsetRef.current + PAGE_SIZE - 1);

      if (error) {
        console.error("❌ Error fetching notifications:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive"
        });
        if (isInitial) setNotifications([]);
        return;
      }

      console.log(`✅ Found ${notificationsData?.length || 0} notifications`);

      if (!notificationsData || notificationsData.length === 0) {
        console.log("ℹ️ No more notifications");
        setHasMore(false);
        if (isInitial) setNotifications([]);
        return;
      }

      // Check if there are more to load
      if (notificationsData.length < PAGE_SIZE) {
        setHasMore(false);
      }

      // OPTIMIZED: Batch fetch all unique actor profiles in ONE query
      const uniqueActorIds = [...new Set(notificationsData.map(n => n.actor_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, nickname, full_name, avatar_url, affiliation_points, academic_grade")
        .in("user_id", uniqueActorIds);

      if (profilesError) {
        console.error("⚠️ Error fetching profiles batch:", profilesError);
      }

      // Create a map for O(1) lookup
      const profileMap = new Map<string, Profile>(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      // OPTIMIZED: Batch check pending follow requests
      const followRequestNotifications = notificationsData.filter(n => n.type === "follow_request");
      const pendingFollowMap = new Map<string, boolean>();
      
      if (followRequestNotifications.length > 0) {
        const actorIds = followRequestNotifications.map(n => n.actor_id);
        const { data: followsData } = await supabase
          .from("follows")
          .select("follower_id")
          .in("follower_id", actorIds)
          .eq("following_id", user.id)
          .eq("status", "pending");
        
        followsData?.forEach(f => pendingFollowMap.set(f.follower_id, true));
      }

      const notificationsWithProfiles: Notification[] = notificationsData.map((notification) => {
        const actorProfile = profileMap.get(notification.actor_id) || {
          id: "",
          user_id: notification.actor_id,
          nickname: "Étudiant",
          full_name: "Étudiant",
          avatar_url: null,
          affiliation_points: 0,
          academic_grade: "",
        };

        return {
          ...notification,
          type: notification.type as Notification["type"],
          followRequestPending: pendingFollowMap.get(notification.actor_id) || false,
          actorProfile,
        };
      });

      console.log("✅ Processed notifications with profiles:", notificationsWithProfiles.length);
      
      if (isInitial) {
        setNotifications(notificationsWithProfiles);
      } else {
        setNotifications(prev => [...prev, ...notificationsWithProfiles]);
      }
      
      offsetRef.current += notificationsData.length;
    } catch (err) {
      console.error("❌ Unexpected error in fetchNotifications:", err);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors du chargement",
        variant: "destructive"
      });
      if (isInitial) setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const subscribeToNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          console.log('New notification received for current user');
          playNotificationSound();
          resetAndFetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-red-500" />;
      case "comment":
        return <MessageCircle size={16} className="text-blue-500" />;
      case "lesson_comment":
        return <MessageCircle size={16} className="text-purple-500" />;
      case "share":
        return <Share2 size={16} className="text-green-500" />;
      case "follow_request":
        return <UserPlus size={16} className="text-purple-500" />;
      case "follow_accepted":
        return <UserCheck size={16} className="text-green-500" />;
      case "new_post":
        return <FileText size={16} className="text-primary" />;
      case "group_invitation":
        return <UserPlus size={16} className="text-primary" />;
      case "group_deleted":
        return <Trash2 size={16} className="text-destructive" />;
      case "mention":
        return <AtSign size={16} className="text-primary" />;
      case "announcement":
        return <Megaphone size={16} className="text-orange-500" />;
      case "quiz_invite":
        return <Swords size={16} className="text-primary" />;
      case "subscription_renewed":
      case "gift_payment":
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <MessageCircle size={16} className="text-muted-foreground" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actor = notification.actorProfile.nickname ?? 'Étudiant';
    switch (notification.type) {
      case "like":
        return `${actor} a aimé votre publication`;
      case "comment":
        return `${actor} a commenté: "${notification.content}"`;
      case "lesson_comment":
        return `${actor} a commenté la leçon "${notification.content}"`;
      case "share":
        return `${actor} a partagé votre publication`;
      case "follow_request":
        return `${actor} a demandé à vous suivre`;
      case "follow_accepted":
        return `${actor} a accepté votre demande d'abonnement`;
      case "new_post":
        return `${actor} a publié un nouveau post`;
      case "group_invitation":
        return notification.content || `${actor} vous a ajouté à un groupe`;
      case "group_deleted":
        return notification.content || `Un groupe a été supprimé`;
      case "mention":
        return `${actor} vous a mentionné dans un post`;
      case "announcement":
        // Announcements display content directly, not actor name
        return notification.content || "📢 Nouvelle annonce de la plateforme";
      case "quiz_invite":
        return `${actor} te défie en Quiz Battle!`;
      case "subscription_renewed":
        return "Ton abonnement a été renouvelé avec succès! 🎉";
      case "gift_payment":
        return notification.content || "Un proche a payé votre abonnement! 🎁";
      default:
        // Fallback: use content if available, otherwise show generic message
        return notification.content || `${actor} a interagi avec vous`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}j`;
  };

  const handleAcceptFollow = async (notification: Notification) => {
    try {
      const { data: followData, error: fetchError } = await supabase
        .from("follows")
        .select("id, follower_id")
        .eq("follower_id", notification.actor_id)
        .eq("following_id", notification.user_id)
        .eq("status", "pending")
        .single();

      if (fetchError) {
        console.error("Error finding follow request:", fetchError);
        return;
      }

      const { error: updateError } = await supabase
        .from("follows")
        .update({ status: "accepted" })
        .eq("id", followData.id);

      if (updateError) throw updateError;

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: notification.actor_id,
          actor_id: notification.user_id,
          type: "follow_accepted",
          read: false,
        });

      if (notifError) {
        console.error("❌ Error creating acceptance notification:", notifError);
      }

      try {
        const { data: acceptorProfile } = await supabase
          .from("profiles")
          .select("nickname, full_name")
          .eq("user_id", notification.user_id)
          .single();

        await supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: notification.actor_id,
            title: 'EDUPRENEURS',
            body: `${acceptorProfile?.nickname || acceptorProfile?.full_name || 'Someone'} a accepté votre demande d'abonnement`,
            url: '/notifications',
            type: 'follow_accepted'
          }
        });
        console.log('✅ Follow acceptance push notification sent');
      } catch (pushError) {
        console.error('❌ Error sending push notification:', pushError);
      }

      await markAsRead(notification.id);
      
      toast({ title: "Demande acceptée!" });
      resetAndFetch();
    } catch (error: any) {
      console.error("Error accepting follow request:", error);
      toast({ 
        title: "Échec de l'acceptation",
        variant: "destructive" 
      });
    }
  };

  const handleDeclineFollow = async (notification: Notification) => {
    try {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", notification.actor_id)
        .eq("following_id", notification.user_id)
        .eq("status", "pending");

      if (error) throw error;

      await markAsRead(notification.id);
      
      toast({ title: "Demande refusée" });
      resetAndFetch();
    } catch (error: any) {
      console.error("Error declining follow request:", error);
      toast({ 
        title: "Échec du refus",
        variant: "destructive" 
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Announcements just mark as read, no specific navigation
    if (notification.type === "announcement") {
      markAsRead(notification.id);
      return;
    }
    
    // Quiz invitations navigate to battle lobby with invitation ID
    if (notification.type === "quiz_invite") {
      markAsRead(notification.id);
      navigate(`/quiz-battle/lobby?mode=friend&invitation=${notification.content}`);
      return;
    }
    
    if (notification.type !== "follow_request") {
      markAsRead(notification.id);
      if (notification.type === "lesson_comment") {
        navigate("/content-editor");
      } else if (notification.post_id) {
        navigate("/feed");
      }
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      toast({ 
        title: "Notification supprimée",
      });

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({ 
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive" 
      });
    } finally {
      setDeleteNotificationId(null);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setDeleteAllDialogOpen(false);
      setNotifications([]);

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ 
        title: "Toutes les notifications ont été supprimées",
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast({ 
        title: "Erreur",
        description: "Impossible de supprimer les notifications",
        variant: "destructive" 
      });
      resetAndFetch();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Network-aware avatar size
  const avatarSize = isSlowConnection ? "h-8 w-8 sm:h-10 sm:w-10" : "h-9 w-9 sm:h-11 sm:w-11";

  return (
    <main className="h-dvh bg-gradient-to-br from-background to-background/80 flex flex-col overflow-hidden">
      {/* Header - Fixed, non-scrolling */}
      <header className="shrink-0 px-3 py-4 sm:px-6 sm:pt-6 bg-background">
        <div className="max-w-2xl mx-auto">
          {/* Header using PageHeader component */}
          <PageHeader
            title="Notifications"
            subtitle={unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : undefined}
            variant="simple"
            showThemeToggle={true}
            actions={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings?tab=notifications')}
                className="h-8 w-8 sm:h-9 sm:w-9"
                title="Paramètres de notification"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            }
          />

          {/* Action buttons row */}
          {(unreadCount > 0 || notifications.length > 0) && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Marquer comme lu
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  onClick={() => setDeleteAllDialogOpen(true)} 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Tout supprimer
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Scrollable content section */}
      <section className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 pb-24 lg:pb-6">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
          <NotificationSkeleton count={isSlowConnection ? 3 : 5} />
        ) : notifications.length === 0 ? (
          <EmptyState
            illustration="no-notifications"
            title="Tout est calme"
            description="Tu n'as pas encore de notifications. Interagis avec la communauté pour en recevoir!"
            ctaLabel="Explorer le feed"
            ctaAction={() => navigate("/feed")}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !notification.read 
                    ? "bg-primary/10 border-l-4 border-l-primary shadow-sm" 
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3" onClick={() => handleNotificationClick(notification)}>
                  {/* Avatar - Network aware sizing */}
                  <Avatar className={`${avatarSize} flex-shrink-0 ring-2 ring-background shadow-sm`}>
                    {shouldLoadFullQuality ? (
                      <AvatarImage 
                        src={getAvatarUrl(notification.actorProfile.avatar_url)} 
                        loading="lazy"
                      />
                    ) : (
                      <AvatarImage 
                        src={getAvatarUrl(notification.actorProfile.avatar_url)} 
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <AvatarFallback className="text-xs sm:text-sm font-medium">
                      {(notification.actorProfile.nickname ?? '??')
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-start gap-2">
                      {/* Icon and text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <span className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                          <p className="text-xs sm:text-sm leading-relaxed line-clamp-2 break-words">
                            {getNotificationText(notification)}
                          </p>
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 block">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      
                      {/* Menu button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 -mr-1">
                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                          {!notification.read && (
                            <DropdownMenuItem
                              className="text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Marquer lu
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteNotificationId(notification.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Follow request actions */}
                    {notification.type === "follow_request" && notification.followRequestPending && (
                      <div className="flex gap-2 mt-2.5 sm:mt-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptFollow(notification);
                          }}
                          className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                        >
                          <Check size={14} />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeclineFollow(notification);
                          }}
                          className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                        >
                          <X size={14} />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="py-4 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </div>
              )}
              {!hasMore && notifications.length > 0 && (
                <p className="text-xs text-muted-foreground">Toutes les notifications ont été chargées</p>
              )}
            </div>
          </div>
        )}
        </div>
      </section>
      
      {/* Delete Notification Confirmation Dialog - Lazy loaded */}
      <Suspense fallback={null}>
        {deleteNotificationId && (
          <AlertDialog open={!!deleteNotificationId} onOpenChange={(open) => !open && setDeleteNotificationId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la notification?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Cette notification sera définitivement supprimée.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteNotificationId && handleDeleteNotification(deleteNotificationId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Suspense>

      {/* Delete All Notifications Confirmation Dialog - Lazy loaded */}
      <Suspense fallback={null}>
        {deleteAllDialogOpen && (
          <AlertDialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer toutes les notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos notifications seront définitivement supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllNotifications}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Tout supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Suspense>
    </main>
  );
}
