import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Crown, Medal, ArrowLeft, Zap, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOUNDER_USER_IDS, calculateLevel } from '@/lib/quizBattleUtils';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  total_xp: number;
  level: number;
  battles_won: number;
  total_battles: number;
  nickname?: string;
  avatar_url?: string;
  avg_response_time_ms?: number | null;
}

const QuizBattleLeaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const getDateFilter = (timeFilter: TimeFilter): string | null => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return today.toISOString();
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const dateFrom = getDateFilter(filter);
        
        if (filter === 'all' || !dateFrom) {
          // Use quiz_battle_stats directly for all-time
          const { data: stats, error } = await supabase
            .from('quiz_battle_stats')
            .select('user_id, total_xp, level, battles_won, total_battles, avg_response_time_ms')
            .order('total_xp', { ascending: false })
            .limit(200);

          if (error) throw error;

          if (stats && stats.length > 0) {
            await processAndDisplayStats(stats);
          } else {
            setEntries([]);
          }
        } else {
          // For time-filtered results, calculate XP from recent battles
          const { data: battles, error } = await supabase
            .from('quiz_battles')
            .select(`
              id,
              created_by,
              quiz_battle_players(user_id, score, correct_answers)
            `)
            .gte('created_at', dateFrom)
            .eq('status', 'completed');

          if (error) throw error;

          // Aggregate XP by user from battles in the period
          const userXpMap = new Map<string, { xp: number; wins: number; battles: number }>();
          
          battles?.forEach(battle => {
            battle.quiz_battle_players?.forEach((player: any) => {
              const current = userXpMap.get(player.user_id) || { xp: 0, wins: 0, battles: 0 };
              // Calculate XP: 10 points per correct answer + 20 bonus for good score
              const earnedXp = player.correct_answers * 10 + (player.score >= 70 ? 20 : 0);
              const isWin = player.score >= 70;
              userXpMap.set(player.user_id, {
                xp: current.xp + earnedXp,
                wins: current.wins + (isWin ? 1 : 0),
                battles: current.battles + 1,
              });
            });
          });

          // Convert to array and sort
          const periodStats = Array.from(userXpMap.entries())
            .map(([user_id, data]) => ({
              user_id,
              total_xp: data.xp,
              battles_won: data.wins,
              total_battles: data.battles,
              avg_response_time_ms: null,
            }))
            .sort((a, b) => b.total_xp - a.total_xp)
            .slice(0, 100);

          if (periodStats.length > 0) {
            await processAndDisplayStats(periodStats);
          } else {
            setEntries([]);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const processAndDisplayStats = async (stats: any[]) => {
      // Filter out founders
      const filteredStats = stats.filter(s => !FOUNDER_USER_IDS.includes(s.user_id));

      // Fetch profiles for these users
      const userIds = filteredStats.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const enriched: LeaderboardEntry[] = filteredStats.map((s, index) => ({
        rank: index + 1,
        user_id: s.user_id,
        total_xp: s.total_xp,
        level: calculateLevel(s.total_xp),
        battles_won: s.battles_won,
        total_battles: s.total_battles,
        avg_response_time_ms: s.avg_response_time_ms,
        nickname: profileMap.get(s.user_id)?.nickname,
        avatar_url: profileMap.get(s.user_id)?.avatar_url,
      }));

      setEntries(enriched);

      // Find current user's rank
      if (currentUserId) {
        const userEntry = enriched.find(e => e.user_id === currentUserId);
        if (userEntry) {
          setCurrentUserRank(userEntry.rank);
        } else {
          setCurrentUserRank(null);
        }
      }
    };

    fetchLeaderboard();
  }, [filter, currentUserId]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: 
        return {
          icon: <Crown className="w-6 h-6 text-yellow-500" />,
          bg: 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent border-yellow-500/30',
          textColor: 'text-yellow-600 dark:text-yellow-400',
        };
      case 2: 
        return {
          icon: <Medal className="w-6 h-6 text-gray-400" />,
          bg: 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-transparent border-gray-400/30',
          textColor: 'text-gray-600 dark:text-gray-300',
        };
      case 3: 
        return {
          icon: <Medal className="w-6 h-6 text-amber-600" />,
          bg: 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-amber-500/30',
          textColor: 'text-amber-700 dark:text-amber-400',
        };
      default: 
        return {
          icon: null,
          bg: 'bg-muted/30 border-transparent',
          textColor: 'text-muted-foreground',
        };
    }
  };

  const formatTime = (ms: number | null | undefined) => {
    if (!ms) return '-';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const filterButtons: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: 'Tout temps' },
    { key: 'month', label: 'Ce mois' },
    { key: 'week', label: 'Cette semaine' },
    { key: 'today', label: 'Aujourd\'hui' },
  ];

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/quiz-battle')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PageHeader
            title="Classement Quiz Battle"
            subtitle="Les meilleurs joueurs de quiz"
            icon={<Trophy className="w-8 h-8 text-accent" />}
          />
        </div>

        {/* Time filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <Button
              key={btn.key}
              variant={filter === btn.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(btn.key)}
              className="whitespace-nowrap"
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {/* Current user position */}
        {currentUserRank && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ta position</span>
                <span className="font-bold text-primary text-xl">#{currentUserRank}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 podium */}
        {!isLoading && entries.length >= 3 && (
          <div className="flex justify-center items-end gap-2 py-4">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
              <Avatar className="h-14 w-14 border-2 border-gray-400">
                <AvatarImage src={entries[1]?.avatar_url || undefined} />
                <AvatarFallback>{entries[1]?.nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-gray-400 text-white rounded-t-lg px-6 py-2 mt-2 text-center">
                <Medal className="w-5 h-5 mx-auto mb-1" />
                <p className="text-xs font-medium truncate max-w-[80px]">{entries[1]?.nickname}</p>
                <p className="text-sm font-bold">{entries[1]?.total_xp} XP</p>
              </div>
              <div className="bg-gray-400/80 w-full h-16 rounded-b-lg"></div>
            </div>

            {/* 1st place */}
            <div className="flex flex-col items-center -mt-4">
              <Avatar className="h-16 w-16 border-2 border-yellow-500 ring-2 ring-yellow-300">
                <AvatarImage src={entries[0]?.avatar_url || undefined} />
                <AvatarFallback>{entries[0]?.nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-yellow-500 text-white rounded-t-lg px-8 py-2 mt-2 text-center">
                <Crown className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs font-medium truncate max-w-[80px]">{entries[0]?.nickname}</p>
                <p className="text-sm font-bold">{entries[0]?.total_xp} XP</p>
              </div>
              <div className="bg-yellow-500/80 w-full h-24 rounded-b-lg"></div>
            </div>

            {/* 3rd place */}
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 border-2 border-amber-600">
                <AvatarImage src={entries[2]?.avatar_url || undefined} />
                <AvatarFallback>{entries[2]?.nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="bg-amber-600 text-white rounded-t-lg px-5 py-2 mt-2 text-center">
                <Medal className="w-4 h-4 mx-auto mb-1" />
                <p className="text-xs font-medium truncate max-w-[70px]">{entries[2]?.nickname}</p>
                <p className="text-sm font-bold">{entries[2]?.total_xp} XP</p>
              </div>
              <div className="bg-amber-600/80 w-full h-12 rounded-b-lg"></div>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        <Card>
          <CardContent className="p-4 space-y-2">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Aucun joueur pour le moment</p>
                <p className="text-muted-foreground">Sois le premier à jouer!</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/quiz-battle/solo')}
                >
                  Jouer maintenant
                </Button>
              </div>
            ) : (
              entries.map((entry) => {
                const rankStyle = getRankStyle(entry.rank);
                const isCurrentUser = entry.user_id === currentUserId;
                
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      rankStyle.bg,
                      isCurrentUser && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    {/* Rank */}
                    <div className={cn(
                      "flex items-center justify-center w-10 font-bold text-lg",
                      rankStyle.textColor
                    )}>
                      {rankStyle.icon || `#${entry.rank}`}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="text-sm">
                        {entry.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isCurrentUser && "text-primary"
                      )}>
                        {entry.nickname || 'Joueur'} {isCurrentUser && '(toi)'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Niv. {entry.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {entry.battles_won} victoires
                        </span>
                        {entry.avg_response_time_ms && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.avg_response_time_ms)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="font-bold text-primary">{entry.total_xp}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QuizBattleLeaderboard;
