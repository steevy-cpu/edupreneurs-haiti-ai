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
  type: "like" | "comment" | "share" | "follow_request" | "new_post" | "group_invitation" | "group_deleted";
  content: string | null;
  read: boolean;
  created_at: string;
  actorProfile: Profile;
  followRequestPending?: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deleteNotificationId, setDeleteNotificationId] = useState<string | null>(null);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("No user found");
      return;
    }

    console.log("Fetching notifications for user:", user.id);

    const { data: notificationsData, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    console.log("Notifications query result:", { notificationsData, error });

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    if (!notificationsData || notificationsData.length === 0) {
      console.log("No notifications data found");
      setNotifications([]);
      return;
    }

    console.log(`Found ${notificationsData.length} notifications`);

    try {
      const notificationsWithProfiles = await Promise.all(
        notificationsData.map(async (notification) => {
          const { data: actorProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, user_id, nickname, full_name, avatar_url, affiliation_points, academic_grade")
            .eq("user_id", notification.actor_id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching actor profile:", profileError);
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
            type: notification.type as "like" | "comment" | "share" | "follow_request" | "new_post" | "group_invitation" | "group_deleted",
            followRequestPending,
            actorProfile: actorProfile || {
              id: "",
              user_id: notification.actor_id,
              nickname: "Unknown User",
              full_name: "Unknown User",
              avatar_url: null,
              affiliation_points: 0,
              academic_grade: "",
            } as Profile,
          };
        })
      );

      console.log("Notifications with profiles:", notificationsWithProfiles);
      setNotifications(notificationsWithProfiles);
    } catch (err) {
      console.error("Error processing notifications:", err);
      setNotifications([]);
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
      if (notification.post_id) {
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
      {/* Notification Permission Banner */}
      {currentUserId && <NotificationPermissionBanner userId={currentUserId} />}
      
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                  !notification.read ? "bg-accent/50" : ""
                }`}
              >
                <div className="flex items-start gap-3" onClick={() => handleNotificationClick(notification)}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(notification.actorProfile.avatar_url)} />
                    <AvatarFallback>
                      {notification.actorProfile.nickname
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <p className="text-sm">
                          {getNotificationText(notification)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
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
                    </div>
                    {notification.type === "follow_request" && notification.followRequestPending && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptFollow(notification);
                          }}
                          className="flex items-center gap-1"
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
                          className="flex items-center gap-1"
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
    </div>
  );
}
