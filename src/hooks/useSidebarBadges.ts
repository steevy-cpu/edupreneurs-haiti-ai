import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useVisitor } from "@/contexts/VisitorContext";
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  CACHE_KEYS 
} from "@/utils/queryPersistence";
import { getStaleTimeFor } from "@/utils/networkAwareCache";
import type { RealtimeChannel } from "@supabase/supabase-js";

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

  const result: SidebarBadges = {
    unreadMessages: messagesResult.data?.length || 0,
    pendingFollowRequests: followsResult.count || 0,
    unreadNotifications: notifsResult.count || 0,
    unreadFeedPosts: feedResult.data || 0,
  };

  // Persist to localStorage for instant rendering on next load
  persistQueryData(CACHE_KEYS.SIDEBAR_BADGES, result);

  return result;
}

export function useSidebarBadges(userId?: string | null) {
  const { isVisitor } = useVisitor();
  const queryClient = useQueryClient();
  
  // Use useRef instead of global window object for channel storage
  const channelsRef = useRef<{
    messagesChannel?: RealtimeChannel;
    followsChannel?: RealtimeChannel;
    notificationsChannel?: RealtimeChannel;
    postsChannel?: RealtimeChannel;
  } | null>(null);

  const { data: badges, isLoading, refetch } = useQuery({
    queryKey: ['sidebar-badges', userId],
    queryFn: () => fetchSidebarBadges(userId!),
    staleTime: getStaleTimeFor('notifications'), // Network-aware caching
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!userId && !isVisitor,
    // Initialize from localStorage for instant badge rendering
    initialData: () => getPersistedQueryData<SidebarBadges>(CACHE_KEYS.SIDEBAR_BADGES) || undefined,
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.SIDEBAR_BADGES),
  });

  // Optimistic update helper with persistence
  const updateBadge = useCallback((key: keyof SidebarBadges, delta: number) => {
    queryClient.setQueryData(['sidebar-badges', userId], (old: SidebarBadges | undefined) => {
      if (!old) return EMPTY_BADGES;
      const updated = { ...old, [key]: Math.max(0, old[key] + delta) };
      persistQueryData(CACHE_KEYS.SIDEBAR_BADGES, updated);
      return updated;
    });
  }, [queryClient, userId]);

  // Set up realtime subscriptions for badge updates - DEFERRED by 3 seconds
  // to reduce initial load contention on 3G connections
  useEffect(() => {
    if (!userId || isVisitor) return;

    // Listen for feed visited event to clear badge immediately (no delay needed)
    const handleFeedVisited = () => {
      queryClient.setQueryData(['sidebar-badges', userId], (old: SidebarBadges | undefined) => {
        if (!old) return EMPTY_BADGES;
        const updated = { ...old, unreadFeedPosts: 0 };
        persistQueryData(CACHE_KEYS.SIDEBAR_BADGES, updated);
        return updated;
      });
    };
    window.addEventListener('feed-visited', handleFeedVisited);

    // Delay realtime subscriptions to prioritize initial render
    const subscriptionDelay = setTimeout(() => {
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

      // Store channels in ref for cleanup
      channelsRef.current = {
        messagesChannel,
        followsChannel,
        notificationsChannel,
        postsChannel
      };
    }, 3000); // 3 second delay - user won't notice badge updates during initial load

    return () => {
      window.removeEventListener('feed-visited', handleFeedVisited);
      clearTimeout(subscriptionDelay);
      
      // Clean up channels if they were created
      if (channelsRef.current) {
        supabase.removeChannel(channelsRef.current.messagesChannel!);
        supabase.removeChannel(channelsRef.current.followsChannel!);
        supabase.removeChannel(channelsRef.current.notificationsChannel!);
        supabase.removeChannel(channelsRef.current.postsChannel!);
        channelsRef.current = null;
      }
    };
  }, [userId, isVisitor, refetch, queryClient]);

  // Return empty badges for visitors
  if (isVisitor) {
    return {
      badges: EMPTY_BADGES,
      isLoading: false,
      refetch,
      incrementMessages: () => {},
      decrementMessages: () => {},
      incrementNotifications: () => {},
      decrementNotifications: () => {},
      incrementFollowRequests: () => {},
      decrementFollowRequests: () => {},
      clearFeedBadge: () => {},
    };
  }

  return {
    badges: badges || EMPTY_BADGES,
    isLoading,
    refetch,
    // Optimistic update functions
    incrementMessages: () => updateBadge('unreadMessages', 1),
    decrementMessages: () => updateBadge('unreadMessages', -1),
    incrementNotifications: () => updateBadge('unreadNotifications', 1),
    decrementNotifications: () => updateBadge('unreadNotifications', -1),
    incrementFollowRequests: () => updateBadge('pendingFollowRequests', 1),
    decrementFollowRequests: () => updateBadge('pendingFollowRequests', -1),
    clearFeedBadge: () => updateBadge('unreadFeedPosts', -(badges?.unreadFeedPosts || 0)),
  };
}
