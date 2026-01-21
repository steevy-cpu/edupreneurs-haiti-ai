import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVisitor } from "@/contexts/VisitorContext";

export interface SidebarBadges {
  unreadMessages: number;
  pendingFollowRequests: number;
  unreadNotifications: number;
  unreadFeedPosts: number;
}

const EMPTY_BADGES: SidebarBadges = {
  unreadMessages: 0,
  pendingFollowRequests: 0,
  unreadNotifications: 0,
  unreadFeedPosts: 0,
};

async function fetchSidebarBadges(userId: string): Promise<SidebarBadges> {
  // Fetch all counts in parallel for efficiency
  const [messagesResult, followsResult, notifsResult, feedResult] = await Promise.all([
    supabase
      .from("messages")
      .select("id")
      .eq("read", false)
      .neq("sender_id", userId),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId)
      .eq("status", "pending"),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false),
    supabase.rpc('get_new_feed_posts_count', { p_user_id: userId }),
  ]);

  return {
    unreadMessages: messagesResult.data?.length || 0,
    pendingFollowRequests: followsResult.count || 0,
    unreadNotifications: notifsResult.count || 0,
    unreadFeedPosts: feedResult.data || 0,
  };
}

export function useSidebarBadges(userId?: string | null) {
  const { isVisitor } = useVisitor();
  const queryClient = useQueryClient();

  const { data: badges, isLoading, refetch } = useQuery({
    queryKey: ['sidebar-badges', userId],
    queryFn: () => fetchSidebarBadges(userId!),
    staleTime: 2 * 60 * 1000, // 2 minutes - badges update more frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!userId && !isVisitor, // Only fetch when we have a userId and not in visitor mode
  });

  // Set up realtime subscriptions for badge updates
  useEffect(() => {
    if (!userId || isVisitor) return;

    // Listen for feed visited event to clear badge immediately
    const handleFeedVisited = () => {
      queryClient.setQueryData(['sidebar-badges', userId], (old: SidebarBadges | undefined) => {
        if (!old) return EMPTY_BADGES;
        return { ...old, unreadFeedPosts: 0 };
      });
    };
    window.addEventListener('feed-visited', handleFeedVisited);

    const messagesChannel = supabase
      .channel("sidebar-badges-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => refetch()
      )
      .subscribe();

    const followsChannel = supabase
      .channel("sidebar-badges-follows")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows" },
        () => refetch()
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel("sidebar-badges-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => refetch()
      )
      .subscribe();

    const postsChannel = supabase
      .channel("sidebar-badges-posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        () => refetch()
      )
      .subscribe();

    return () => {
      window.removeEventListener('feed-visited', handleFeedVisited);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(postsChannel);
    };
  }, [userId, isVisitor, refetch, queryClient]);

  // Return empty badges for visitors
  if (isVisitor) {
    return {
      badges: EMPTY_BADGES,
      isLoading: false,
      refetch,
    };
  }

  return {
    badges: badges || EMPTY_BADGES,
    isLoading,
    refetch,
  };
}
