import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  RefreshCw, 
  Home, 
  Zap,
  Target,
  Star,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BattleResult } from '@/pages/QuizBattleSolo';
import { useEffect } from 'react';

// Jude/Eric images for different result states
import judeCelebrating from '@/assets/eric-celebrating.png';
import judeThinking from '@/assets/eric-thinking-pose.png';
import judeSad from '@/assets/eric-404.png';

interface OpponentProgress {
  score: number;
  correctAnswers: number;
  finished: boolean;
}

interface MultiplayerResultsProps {
  myResult: BattleResult;
  opponentResult: OpponentProgress | null;
  opponent: { id: string; nickname: string; avatar_url: string | null } | null;
  myProfile?: { nickname: string; avatar_url: string | null };
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const MultiplayerResults = ({
  myResult,
  opponentResult,
  opponent,
  myProfile,
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
      image: judeSad,
      subtitle: 'La prochaine sera la bonne!'
    };
  };

  const resultConfig = getResultConfig();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBackToMenu}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground -mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au jeu
      </Button>

      {/* Result header with Jude */}
      <Card className={cn("border-2 overflow-hidden relative", resultConfig.bg, resultConfig.borderColor)}>
        <CardContent className="py-8 text-center relative">
          {/* Jude character image - centered as main icon */}
          <img 
            src={resultConfig.image} 
            alt="Jude" 
            className="w-20 h-24 mx-auto mb-4 object-contain"
          />
          
          <h1 className={cn("text-3xl font-bold mb-2", resultConfig.color)}>
            {resultConfig.text}
          </h1>
          
          <p className="text-muted-foreground text-sm">
            {resultConfig.subtitle}
          </p>
        </CardContent>
      </Card>

      {/* Score comparison - Clean avatar-based design */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-6">
            {/* My score */}
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl flex-1 max-w-[140px]",
              isWinner ? "bg-success/10 ring-2 ring-success" : "bg-muted/50"
            )}>
              <Avatar className="h-14 w-14 mb-2 ring-2 ring-offset-2 ring-offset-background ring-primary">
                <AvatarImage src={myProfile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg font-bold">
                  {myProfile?.nickname?.[0]?.toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground mb-1 font-medium truncate max-w-[100px]">
                {myProfile?.nickname || 'Toi'}
              </span>
              <div className={cn(
                "text-4xl font-bold",
                isWinner ? "text-success" : "text-foreground"
              )}>
                {myRoundsWon}
              </div>
              <span className="text-xs text-muted-foreground">manches</span>
            </div>

            {/* VS divider */}
            <div className="text-xl font-bold text-muted-foreground">VS</div>

            {/* Opponent score */}
            <div className={cn(
              "flex flex-col items-center p-4 rounded-xl flex-1 max-w-[140px]",
              isLoser ? "bg-success/10 ring-2 ring-success" : "bg-muted/50"
            )}>
              <Avatar className="h-14 w-14 mb-2 ring-2 ring-offset-2 ring-offset-background ring-muted-foreground">
                <AvatarImage src={opponent?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">{opponent?.nickname?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground mb-1 font-medium truncate max-w-[100px]">
                {opponent?.nickname || 'Adversaire'}
              </span>
              <div className={cn(
                "text-4xl font-bold",
                isLoser ? "text-success" : "text-foreground"
              )}>
                {opponentRoundsWon}
              </div>
              <span className="text-xs text-muted-foreground">manches</span>
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
