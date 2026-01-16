import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useBattleStats = (userId: string | null) => {
  const [stats, setStats] = useState<BattleStats | null>(null);
  const [badges, setBadges] = useState<BattleBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch stats
        const { data: statsData, error: statsError } = await supabase
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
          setStats(newStats);
        } else {
          setStats(statsData);
        }

        // Fetch badges
        const { data: badgesData, error: badgesError } = await supabase
          .from('quiz_battle_badges')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false });

        if (badgesError) throw badgesError;
        setBadges(badgesData || []);

      } catch (err) {
        console.error('Error fetching battle stats:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const refreshStats = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('quiz_battle_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setStats(data);
    }
  };

  const refreshBadges = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('quiz_battle_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (!error) {
      setBadges(data || []);
    }
  };

  return {
    stats,
    badges,
    isLoading,
    error,
    refreshStats,
    refreshBadges,
  };
};
