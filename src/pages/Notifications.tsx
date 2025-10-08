import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, UserPlus, Check, X, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAvatarUrl } from "@/lib/avatarMap";

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
  type: "like" | "comment" | "share" | "follow_request" | "new_post";
  content: string | null;
  read: boolean;
  created_at: string;
  actorProfile: Profile;
  followRequestPending?: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
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
            type: notification.type as "like" | "comment" | "share" | "follow_request" | "new_post",
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

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
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
        .select("id")
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-6">
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
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
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
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </span>
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
    </div>
  );
}
