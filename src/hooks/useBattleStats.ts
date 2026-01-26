import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { 
  persistQueryData, 
  getPersistedQueryData, 
  getPersistedCacheTimestamp,
  clearPersistedCache,
  CACHE_KEYS 
} from "@/utils/queryPersistence";
import { getStaleTimeFor } from "@/utils/networkAwareCache";

export interface BattleStats {
  id: string;
  user_id: string;
  total_battles: number;
  solo_battles: number;
  multi_battles: number;
  battles_won: number;
  battles_lost: number;
  battles_drawn: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  rank_points: number;
  total_correct_answers: number;
  total_questions_answered: number;
  avg_response_time_ms: number | null;
  perfect_games: number;
}

export interface BattleBadge {
  id: string;
  user_id: string;
  badge_key: string;
  badge_name: string;
  description: string | null;
  icon: string;
  subject_id: string | null;
  earned_at: string;
}

interface BattleData {
  stats: BattleStats | null;
  badges: BattleBadge[];
}

const fetchBattleData = async (userId: string): Promise<BattleData> => {
  // Fetch stats
  let { data: statsData, error: statsError } = await supabase
    .from('quiz_battle_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (statsError) throw statsError;

  // If no stats exist, create initial stats
  if (!statsData) {
    const { data: newStats, error: insertError } = await supabase
      .from('quiz_battle_stats')
      .insert({ user_id: userId })
      .select()
      .single();

    if (insertError) throw insertError;
    statsData = newStats;
  }

  // Fetch badges
  const { data: badgesData, error: badgesError } = await supabase
    .from('quiz_battle_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (badgesError) throw badgesError;

  const result: BattleData = {
    stats: statsData,
    badges: badgesData || [],
  };

  // Persist to localStorage for instant loading
  persistQueryData(CACHE_KEYS.BATTLE_STATS, result);

  return result;
};

export const useBattleStats = (userId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['battle-stats', userId],
    queryFn: () => fetchBattleData(userId!),
    staleTime: getStaleTimeFor('leaderboard'), // Use leaderboard timing (similar update frequency)
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!userId,
    // Initialize with persisted data for instant rendering
    initialData: () => {
      const cached = getPersistedQueryData<BattleData>(CACHE_KEYS.BATTLE_STATS);
      // Only use cache if it's for the same user
      if (cached && cached.stats?.user_id === userId) {
        return cached;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => getPersistedCacheTimestamp(CACHE_KEYS.BATTLE_STATS),
  });

  const refreshStats = () => {
    clearPersistedCache(CACHE_KEYS.BATTLE_STATS);
    queryClient.invalidateQueries({ queryKey: ['battle-stats', userId] });
  };

  const refreshBadges = () => {
    // Stats and badges are fetched together, so refresh both
    refreshStats();
  };

  return {
    stats: query.data?.stats || null,
    badges: query.data?.badges || [],
    isLoading: query.isLoading,
    error: query.error,
    refreshStats,
    refreshBadges,
  };
};
