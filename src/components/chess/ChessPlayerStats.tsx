import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp, 
  Gamepad2,
  Award,
  History,
  CheckCircle,
  XCircle,
  Minus,
  Lock,
  UserPlus,
  Users
} from 'lucide-react';
import { getEloLevel } from './ChessEloWidget';
import type { PlayerStats, GameHistory, Achievement } from '@/hooks/useChessStats';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNavigate } from 'react-router-dom';

interface ChessPlayerStatsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats | null;
  achievements: Achievement[];
  recentGames: GameHistory[];
  isLoading: boolean;
  isVisitor?: boolean;
}

const ChessPlayerStats: React.FC<ChessPlayerStatsProps> = ({ 
  isOpen, 
  onClose, 
  stats, 
  achievements, 
  recentGames, 
  isLoading,
  isVisitor = false
}) => {
  const { exitVisitorMode } = useVisitor();
  const navigate = useNavigate();
  
  const winRate = stats && stats.games_played > 0 
    ? Math.round((stats.games_won / stats.games_played) * 100) 
    : 0;

  const eloLevel = stats ? getEloLevel(stats.elo_rating) : null;

  const getResultIcon = (result: string) => {
    if (result === 'win') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (result === 'loss') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getResultText = (result: string) => {
    if (result === 'win') return 'Victoire';
    if (result === 'loss') return 'Défaite';
    return 'Nul';
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🎯';
      case 'advanced': return '💪';
      case 'expert': return '🏆';
      default: return '♟️';
    }
  };

  const handleSignup = () => {
    onClose();
    exitVisitorMode();
    navigate('/auth');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Mes Statistiques d'Échecs
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          {isVisitor ? (
            <div className="text-center py-8 space-y-4">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <p className="font-medium">Statistiques réservées aux membres</p>
                <p className="text-sm text-muted-foreground">
                  Créez un compte gratuit pour sauvegarder vos parties et suivre votre progression!
                </p>
              </div>
              <Button onClick={handleSignup} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Créer un compte
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !stats ? (
            <div className="text-center py-8 space-y-2">
              <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Joue ta première partie pour voir tes stats!</p>
            </div>
          ) : (
            <div className="space-y-5">
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
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Gamepad2 className="w-4 h-4 text-blue-500" />
                    <span className="text-base sm:text-lg font-bold">{stats.games_played}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Parties jouées</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-base sm:text-lg font-bold">{winRate}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Taux de victoire</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-base sm:text-lg font-bold">{stats.current_winning_streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Série actuelle</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-base sm:text-lg font-bold">{stats.longest_winning_streak}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Meilleure série</p>
                </div>
              </div>

              {/* Win/Loss/Draw Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-500 font-medium">✓ {stats.games_won}</span>
                  <span className="text-muted-foreground">= {stats.games_drawn}</span>
                  <span className="text-red-500 font-medium">✗ {stats.games_lost}</span>
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

              {/* Recent Games */}
              {recentGames.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1.5 text-sm">
                    <History className="w-4 h-4 text-primary" />
                    Parties récentes
                  </h4>
                  <div className="space-y-1.5">
                    {recentGames.map((game) => (
                      <div 
                        key={game.id} 
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {getResultIcon(game.result)}
                          <span className="font-medium">{getResultText(game.result)}</span>
                          <span className="text-muted-foreground text-xs">
                            {game.is_multiplayer ? (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                vs {game.opponent_nickname || 'Joueur'}
                              </span>
                            ) : (
                              <>{getDifficultyEmoji(game.difficulty)} {game.moves_count} coups</>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {game.is_multiplayer && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              PvP
                            </Badge>
                          )}
                          <span className={`text-xs font-medium ${game.elo_change > 0 ? 'text-green-500' : game.elo_change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {game.elo_change > 0 ? '+' : ''}{game.elo_change}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(game.created_at), 'dd MMM', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-1.5 text-sm">
                    <Award className="w-4 h-4 text-primary" />
                    Badges ({achievements.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {achievements.map((achievement) => (
                      <Badge 
                        key={achievement.id} 
                        variant="secondary"
                        className="gap-1 text-xs"
                        title={achievement.achievement_description || ''}
                      >
                        <span>{achievement.icon}</span>
                        {achievement.achievement_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Moves */}
              <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                <TrendingUp className="w-4 h-4 inline-block mr-1" />
                {stats.total_moves} coups joués au total
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChessPlayerStats;
