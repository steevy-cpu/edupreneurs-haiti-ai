import React from 'react';
import { Trophy, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChessEloWidgetProps {
  elo: number;
  streak: number;
  recentChange?: number;
  onClick?: () => void;
  className?: string;
}

export const getEloLevel = (elo: number): { name: string; color: string; icon: string; bgClass: string } => {
  if (elo < 600) return { name: 'Débutant', color: 'text-slate-500', icon: '🌱', bgClass: 'bg-slate-100 dark:bg-slate-800' };
  if (elo < 800) return { name: 'Apprenti', color: 'text-green-500', icon: '📚', bgClass: 'bg-green-100 dark:bg-green-900/30' };
  if (elo < 1000) return { name: 'Joueur', color: 'text-blue-500', icon: '♟️', bgClass: 'bg-blue-100 dark:bg-blue-900/30' };
  if (elo < 1200) return { name: 'Tacticien', color: 'text-purple-500', icon: '🎯', bgClass: 'bg-purple-100 dark:bg-purple-900/30' };
  if (elo < 1400) return { name: 'Stratège', color: 'text-orange-500', icon: '🧠', bgClass: 'bg-orange-100 dark:bg-orange-900/30' };
  if (elo < 1600) return { name: 'Expert', color: 'text-red-500', icon: '💪', bgClass: 'bg-red-100 dark:bg-red-900/30' };
  return { name: 'Maître', color: 'text-yellow-500', icon: '👑', bgClass: 'bg-yellow-100 dark:bg-yellow-900/30' };
};

const ChessEloWidget: React.FC<ChessEloWidgetProps> = ({
  elo,
  streak,
  recentChange,
  onClick,
  className
}) => {
  const level = getEloLevel(elo);
  
  const getTrendIcon = () => {
    if (!recentChange || recentChange === 0) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (recentChange > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    return <TrendingDown className="w-3 h-3 text-red-500" />;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-2 sm:p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md",
        level.bgClass,
        "border-border/50",
        className
      )}
    >
      {/* ELO Score */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-bold text-lg">{elo}</span>
        </div>
        {recentChange !== undefined && recentChange !== 0 && (
          <span className={cn(
            "text-xs font-medium flex items-center gap-0.5",
            recentChange > 0 ? "text-green-500" : "text-red-500"
          )}>
            {getTrendIcon()}
            {recentChange > 0 ? '+' : ''}{recentChange}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border/50" />

      {/* Level Badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg">{level.icon}</span>
        <span className={cn("text-sm font-medium hidden sm:inline", level.color)}>
          {level.name}
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-sm">{streak}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChessEloWidget;
