import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  RefreshCw, 
  Home, 
  Zap,
  Target,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BattleResult } from '@/pages/QuizBattleSolo';
import { useEffect } from 'react';

// Jude/Eric images for different result states
import judeCelebrating from '@/assets/eric-celebrating.png';
import judeThinking from '@/assets/eric-thinking-pose.png';
import judePointing from '@/assets/eric-pointing-left.png';

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
  // For real-time multiplayer, use roundsWon if available
  const myRoundsWon = myResult.roundsWon ?? myResult.correctAnswers;
  const opponentRoundsWon = myResult.opponentRoundsWon ?? (opponentResult?.correctAnswers || 0);
  
  // Determine winner based on rounds won (for synchronized mode) or score
  const isWinner = myResult.roundsWon !== undefined 
    ? myRoundsWon > opponentRoundsWon
    : myResult.score > (opponentResult?.score || 0);
  const isDraw = myResult.roundsWon !== undefined
    ? myRoundsWon === opponentRoundsWon
    : myResult.score === (opponentResult?.score || 0);
  const isLoser = !isWinner && !isDraw;

  // XP bonus for multiplayer
  const multiplierBonus = isWinner ? 1.5 : (isDraw ? 1.2 : 1);
  const adjustedXp = Math.round(myResult.xpEarned * multiplierBonus);

  // Celebration animation for winner (simple CSS-based)
  useEffect(() => {
    if (isWinner) {
      console.log('Winner celebration!');
    }
  }, [isWinner]);

  const getResultConfig = () => {
    if (isWinner) return { 
      text: 'Victoire!', 
      color: 'text-success', 
      bg: 'bg-gradient-to-br from-success/20 to-success/5',
      borderColor: 'border-success/50',
      image: judeCelebrating,
      subtitle: `Tu as battu ${opponent?.nickname || 'ton adversaire'}!`
    };
    if (isDraw) return { 
      text: 'Égalité!', 
      color: 'text-accent', 
      bg: 'bg-gradient-to-br from-accent/20 to-accent/5',
      borderColor: 'border-accent/50',
      image: judeThinking,
      subtitle: 'Match serré!'
    };
    return { 
      text: 'Défaite', 
      color: 'text-muted-foreground', 
      bg: 'bg-gradient-to-br from-muted to-background',
      borderColor: 'border-muted',
      image: judePointing,
      subtitle: 'La prochaine sera la bonne!'
    };
  };

  const resultConfig = getResultConfig();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Result header with Jude */}
      <Card className={cn("border-2 overflow-hidden relative", resultConfig.bg, resultConfig.borderColor)}>
        <CardContent className="py-8 text-center relative">
          {/* Trophy icon for context */}
          <Trophy className={cn(
            "w-12 h-12 mx-auto mb-4",
            isWinner ? "text-yellow-500" : "text-muted-foreground/50"
          )} />
          
          <h1 className={cn("text-3xl font-bold mb-2", resultConfig.color)}>
            {resultConfig.text}
          </h1>
          
          <p className="text-muted-foreground text-sm">
            {resultConfig.subtitle}
          </p>

          {/* Jude character image - positioned in corner */}
          <img 
            src={resultConfig.image} 
            alt="Jude" 
            className={cn(
              "absolute -right-2 -top-2 w-24 h-28 object-contain pointer-events-none",
              isWinner && "animate-bounce"
            )}
          />
        </CardContent>
      </Card>

      {/* Score comparison */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* My score - show rounds won for synchronized mode */}
            <div className={cn(
              "text-center p-4 rounded-xl",
              isWinner ? "bg-success/10 ring-2 ring-success" : "bg-muted"
            )}>
              <div className="text-4xl font-bold text-foreground">
                {myResult.roundsWon !== undefined ? myRoundsWon : myResult.score + '%'}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {myResult.roundsWon !== undefined ? 'Manches gagnées' : 'Toi'}
              </div>
              <div className="text-xs text-muted-foreground">
                {myResult.correctAnswers}/{myResult.totalQuestions} correct
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
              <div className="text-4xl font-bold text-foreground">
                {myResult.roundsWon !== undefined ? opponentRoundsWon : (opponentResult?.score || 0) + '%'}
              </div>
              <div className="text-sm text-muted-foreground mt-1 truncate max-w-[80px] mx-auto">
                {opponent?.nickname || 'Adversaire'}
              </div>
              <div className="text-xs text-muted-foreground">
                {opponentResult?.correctAnswers || 0}/{myResult.totalQuestions} correct
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
