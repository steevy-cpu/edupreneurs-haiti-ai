import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Crown, 
  Minus,
  RefreshCw, 
  Home, 
  Zap,
  Target,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BattleResult } from '@/pages/QuizBattleSolo';
import { useEffect } from 'react';
import { useEffect } from 'react';

interface OpponentProgress {
  score: number;
  correctAnswers: number;
  finished: boolean;
}

interface MultiplayerResultsProps {
  myResult: BattleResult;
  opponentResult: OpponentProgress | null;
  opponent: { id: string; nickname: string; avatar_url: string | null } | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const MultiplayerResults = ({
  myResult,
  opponentResult,
  opponent,
  onPlayAgain,
  onBackToMenu,
}: MultiplayerResultsProps) => {
  const myScore = myResult.score;
  const opponentScore = opponentResult?.score || 0;
  
  const isWinner = myScore > opponentScore;
  const isDraw = myScore === opponentScore;
  const isLoser = myScore < opponentScore;

  // XP bonus for multiplayer
  const multiplierBonus = isWinner ? 1.5 : (isDraw ? 1.2 : 1);
  const adjustedXp = Math.round(myResult.xpEarned * multiplierBonus);

  // Celebration animation for winner (simple CSS-based)
  useEffect(() => {
    if (isWinner) {
      // Could add confetti library later, for now just log
      console.log('Winner celebration!');
    }
  }, [isWinner]);

  const getResultMessage = () => {
    if (isWinner) return { text: 'Victoire! 🏆', color: 'text-success', bg: 'bg-success/10' };
    if (isDraw) return { text: 'Égalité! 🤝', color: 'text-accent', bg: 'bg-accent/10' };
    return { text: 'Défaite 😔', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const resultMessage = getResultMessage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Result header */}
      <Card className={cn("border-2 overflow-hidden", resultMessage.bg)}>
        <CardContent className="py-8 text-center">
          {isWinner && <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />}
          {isDraw && <Minus className="w-16 h-16 text-accent mx-auto mb-4" />}
          {isLoser && <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />}
          
          <h1 className={cn("text-3xl font-bold mb-2", resultMessage.color)}>
            {resultMessage.text}
          </h1>
          
          {isWinner && (
            <p className="text-muted-foreground">
              Tu as battu {opponent?.nickname || 'ton adversaire'}!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Score comparison */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* My score */}
            <div className={cn(
              "text-center p-4 rounded-xl",
              isWinner ? "bg-success/10 ring-2 ring-success" : "bg-muted"
            )}>
              <div className="text-4xl font-bold text-foreground">{myScore}%</div>
              <div className="text-sm text-muted-foreground mt-1">Toi</div>
              <div className="text-xs text-muted-foreground">
                {myResult.correctAnswers}/{myResult.totalQuestions}
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">VS</div>
            </div>

            {/* Opponent score */}
            <div className={cn(
              "text-center p-4 rounded-xl",
              isLoser ? "bg-success/10 ring-2 ring-success" : "bg-muted"
            )}>
              <Avatar className="h-10 w-10 mx-auto mb-2">
                <AvatarImage src={opponent?.avatar_url || undefined} />
                <AvatarFallback>{opponent?.nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="text-4xl font-bold text-foreground">{opponentScore}%</div>
              <div className="text-sm text-muted-foreground mt-1 truncate max-w-[80px] mx-auto">
                {opponent?.nickname || 'Adversaire'}
              </div>
              <div className="text-xs text-muted-foreground">
                {opponentResult?.correctAnswers || 0}/{myResult.totalQuestions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP earned */}
      <Card className={cn(isWinner && "border-yellow-500/50")}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isWinner ? "bg-yellow-500/20" : "bg-primary/20"
              )}>
                <Zap className={cn("w-6 h-6", isWinner ? "text-yellow-500" : "text-primary")} />
              </div>
              <div>
                <p className="font-medium">XP gagnés</p>
                <p className="text-xs text-muted-foreground">
                  {isWinner && "Bonus victoire x1.5"}
                  {isDraw && "Bonus égalité x1.2"}
                  {isLoser && "XP de base"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">+{adjustedXp}</div>
              {multiplierBonus > 1 && (
                <div className="text-xs text-muted-foreground line-through">
                  {myResult.xpEarned}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <Target className="w-6 h-6 text-primary mx-auto mb-1" />
          <div className="text-xl font-bold">{myResult.correctAnswers}</div>
          <div className="text-xs text-muted-foreground">Bonnes réponses</div>
        </Card>
        <Card className="p-4 text-center">
          <Star className="w-6 h-6 text-accent mx-auto mb-1" />
          <div className="text-xl font-bold">+{myResult.timeBonus}</div>
          <div className="text-xs text-muted-foreground">Bonus vitesse</div>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBackToMenu}
        >
          <Home className="w-4 h-4 mr-2" />
          Menu
        </Button>
        <Button
          className="flex-1"
          onClick={onPlayAgain}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Revanche
        </Button>
      </div>
    </div>
  );
};
