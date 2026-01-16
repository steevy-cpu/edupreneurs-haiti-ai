import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Medal, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  level: number;
  battles_won: number;
  nickname?: string;
  avatar_url?: string;
}

export const BattleLeaderboardPreview = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: stats, error } = await supabase
          .from('quiz_battle_stats')
          .select('user_id, total_xp, level, battles_won')
          .order('total_xp', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (stats && stats.length > 0) {
          // Fetch profiles for these users
          const userIds = stats.map(s => s.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, nickname, avatar_url')
            .in('user_id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
          
          const enriched = stats.map(s => ({
            ...s,
            nickname: profileMap.get(s.user_id)?.nickname,
            avatar_url: profileMap.get(s.user_id)?.avatar_url,
          }));

          setEntries(enriched);
        }
      } catch (error) {
        console.error('Error fetching battle leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-amber-600/5';
      default: return 'bg-muted/30';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-accent" />
          Classement Quiz Battle
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/quiz-battle/leaderboard')}
          className="text-primary"
        >
          Voir tout
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucun joueur pour le moment</p>
            <p className="text-sm text-muted-foreground">Sois le premier à jouer!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]",
                  getRankBg(index + 1)
                )}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {entry.nickname?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.nickname || 'Joueur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Niveau {entry.level} • {entry.battles_won} victoires
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{entry.total_xp}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
