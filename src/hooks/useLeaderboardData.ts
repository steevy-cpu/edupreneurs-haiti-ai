import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  clearPersistedCache,
  CACHE_KEYS 
} from "@/utils/queryPersistence";
import { FOUNDER_USER_IDS } from "@/lib/founderConstants";
import { getStaleTimeFor } from "@/utils/networkAwareCache";

export interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  currentUserRank: number | null;
}

const fetchLeaderboardData = async (currentUserId: string | null): Promise<LeaderboardData> => {
  // Use RPC function to bypass RLS complexity
  const { data: topUsers, error } = await supabase
    .rpc('get_leaderboard_profiles', { limit_count: 20 });

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return { leaderboard: [], currentUserRank: null };
  }

  // Filter out founders and add rank to each user
  const rankedUsers = topUsers
    ?.filter((u: any) => !FOUNDER_USER_IDS.includes(u.user_id))
    .slice(0, 10)
    .map((u: any, index: number) => ({
      ...u,
      full_name: u.nickname || "Étudiant",
      rank: index + 1,
    })) || [];

  // Find current user's rank
  let currentUserRank: number | null = null;
  if (currentUserId) {
    const allRanked = topUsers
      ?.filter((u: any) => !FOUNDER_USER_IDS.includes(u.user_id)) || [];
    const userRankIndex = allRanked.findIndex((u: any) => u.user_id === currentUserId);
    if (userRankIndex !== -1) {
      currentUserRank = userRankIndex + 1;
    }
  }

  const result: LeaderboardData = {
    leaderboard: rankedUsers,
    currentUserRank,
  };

  // Persist to localStorage for instant loading
  persistQueryData(CACHE_KEYS.LEADERBOARD, result);

  return result;
};

export const useLeaderboardData = (currentUserId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["leaderboard-data", currentUserId],
    queryFn: () => fetchLeaderboardData(currentUserId),
    staleTime: getStaleTimeFor('leaderboard'), // Network-aware stale time
    gcTime: 1000 * 60 * 30, // Cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Initialize with persisted data for instant loading
    initialData: () => getPersistedQueryData<LeaderboardData>(CACHE_KEYS.LEADERBOARD) || undefined,
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.LEADERBOARD),
  });

  const refreshLeaderboard = () => {
    clearPersistedCache(CACHE_KEYS.LEADERBOARD);
    queryClient.invalidateQueries({ queryKey: ["leaderboard-data"] });
  };

  return {
    leaderboard: query.data?.leaderboard || [],
    currentUserRank: query.data?.currentUserRank || null,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refreshLeaderboard,
    refetch: query.refetch,
  };
};

// Prefetch hook for route preloading
export const usePrefetchLeaderboard = () => {
  const queryClient = useQueryClient();

  const prefetchLeaderboard = (userId: string | null) => {
    queryClient.prefetchQuery({
      queryKey: ["leaderboard-data", userId],
      queryFn: () => fetchLeaderboardData(userId),
      staleTime: getStaleTimeFor('leaderboard'),
    });
  };

  return { prefetchLeaderboard };
};
