import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlayerStats {
  elo_rating: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  games_drawn: number;
  total_moves: number;
  longest_winning_streak: number;
  current_winning_streak: number;
  avg_time_per_move: number | null;
}

interface GameHistory {
  id: string;
  result: string;
  difficulty: string;
  moves_count: number;
  elo_change: number;
  created_at: string;
}

interface Achievement {
  id: string;
  achievement_key: string;
  achievement_name: string;
  achievement_description: string | null;
  icon: string | null;
  earned_at: string;
}

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  { key: 'first_win', name: 'Première Victoire', description: 'Gagner votre première partie', icon: '🏆', condition: (stats: PlayerStats) => stats.games_won >= 1 },
  { key: 'streak_3', name: 'Série de 3', description: 'Gagner 3 parties consécutives', icon: '🔥', condition: (stats: PlayerStats) => stats.longest_winning_streak >= 3 },
  { key: 'streak_5', name: 'Série de 5', description: 'Gagner 5 parties consécutives', icon: '⚡', condition: (stats: PlayerStats) => stats.longest_winning_streak >= 5 },
  { key: 'tactician', name: 'Tacticien', description: 'Atteindre 1000 ELO', icon: '🎯', condition: (stats: PlayerStats) => stats.elo_rating >= 1000 },
  { key: 'strategist', name: 'Stratège', description: 'Atteindre 1200 ELO', icon: '🧠', condition: (stats: PlayerStats) => stats.elo_rating >= 1200 },
  { key: 'expert', name: 'Expert', description: 'Atteindre 1400 ELO', icon: '💪', condition: (stats: PlayerStats) => stats.elo_rating >= 1400 },
  { key: 'moves_100', name: 'Apprenti', description: 'Jouer 100 coups au total', icon: '♟️', condition: (stats: PlayerStats) => stats.total_moves >= 100 },
  { key: 'moves_500', name: 'Praticien', description: 'Jouer 500 coups au total', icon: '🎮', condition: (stats: PlayerStats) => stats.total_moves >= 500 },
  { key: 'games_10', name: 'Régulier', description: 'Jouer 10 parties', icon: '📚', condition: (stats: PlayerStats) => stats.games_played >= 10 },
  { key: 'games_50', name: 'Dévoué', description: 'Jouer 50 parties', icon: '⭐', condition: (stats: PlayerStats) => stats.games_played >= 50 },
];

export const useChessStats = (userId: string | null) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentGames, setRecentGames] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentEloChange, setRecentEloChange] = useState<number>(0);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Run all queries in parallel for better 3G performance
      const [statsResult, achievementsResult, gamesResult] = await Promise.all([
        supabase
          .from('chess_player_stats')
          .select('*')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('chess_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false }),
        supabase
          .from('chess_games')
          .select('id, result, difficulty, moves_count, elo_change, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      setStats(statsResult.data);
      setAchievements(achievementsResult.data || []);
      setRecentGames((gamesResult.data || []) as GameHistory[]);

      // Calculate recent ELO change (from last game)
      if (gamesResult.data && gamesResult.data.length > 0) {
        setRecentEloChange(gamesResult.data[0].elo_change || 0);
      }
    } catch (error) {
      console.error('Error fetching chess stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initialize stats for new users
  const initializeStats = useCallback(async () => {
    if (!userId) return null;

    try {
      // Check if stats exist
      const { data: existing } = await supabase
        .from('chess_player_stats')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) return existing;

      // Create initial stats
      const { data: newStats, error } = await supabase
        .from('chess_player_stats')
        .insert({
          user_id: userId,
          elo_rating: 1000,
          games_played: 0,
          games_won: 0,
          games_lost: 0,
          games_drawn: 0,
          total_moves: 0,
          current_winning_streak: 0,
          longest_winning_streak: 0
        })
        .select()
        .single();

      if (error) throw error;
      
      setStats(newStats);
      return newStats;
    } catch (error) {
      console.error('Error initializing stats:', error);
      return null;
    }
  }, [userId]);

  // Check and award achievements
  const checkAchievements = useCallback(async (currentStats: PlayerStats) => {
    if (!userId) return;

    const earnedKeys = achievements.map(a => a.achievement_key);
    const newAchievements: typeof ACHIEVEMENT_DEFINITIONS = [];

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (!earnedKeys.includes(achievement.key) && achievement.condition(currentStats)) {
        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length === 0) return;

    // Insert new achievements (using upsert to handle duplicates safely)
    for (const achievement of newAchievements) {
      try {
        const { error } = await supabase.from('chess_achievements').upsert({
          user_id: userId,
          achievement_key: achievement.key,
          achievement_name: achievement.name,
          achievement_description: achievement.description,
          icon: achievement.icon
        }, {
          onConflict: 'user_id,achievement_key',
          ignoreDuplicates: true
        });

        if (!error) {
          // Show toast notification only for genuinely new achievements
          toast({
            title: "🏅 Nouveau badge débloqué!",
            description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          });
        }
      } catch (error) {
        console.error('Error awarding achievement:', error);
      }
    }

    // Refresh achievements
    fetchStats();
  }, [userId, achievements, toast, fetchStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    achievements,
    recentGames,
    isLoading,
    recentEloChange,
    fetchStats,
    initializeStats,
    checkAchievements
  };
};

export type { PlayerStats, GameHistory, Achievement };
