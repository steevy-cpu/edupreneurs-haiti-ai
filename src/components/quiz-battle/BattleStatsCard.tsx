import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Trophy, Target, Zap, TrendingUp } from 'lucide-react';
import type { BattleStats } from '@/hooks/useBattleStats';

interface BattleStatsCardProps {
  stats: BattleStats | null;
  isLoading: boolean;
}

export const BattleStatsCard = ({ stats, isLoading }: BattleStatsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const level = stats?.level || 1;
  const currentXP = stats?.total_xp || 0;
  const xpForCurrentLevel = 100 * (level - 1) * (level - 1);
  const xpForNextLevel = 100 * level * level;
  const xpProgress = xpForNextLevel > xpForCurrentLevel 
    ? ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
    : 0;

  const winRate = stats?.total_battles && stats.total_battles > 0
    ? Math.round((stats.battles_won / stats.total_battles) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Tes Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Niveau {level}</span>
            <span className="text-muted-foreground">
              {currentXP} / {xpForNextLevel} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {xpForNextLevel - currentXP} XP pour le niveau {level + 1}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold">{stats?.battles_won || 0}</div>
            <div className="text-xs text-muted-foreground">Victoires</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold">{stats?.total_battles || 0}</div>
            <div className="text-xs text-muted-foreground">Parties</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Zap className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-lg font-bold">{stats?.longest_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Meilleure série</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
            <div className="text-lg font-bold">{winRate}%</div>
            <div className="text-xs text-muted-foreground">Taux de victoire</div>
          </div>
        </div>

        {/* Accuracy */}
        {stats?.total_questions_answered && stats.total_questions_answered > 0 && (
          <div className="text-center pt-2 border-t">
            <div className="text-sm text-muted-foreground">Précision globale</div>
            <div className="text-2xl font-bold text-primary">
              {Math.round((stats.total_correct_answers / stats.total_questions_answered) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {stats.total_correct_answers} / {stats.total_questions_answered} bonnes réponses
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
