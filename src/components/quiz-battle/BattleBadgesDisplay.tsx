import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Award, Lock } from 'lucide-react';
import type { BattleBadge } from '@/hooks/useBattleStats';
import { cn } from '@/lib/utils';

interface BattleBadgesDisplayProps {
  badges: BattleBadge[];
  isLoading: boolean;
}

// All available badges with their requirements
const ALL_BADGES = [
  { key: 'first_battle', name: 'Première Bataille', icon: '⚔️', description: 'Complète ton premier quiz' },
  { key: 'perfect_game', name: 'Perfectionniste', icon: '🎯', description: '100% sur un quiz' },
  { key: 'streak_3', name: 'En Forme', icon: '🔥', description: '3 victoires consécutives' },
  { key: 'streak_5', name: 'Imbattable', icon: '💪', description: '5 victoires consécutives' },
  { key: 'streak_10', name: 'Légende', icon: '👑', description: '10 victoires consécutives' },
  { key: 'speed_demon', name: 'Éclair', icon: '⚡', description: 'Réponds en moins de 3s' },
  { key: 'math_expert', name: 'Expert Maths', icon: '🧮', description: '50 bonnes réponses en Maths' },
  { key: 'science_master', name: 'Maître Sciences', icon: '🔬', description: '50 bonnes réponses en Sciences' },
  { key: 'language_pro', name: 'Polyglotte', icon: '🌍', description: 'Quiz réussi en 3 langues' },
  { key: 'social_butterfly', name: 'Social', icon: '🤝', description: '10 parties multijoueur' },
  { key: 'weekly_champion', name: 'Champion Hebdo', icon: '🏆', description: 'Top 3 du classement' },
  { key: 'dedication', name: 'Dévoué', icon: '📚', description: '50 parties jouées' },
];

export const BattleBadgesDisplay = ({ badges, isLoading }: BattleBadgesDisplayProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadgeKeys = new Set(badges.map(b => b.badge_key));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-accent" />
          Badges ({badges.length}/{ALL_BADGES.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedBadgeKeys.has(badge.key);
            const earnedBadge = badges.find(b => b.badge_key === badge.key);

            return (
              <div
                key={badge.key}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg text-center transition-all",
                  isEarned 
                    ? "bg-gradient-to-br from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20" 
                    : "bg-muted/30 opacity-50"
                )}
                title={isEarned ? `${badge.name} - ${badge.description}` : `🔒 ${badge.description}`}
              >
                <span className={cn("text-2xl", !isEarned && "grayscale")}>
                  {isEarned ? badge.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
                </span>
                <span className="text-[10px] font-medium mt-1 line-clamp-1">
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>
        
        {badges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Joue des quiz pour gagner des badges! 🎮
          </p>
        )}
      </CardContent>
    </Card>
  );
};
