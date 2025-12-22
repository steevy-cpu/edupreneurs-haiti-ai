import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, UserPlus, Check, X, FileText, MoreVertical, Trash2, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { useNotificationSync } from "@/hooks/useNotificationSync";

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
  type: "like" | "comment" | "share" | "follow_request" | "new_post" | "group_invitation" | "group_deleted" | "lesson_comment";
  content: string | null;
  read: boolean;
  created_at: string;
  actorProfile: Profile;
  followRequestPending?: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Use notification sync hook for cross-tab synchronization
  useNotificationSync(() => {
    fetchNotifications();
  });

  useEffect(() => {
    checkAuth();
    fetchNotifications();
    
    let cleanup: (() => void) | undefined;
    subscribeToNotifications().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    } else {
      setCurrentUserId(user.id);
    }
  };

  const fetchNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("❌ No user found - redirecting to auth");
        navigate("/auth");
        setIsLoading(false);
        return;
      }

      console.log("✅ Fetching notifications for user:", user.id);

      const { data: notificationsData, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching notifications:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive"
        });
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      console.log(`✅ Found ${notificationsData?.length || 0} notifications`);

      if (!notificationsData || notificationsData.length === 0) {
        console.log("ℹ️ No notifications data found");
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      const notificationsWithProfiles = await Promise.all(
        notificationsData.map(async (notification) => {
          const { data: actorProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, user_id, nickname, full_name, avatar_url, affiliation_points, academic_grade")
            .eq("user_id", notification.actor_id)
            .maybeSingle();

          if (profileError) {
            console.error("⚠️ Error fetching actor profile for", notification.actor_id, ":", profileError);
          }

          // Check if follow request is still pending
          let followRequestPending = false;
          if (notification.type === "follow_request") {
            const { data: followData } = await supabase
              .from("follows")
              .select("status")
              .eq("follower_id", notification.actor_id)
              .eq("following_id", notification.user_id)
              .eq("status", "pending")
              .maybeSingle();
            
            followRequestPending = !!followData;
          }

          return {
            ...notification,
            type: notification.type as "like" | "comment" | "share" | "follow_request" | "new_post" | "group_invitation" | "group_deleted" | "lesson_comment",
            followRequestPending,
            actorProfile: actorProfile || {
              id: "",
              user_id: notification.actor_id,
              nickname: "Utilisateur inconnu",
              full_name: "Utilisateur inconnu",
              avatar_url: null,
              affiliation_points: 0,
              academic_grade: "",
            } as Profile,
          };
        })
      );

      console.log("✅ Processed notifications with profiles:", notificationsWithProfiles.length);
      setNotifications(notificationsWithProfiles);
    } catch (err) {
      console.error("❌ Unexpected error in fetchNotifications:", err);
      toast({
        title: "Erreur inattendue",
        description: "Une erreur s'est produite lors du chargement",
        variant: "destructive"
      });
      setNotifications([]);
    } finally {
      setIsLoading(false);
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
        async (payload) => {
          console.log('New notification received for current user:', payload);
          // Note: Don't send push notification here - it's already sent from the backend
          // Just refresh the notifications list
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getNotificationTextForBrowser = (notification: any, actorName: string): string => {
    switch (notification.type) {
      case 'follow_request':
        return `${actorName} vous a envoyé une demande d'abonnement`;
      case 'follow_accepted':
        return `${actorName} a accepté votre demande d'abonnement`;
      case 'new_post':
        return `${actorName} a publié quelque chose`;
      case 'post_like':
      case 'like':
        return `${actorName} a aimé votre publication`;
      case 'post_comment':
      case 'comment':
        return `${actorName} a commenté votre publication`;
      case 'lesson_comment':
        return `${actorName} a commenté la leçon "${notification.content}"`;
      case 'group_deleted':
        return notification.content || 'Un groupe a été supprimé';
      default:
        return notification.content || 'Nouvelle notification';
    }
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

    await fetchNotifications();
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
      case "new_post":
        return <FileText size={16} className="text-primary" />;
      case "group_invitation":
        return <UserPlus size={16} className="text-primary" />;
      case "group_deleted":
        return <Trash2 size={16} className="text-destructive" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actor = notification.actorProfile.nickname;
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
      case "new_post":
        return `${actor} a publié un nouveau post`;
      case "group_invitation":
        return notification.content || `${actor} vous a ajouté à un groupe`;
      case "group_deleted":
        return notification.content || `Un groupe a été supprimé`;
      default:
        return "";
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
    return `${days}d`;
  };

  const handleAcceptFollow = async (notification: Notification) => {
    try {
      // Find the follow record
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

      // Update the follow status to accepted
      const { error: updateError } = await supabase
        .from("follows")
        .update({ status: "accepted" })
        .eq("id", followData.id);

      if (updateError) throw updateError;

      // Create notification for the person who sent the request
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

      // Send push notification to the person who sent the request
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

      // Mark notification as read
      await markAsRead(notification.id);
      
      toast({ title: "Follow request accepted!" });
      fetchNotifications();
    } catch (error: any) {
      console.error("Error accepting follow request:", error);
      toast({ 
        title: "Failed to accept follow request",
        variant: "destructive" 
      });
    }
  };

  const handleDeclineFollow = async (notification: Notification) => {
    try {
      // Delete the follow record
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", notification.actor_id)
        .eq("following_id", notification.user_id)
        .eq("status", "pending");

      if (error) throw error;

      // Mark notification as read
      await markAsRead(notification.id);
      
      toast({ title: "Follow request declined" });
      fetchNotifications();
    } catch (error: any) {
      console.error("Error declining follow request:", error);
      toast({ 
        title: "Failed to decline follow request",
        variant: "destructive" 
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
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

      await fetchNotifications();
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
      await fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 px-3 py-4 sm:p-6 pb-24 sm:pb-6">
      {/* Notification Permission Banner */}
      {currentUserId && <NotificationPermissionBanner userId={currentUserId} />}
      
      <div className="max-w-2xl mx-auto">
        {/* Header with title and actions */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/notification-settings')}
              className="h-8 w-8 sm:h-9 sm:w-9"
              title="Paramètres de notification"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Action buttons row */}
        {(unreadCount > 0 || notifications.length > 0) && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
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

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-3 sm:p-4 animate-pulse">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-muted/50 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-muted/30 rounded" />
                      </div>
                      <div className="h-3 w-8 bg-muted/30 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">Aucune notification pour le moment</p>
          </Card>
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
                  {/* Avatar */}
                  <Avatar className="h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 ring-2 ring-background shadow-sm">
                    <AvatarImage src={getAvatarUrl(notification.actorProfile.avatar_url)} />
                    <AvatarFallback className="text-xs sm:text-sm font-medium">
                      {notification.actorProfile.nickname
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
          </div>
        )}
      </div>
      
      {/* Delete Notification Confirmation Dialog */}
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

      {/* Delete All Notifications Confirmation Dialog */}
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
    </div>
  );
}
