import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  clearPersistedCache,
  CACHE_KEYS 
} from "@/utils/queryPersistence";
import { getStaleTimeFor } from "@/utils/networkAwareCache";

interface NotificationSummary {
  unreadCount: number;
  lastCheckedAt: number;
}

const fetchNotificationSummary = async (userId: string): Promise<NotificationSummary> => {
  // Only fetch unread count for efficiency
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;

  const result: NotificationSummary = {
    unreadCount: count || 0,
    lastCheckedAt: Date.now(),
  };

  // Persist for instant badge rendering
  persistQueryData(CACHE_KEYS.NOTIFICATIONS, result);

  return result;
};

export const useNotificationsData = (userId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications-summary', userId],
    queryFn: () => fetchNotificationSummary(userId!),
    staleTime: getStaleTimeFor('notifications'),
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!userId,
    initialData: () => getPersistedQueryData<NotificationSummary>(CACHE_KEYS.NOTIFICATIONS) || undefined,
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.NOTIFICATIONS),
  });

  const refreshNotifications = () => {
    clearPersistedCache(CACHE_KEYS.NOTIFICATIONS);
    queryClient.invalidateQueries({ queryKey: ['notifications-summary'] });
  };

  // Optimistically update count when a notification is read
  const decrementUnread = () => {
    queryClient.setQueryData(['notifications-summary', userId], (old: NotificationSummary | undefined) => {
      if (!old) return old;
      const updated = { ...old, unreadCount: Math.max(0, old.unreadCount - 1) };
      persistQueryData(CACHE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
  };

  // Optimistically update count when a new notification arrives
  const incrementUnread = () => {
    queryClient.setQueryData(['notifications-summary', userId], (old: NotificationSummary | undefined) => {
      if (!old) return { unreadCount: 1, lastCheckedAt: Date.now() };
      const updated = { ...old, unreadCount: old.unreadCount + 1 };
      persistQueryData(CACHE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
  };

  // Mark all as read
  const clearUnread = () => {
    queryClient.setQueryData(['notifications-summary', userId], (old: NotificationSummary | undefined) => {
      if (!old) return old;
      const updated = { ...old, unreadCount: 0 };
      persistQueryData(CACHE_KEYS.NOTIFICATIONS, updated);
      return updated;
    });
  };

  return {
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    error: query.error,
    refreshNotifications,
    decrementUnread,
    incrementUnread,
    clearUnread,
  };
};

// Prefetch hook for route preloading
export const usePrefetchNotifications = () => {
  const queryClient = useQueryClient();

  const prefetchNotifications = (userId: string | null) => {
    if (!userId) return;
    queryClient.prefetchQuery({
      queryKey: ['notifications-summary', userId],
      queryFn: () => fetchNotificationSummary(userId),
      staleTime: getStaleTimeFor('notifications'),
    });
  };

  return { prefetchNotifications };
};
