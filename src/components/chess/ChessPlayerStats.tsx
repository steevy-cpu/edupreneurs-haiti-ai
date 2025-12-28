import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp, 
  Gamepad2,
  Award,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface ChessPlayerStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChessPlayerStats: React.FC<ChessPlayerStatsProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: statsData } = await supabase
        .from('chess_player_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: achievementsData } = await supabase
        .from('chess_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setStats(statsData);
      setAchievements(achievementsData || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEloLevel = (elo: number): { name: string; color: string; icon: string } => {
    if (elo < 600) return { name: 'Débutant', color: 'text-slate-500', icon: '🌱' };
    if (elo < 800) return { name: 'Apprenti', color: 'text-green-500', icon: '📚' };
    if (elo < 1000) return { name: 'Joueur', color: 'text-blue-500', icon: '♟️' };
    if (elo < 1200) return { name: 'Tacticien', color: 'text-purple-500', icon: '🎯' };
    if (elo < 1400) return { name: 'Stratège', color: 'text-orange-500', icon: '🧠' };
    if (elo < 1600) return { name: 'Expert', color: 'text-red-500', icon: '💪' };
    return { name: 'Maître', color: 'text-yellow-500', icon: '👑' };
  };

  const winRate = stats && stats.games_played > 0 
    ? Math.round((stats.games_won / stats.games_played) * 100) 
    : 0;

  const eloLevel = stats ? getEloLevel(stats.elo_rating) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Mes Statistiques d'Échecs
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !stats ? (
          <div className="text-center py-8 space-y-2">
            <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Joue ta première partie pour voir tes stats!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ELO Rating */}
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
              <div className="text-4xl font-bold text-primary mb-1">
                {stats.elo_rating}
              </div>
              <div className={`flex items-center justify-center gap-1 ${eloLevel?.color}`}>
                <span>{eloLevel?.icon}</span>
                <span className="font-medium">{eloLevel?.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Score ELO</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Gamepad2 className="w-4 h-4 text-blue-500" />
                  <span className="text-lg font-bold">{stats.games_played}</span>
                </div>
                <p className="text-xs text-muted-foreground">Parties jouées</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-lg font-bold">{winRate}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Taux de victoire</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-lg font-bold">{stats.current_winning_streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Série actuelle</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold">{stats.longest_winning_streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Meilleure série</p>
              </div>
            </div>

            {/* Win/Loss/Draw Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-500">✓ {stats.games_won}</span>
                <span className="text-muted-foreground">= {stats.games_drawn}</span>
                <span className="text-red-500">✗ {stats.games_lost}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                <div 
                  className="bg-green-500 transition-all"
                  style={{ width: `${stats.games_played > 0 ? (stats.games_won / stats.games_played) * 100 : 0}%` }}
                />
                <div 
                  className="bg-muted-foreground transition-all"
                  style={{ width: `${stats.games_played > 0 ? (stats.games_drawn / stats.games_played) * 100 : 0}%` }}
                />
                <div 
                  className="bg-red-500 transition-all"
                  style={{ width: `${stats.games_played > 0 ? (stats.games_lost / stats.games_played) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  Badges ({achievements.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {achievements.slice(0, 6).map((achievement) => (
                    <Badge 
                      key={achievement.id} 
                      variant="secondary"
                      className="gap-1"
                    >
                      <span>{achievement.icon}</span>
                      {achievement.achievement_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Total Moves */}
            <div className="text-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 inline-block mr-1" />
              {stats.total_moves} coups joués au total
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChessPlayerStats;
